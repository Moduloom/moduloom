import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash} from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
import {build} from 'esbuild';
import ts from 'typescript';
const run=promisify(execFile),root=fileURLToPath(new URL('../..',import.meta.url));
process.chdir(root);
const packageSource=resolve('frame'),output=join(packageSource,'dist');
await mkdir(output,{recursive:true});
// Package compiled assets from the independent UI library; consumers install only Frame.
const uiRoot=resolve('webui'),uiOutput=join(output,'ui');
await mkdir(uiOutput,{recursive:true});
for(const file of ['index.js','styles.css'])await copyFile(join(uiRoot,'dist/components',file),join(uiOutput,file));
ts.createProgram([join(uiRoot,'src/index.ts')],{declaration:true,emitDeclarationOnly:true,outDir:join(uiOutput,'types'),rootDir:join(uiRoot,'src'),target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,skipLibCheck:true,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}).emit();
await build({entryPoints:{index:join(packageSource,'src/index.ts'),cli:join(packageSource,'src/cli.ts'),builder:join(packageSource,'src/builder.ts'),vite:join(packageSource,'src/vite.ts')},outdir:output,bundle:true,platform:'node',format:'esm',target:'node22',packages:'external',outExtension:{'.js':'.mjs'}});
const program=ts.createProgram([join(packageSource,'src/index.ts'),join(packageSource,'src/vite.ts')],{declaration:true,emitDeclarationOnly:true,outDir:join(output,'types'),rootDir:packageSource,target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,moduleResolution:ts.ModuleResolutionKind.Bundler,skipLibCheck:true,jsx:ts.JsxEmit.ReactJSX,allowImportingTsExtensions:true});program.emit();
await writeFile(join(output,'client.d.ts'),"import type {Entry,Props} from './types/src/index';\nexport declare function runtimeUrl(plugin:string,path?:string):string;\nexport declare const frameSettings:{name:string;base:string;storageNamespace:string};\nexport declare function usageCode(entry:Entry,props:Props):string;\n");
const {buildWorkspace,loadConfig}=await import(pathToFileURL(join(output,'builder.mjs')).href);let manifest:string[]=[];const webOutput=await buildWorkspace(await loadConfig(root),root,(files)=>{manifest=files});
// 仅对本次构建名单内的文件生成校验与归档，dist/frame 中保留的历史 hash 资源不进入新 ZIP。
const hashes:string[]=[];for(const file of manifest)hashes.push(createHash('sha256').update(await readFile(join(webOutput,file))).digest('hex')+'  '+file);await writeFile(join(webOutput,'SHA256SUMS.txt'),hashes.join('\n')+'\n');
const manager=process.env.npm_execpath?.includes('pnpm')?process.env.npm_execpath:resolve(process.execPath,'../node_modules/pnpm/bin/pnpm.cjs');
await run(process.execPath,[manager,'pack','--pack-destination',resolve('dist')],{cwd:packageSource,windowsHide:true,env:{...process.env,npm_config_ignore_scripts:'true'},maxBuffer:1000000});
const zipFiles:{name:string;data:Buffer}[]=[];for(const file of [...manifest,'SHA256SUMS.txt'])zipFiles.push({name:'loom-frame/'+file,data:await readFile(join(webOutput,file))});
const crcTable=Array.from({length:256},(_,value)=>{for(let n=0;n<8;n++)value=value&1?0xedb88320^(value>>>1):value>>>1;return value>>>0});const locals:Buffer[]=[],directory:Buffer[]=[];let offset=0;
for(const file of zipFiles){let crc=0xffffffff;for(const byte of file.data)crc=crcTable[(crc^byte)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;const name=Buffer.from(file.name),compressed=deflateRawSync(file.data),header=Buffer.alloc(30),central=Buffer.alloc(46);header.writeUInt32LE(0x04034b50);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(file.data.length,22);header.writeUInt16LE(name.length,26);central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(file.data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);locals.push(header,name,compressed);directory.push(central,name);offset+=header.length+name.length+compressed.length;}
const central=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(zipFiles.length,8);end.writeUInt16LE(zipFiles.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);await writeFile(resolve('dist/loom-frame-web.zip'),Buffer.concat([...locals,central,end]));
console.log('Loom-Frame web: '+webOutput+'\nLoom-Frame npm: '+resolve('dist/loom-frame-0.1.0.tgz'));

const distributables=['loom-frame-web.zip','loom-frame-0.1.0.tgz'];await writeFile(resolve('dist/loom-frame-SHA256SUMS.txt'),(await Promise.all(distributables.map(async file=>createHash('sha256').update(await readFile(resolve('dist',file))).digest('hex')+'  '+file))).join('\n')+'\n');
