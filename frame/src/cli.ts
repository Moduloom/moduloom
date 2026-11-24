#!/usr/bin/env node
import {access,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createServer,preview} from 'vite';
import {loadConfig,standaloneConfig,packageRoot} from './vite';
import {buildWorkspace} from './builder';
const root=process.cwd(),[command='help',argument]=process.argv.slice(2);
try{
 if(command==='init'){const files={'frame.config.ts':"import type {FrameConfig} from 'loom-frame';\nexport default {name:'组件预览',storage:{namespace:'my-components'},libraries:[]} satisfies FrameConfig;\n",'frame/AGENTS.md':await readFile(join(packageRoot,'AGENTS.md'),'utf8')};for(const [file,content]of Object.entries(files)){const target=resolve(root,file);if(await access(target).then(()=>true,()=>false))continue;await mkdir(resolve(target,'..'),{recursive:true});await writeFile(target,content)}console.log('接入文件已准备好。')}
 else if(command==='build'){console.log(await buildWorkspace(await loadConfig(root,argument),root))}
 else if(command==='dev'||command==='open'||command==='serve'){const config=await loadConfig(root,argument),vite=await standaloneConfig(config,root);const server=command==='dev'?await createServer(vite):await preview(vite);if('listen'in server)await server.listen();server.printUrls();const close=async()=>{if('close'in server)await server.close();else await new Promise<void>(done=>server.httpServer.close(()=>done()));process.exit(0)};process.once('SIGINT',()=>void close());process.once('SIGTERM',()=>void close());if(command==='open')server.openBrowser()}
 else if(command==='lookup'){const config=await loadConfig(root);const entries=JSON.parse(await readFile(join(resolve(root,config.outDir??'dist/frame'),'components.json'),'utf8'));const found=argument?entries.filter((e:any)=>e.id===argument||e.legacyIds?.includes(argument)):entries;if(argument&&!found.length)throw new Error('未找到组件：'+argument);console.log(JSON.stringify(found,null,2))}
 else if(command==='agents')console.log(await readFile(join(packageRoot,'AGENTS.md'),'utf8'));
 else console.log('Loom-Frame\n\nloom init\nloom dev\nloom build\nloom serve\nloom open\nloom lookup <library:component>\nloom agents');
}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1}
