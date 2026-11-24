import type {IncomingMessage} from 'node:http';
import {createRequire} from 'node:module';
import {readFile,realpath} from 'node:fs/promises';
import {resolve,join,dirname,relative,basename,isAbsolute,sep} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import type {Plugin,ViteDevServer,PreviewServer,UserConfig} from 'vite';
import type {Entry,FrameConfig,FrameLibrary} from './index';
import {startPluginRuntimes} from './runtime';
export const packageRoot=fileURLToPath(new URL('..',import.meta.url));
export const appRoot=resolve(packageRoot,'app');
const slash=(value:string)=>value.replaceAll('\\','/');
export async function loadConfig(root:string,filename='frame.config.ts'):Promise<FrameConfig>{const file=resolve(root,filename);try{await readFile(file)}catch(error){if((error as NodeJS.ErrnoException).code==='ENOENT')return {libraries:[]};throw error}return (await import(pathToFileURL(file).href+'?frame='+Date.now())).default}
function routeBase(base:string){if(!base.startsWith('/')||base.includes('..')||base.includes('?')||base.includes('#'))throw new Error('开发入口 base 必须使用站内绝对路径');return base.endsWith('/')?base:base+'/'}

function guardRuntimeRequests(server:ViteDevServer|PreviewServer,base:string){
 const allowed=(request:IncomingMessage)=>{if(request.headers['sec-fetch-site']==='cross-site')return false;const origin=request.headers.origin;if(!origin)return true;try{const source=new URL(origin);return ['http:','https:'].includes(source.protocol)&&source.host===request.headers.host}catch{return false}};
 server.middlewares.use((request,response,next)=>{if(!request.url?.startsWith(base+'runtime/')||allowed(request))return next();response.writeHead(403,{'Content-Type':'text/plain; charset=utf-8'});response.end('不允许的来源')});
 server.httpServer?.prependListener('upgrade',(request,socket)=>{if(request.url?.startsWith(base+'runtime/')&&!allowed(request))socket.destroy()});
}

async function declaredPackageRoot(file:string){let directory=dirname(file);for(;;){try{await readFile(resolve(directory,'package.json'));return directory}catch{}const parent=dirname(directory);if(parent===directory)return dirname(file);directory=parent}}

const fileExists=(file:string)=>readFile(file).then(()=>true,()=>false);

// 源码工作区内开发时，把 loom-frame/ui 公共入口精确映射到 loom-ui 的 loom-source 目标；
// 发布包只含 dist/ui，检测失败即回退包内 exports，外部消费者不需要安装 loom-ui。
async function detectUiSourceLink():Promise<{entry:string;styles:string;srcRoot:string}|null>{
 if(!await fileExists(resolve(packageRoot,'src/vite.ts')))return null;
 const own=JSON.parse(await readFile(resolve(packageRoot,'package.json'),'utf8'));
 if(!own?.devDependencies?.['loom-ui'])return null;
 let workspace=dirname(packageRoot);for(;;){if(await fileExists(resolve(workspace,'pnpm-workspace.yaml')))break;const parent=dirname(workspace);if(parent===workspace)return null;workspace=parent}
 const workspaceManifest=await readFile(resolve(workspace,'pnpm-workspace.yaml'),'utf8').catch(()=>null);if(workspaceManifest===null||!/(^|\n)\s*-\s*frame\s*(\n|$)/.test(workspaceManifest))return null;
 const directory=resolve(packageRoot,'node_modules','loom-ui');
 if(!await fileExists(resolve(directory,'package.json')))return null;
 const manifest=JSON.parse(await readFile(resolve(directory,'package.json'),'utf8'));
 if(manifest?.name!=='loom-ui')return null;
 const entryTarget=manifest?.exports?.['.']?.['loom-source'],stylesTarget=manifest?.exports?.['./styles.css']?.['loom-source'];
 if(typeof entryTarget!=='string'||typeof stylesTarget!=='string')return null;
 const realFile=async(file:string)=>{try{return await realpath(file)}catch{return null}};
 const inside=(root:string,file:string)=>{const offset=relative(root,file);return Boolean(offset)&&!offset.startsWith('..'+sep)&&offset!=='..'&&!isAbsolute(offset)};
 const packageRootReal=await realFile(directory);if(!packageRootReal||!inside(workspace,packageRootReal))return null;
 const entry=await realFile(resolve(directory,entryTarget)),styles=await realFile(resolve(directory,stylesTarget)),srcRoot=await realFile(dirname(resolve(directory,entryTarget)));
 if(!entry||!styles||!srcRoot||!inside(packageRootReal,entry)||!inside(packageRootReal,styles)||!inside(packageRootReal,srcRoot))return null;
 return {entry,styles,srcRoot};
}

