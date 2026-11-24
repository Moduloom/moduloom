import {mkdir,writeFile,copyFile,readdir} from 'node:fs/promises';
import {resolve,relative,join} from 'node:path';
import {build} from 'vite';
import {loadConfig,standaloneConfig,packageRoot} from './vite';
import type {FrameConfig} from './index';
export {loadConfig};
export async function buildWorkspace(config:FrameConfig,root:string,onOutput?:(files:string[])=>void){const output=resolve(root,config.outDir??'dist/frame'),path=relative(root,output);if(!path||path.startsWith('..')||path.includes(':'))throw new Error('输出目录必须位于当前项目内');const vite=await standaloneConfig(config,root);const result=await build(vite);
 // 仅登记本次构建实际产出的文件，供归档方按名单 hash/ZIP；历史产物不进入名单。
 const emitted=new Set<string>();for(const chunk of (Array.isArray(result)?result:[result]))for(const asset of chunk.output)if(typeof asset?.fileName==='string')emitted.add(asset.fileName);
 if(typeof vite.publicDir==='string'){const walk=async(directory:string,prefix:string)=>{for(const item of await readdir(directory,{withFileTypes:true})){const file=join(directory,item.name);if(item.isDirectory())await walk(file,prefix+item.name+'/');else emitted.add(prefix+item.name)}};await walk(vite.publicDir,'')}
 await mkdir(output,{recursive:true});const entries=[];for(const library of config.libraries){if(library.plugin&&!config.plugins?.some(plugin=>plugin.key===library.plugin&&plugin.enabled))continue;const {pathToFileURL}=await import('node:url');const module=await import(pathToFileURL(resolve(root,library.catalog)).href);entries.push(...module.catalog.map(({props,fields,...entry}:any)=>({...entry,libraryKey:library.key,defaults:props,parameters:fields})))}await writeFile(join(output,'components.json'),JSON.stringify(entries,null,2));await copyFile(resolve(packageRoot,'AGENTS.md'),join(output,'AGENTS.md'));await writeFile(join(output,'README.md'),'# '+(config.name??'Loom-Frame')+'\n\n本目录是已构建的静态网页。将整个目录作为 HTTP/HTTPS 站点根目录提供，保留 index.html、preview.html 和 assets 的相对位置。普通 Web 预览不需要 Rust 或 Node 后端；直接使用 file:// 打开不受支持。\n\n配置保存在当前浏览器的站点数据中。可选的原生插件需要由接入项目另外提供运行时代理。\n');for(const file of ['components.json','AGENTS.md','README.md'])emitted.add(file);onOutput?.([...emitted].sort());return output}