export async function framePlugin(config:FrameConfig,options:{root?:string;base?:string;standalone?:boolean}={}):Promise<Plugin>{
 const root=resolve(options.root??process.cwd()),base=routeBase(options.base??'/__frame/');
 const projectRequire=createRequire(resolve(root,'package.json')),ownRequire=createRequire(resolve(packageRoot,'package.json'));const dependency=(name:string)=>{try{return dirname(projectRequire.resolve(name+'/package.json'))}catch{return dirname(ownRequire.resolve(name+'/package.json'))}};
 const plugins=(config.plugins??[]).filter(p=>p.enabled===true),keys=new Set<string>();
 for(const plugin of plugins){if(!/^[a-z][a-z0-9-]*$/.test(plugin.key)||keys.has(plugin.key))throw new Error('插件 key 无效或重复：'+plugin.key);keys.add(plugin.key)}
 const prepared:(FrameLibrary&{entries:Entry[];rendererPath:string;catalogPath:string})[]=[];keys.clear();
 for(const library of config.libraries){if(!/^[a-z][a-z0-9-]*$/.test(library.key)||keys.has(library.key))throw new Error('组件库 key 无效或重复：'+library.key);keys.add(library.key);if(library.plugin){const registered=(config.plugins??[]).find(p=>p.key===library.plugin);if(!registered)throw new Error('组件库 '+library.key+' 尚未登记所需插件 '+library.plugin);if(!registered.enabled)continue;}const catalogPath=resolve(root,library.catalog),rendererPath=resolve(root,library.renderer);const module=await import(pathToFileURL(catalogPath).href+'?frame='+Date.now());if(!Array.isArray(module.catalog))throw new Error(library.catalog+' 必须导出 catalog 数组');const ids=new Set<string>();for(const entry of module.catalog){if(typeof entry.id!=='string'||!entry.id.startsWith(library.key+':')||ids.has(entry.id))throw new Error('组件 ID 无效或重复：'+entry.id);ids.add(entry.id)}const contentRoot=await declaredPackageRoot(catalogPath);const publicPath=(value:string)=>{if(!isAbsolute(value))return slash(value);const local=relative(contentRoot,value);return local.startsWith('..')?basename(value):slash(local)};prepared.push({...library,catalog:publicPath(catalogPath),renderer:publicPath(rendererPath),themeAdapter:library.themeAdapter?publicPath(resolve(root,library.themeAdapter)):undefined,packages:library.packages??[],sourceRoots:(library.sourceRoots??[]).map(publicPath),styles:library.styles?.map(publicPath),entries:module.catalog,catalogPath,rendererPath,themeAdapterPath:library.themeAdapter?resolve(root,library.themeAdapter):undefined})}
 const uiSource=await detectUiSourceLink();
 const declaredFiles=[...prepared.flatMap(l=>[l.catalogPath,l.rendererPath,...(l.themeAdapterPath?[l.themeAdapterPath]:[])]),...plugins.filter(p=>p.client).map(p=>resolve(root,p.client!))];const allowedRoots=[...new Set([root,packageRoot,...(uiSource?[uiSource.srcRoot]:[]),...await Promise.all(declaredFiles.map(declaredPackageRoot))])];
 const sourceFiles=prepared.map(l=>l.catalogPath);let command='serve',hostOutput='';let stopRuntime:(()=>Promise<void>)|undefined;
 const settings={name:config.name??'Loom-Frame',base,storageNamespace:config.storage?.namespace??createHash('sha256').update(root).digest('hex').slice(0,16)};

 return {name:'loom-frame',enforce:'pre',
 configResolved(resolved){command=resolved.command;hostOutput=resolved.build.outDir;settings.base=command==='build'&&options.standalone?resolved.base:base},
 async config(_config,environment){const proxy:Record<string,any>={};if(environment.command==='serve'){const runtimes=await startPluginRuntimes(plugins,root);stopRuntime=runtimes.stop;for(const item of runtimes.running){const prefix=base+'runtime/'+item.key;proxy[prefix]={target:item.url,ws:true,changeOrigin:true,rewrite:(path:string)=>path.slice(prefix.length),configure:(instance:any)=>{instance.on('proxyReq',(request:any)=>request.setHeader('origin',item.url));instance.on('proxyReqWs',(request:any)=>request.setHeader('origin',item.url))}}}}return {preview:{proxy},resolve:{conditions:environment.command==='serve'?['loom-source','module','browser','development|production']:undefined,dedupe:['react','react-dom'],alias:[...(uiSource&&environment.command==='serve'?[{find:/^loom-frame\/ui\/styles\.css(\?.*)?$/,replacement:slash(uiSource.styles)+'$1'},{find:/^loom-frame\/ui$/,replacement:slash(uiSource.entry)}]:[]),{find:'react',replacement:dependency('react')},{find:'react-dom',replacement:dependency('react-dom')},{find:'loom-frame/client',replacement:resolve(appRoot,'src/client.ts')}]},server:{proxy,fs:{allow:allowedRoots}}}},
 resolveId(id){if(['virtual:frame-libraries','virtual:frame-plugins','virtual:frame-settings','virtual:frame-storage'].includes(id))return '\0'+id},
 load(id){if(id==='\0virtual:frame-settings')return 'export const settings='+JSON.stringify(settings);if(id==='\0virtual:frame-storage')return 'export {storage} from '+JSON.stringify(config.storage?.adapter?slash(resolve(root,config.storage.adapter)):slash(resolve(appRoot,'src/store.ts')));if(id==='\0virtual:frame-libraries'){
   for(const file of sourceFiles)this.addWatchFile(file);
   const modules=prepared.map(({rendererPath,catalogPath,themeAdapterPath,...library})=>{
    const metadata=JSON.stringify({...library,catalogEntry:library.catalog,rendererEntry:library.renderer});
    const methods=['load:()=>import('+JSON.stringify(slash(rendererPath))+')'];
    if(themeAdapterPath)methods.push('loadThemeAdapter:()=>import('+JSON.stringify(slash(themeAdapterPath))+')');
    return '{'+metadata.slice(1,-1)+','+methods.join(',')+'}';
   });
   return 'export default ['+modules.join(',')+'];';
  }if(id==='\0virtual:frame-plugins')return 'export default ['+plugins.map(({client,runtime,...plugin})=>'{...'+JSON.stringify(plugin)+(client?',load:()=>import('+JSON.stringify(slash(resolve(root,client)))+')':'')+'}').join(',')+'];'},
 async configureServer(server){guardRuntimeRequests(server,base);server.httpServer?.once('close',()=>void stopRuntime?.());if(uiSource)server.watcher.add(uiSource.srcRoot);if(options.standalone)return;server.middlewares.use(async(req,res,next)=>{const path=req.url?.split('?')[0];if(path!==base&&path!==base+'index.html'&&path!==base+'preview.html')return next();const name=path===base+'preview.html'?'preview.html':'index.html';try{let html=await readFile(resolve(appRoot,name),'utf8');html=html.replace(/\.\/src\//g,'/@fs/'+slash(appRoot)+'/src/').replace('../assets/frame.svg','/@fs/'+slash(resolve(packageRoot,'assets/frame.svg')));html=await server.transformIndexHtml(base+name,html);res.setHeader('Content-Type','text/html; charset=utf-8');res.end(html)}catch(error){next(error)}});server.watcher.add(sourceFiles);server.watcher.on('change',file=>{if(sourceFiles.includes(file))void server.restart()})},
 async configurePreviewServer(server){guardRuntimeRequests(server,base);server.httpServer?.once('close',()=>void stopRuntime?.())},
 async closeBundle(){if(command==='serve'){await stopRuntime?.();return}if(!options.standalone){const {build}=await import('vite');const output=resolve(root,hostOutput,base.slice(1));await build(await standaloneConfig({...config,base,outDir:output},root))}},
 transformIndexHtml(html,context){if(!options.standalone&&!context.path.startsWith(base))return html;return html.replaceAll('Loom-Frame',settings.name.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!)))},
 };
}
export async function standaloneConfig(config:FrameConfig,root:string):Promise<UserConfig>{const {default:react}=await import('@vitejs/plugin-react');const {default:tailwind}=await import('@tailwindcss/vite');const rawPort=(process.env.LOOM_FRAME_PORT??'').trim();const port=rawPort===''?4321:Number(rawPort);if(!Number.isInteger(port)||port<1||port>65535)throw new Error('LOOM_FRAME_PORT 必须是 1..65535 的整数，当前值：'+rawPort);return {configFile:false,root:appRoot,cacheDir:resolve(root,'node_modules/.cache/loom-frame'),base:config.base??'./',publicDir:config.publicDir?resolve(root,config.publicDir):false,plugins:[await framePlugin(config,{root,base:'/',standalone:true}),react(),tailwind()],server:{host:'127.0.0.1',port,strictPort:true},preview:{host:'127.0.0.1',port,strictPort:true},build:{outDir:resolve(root,config.outDir??'dist/frame'),emptyOutDir:false,rollupOptions:{input:{main:resolve(appRoot,'index.html'),preview:resolve(appRoot,'preview.html')}}}}}
