import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {deflateRawSync} from 'node:zlib';

export type ArchiveFile={name:string;data:Buffer};
export async function collectFiles(root:string,prefix:string,include:(path:string)=>boolean=()=>true):Promise<ArchiveFile[]>{
  const files:ArchiveFile[]=[];
  async function visit(directory:string,relative:string){
    for(const item of await readdir(directory,{withFileTypes:true})){
      const next=relative?relative+'/'+item.name:item.name;
      if(item.isSymbolicLink()||item.name==='node_modules'||item.name==='.git'||!include(next))continue;
      if(item.isDirectory())await visit(join(directory,item.name),next);
      else files.push({name:prefix+'/'+next,data:await readFile(join(directory,item.name))});
    }
  }
  await visit(root,'');return files;
}
export async function writeZip(path:string,files:ArchiveFile[]){
  const table=Array.from({length:256},(_,n)=>{for(let i=0;i<8;i++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
  const chunks:Buffer[]=[],directory:Buffer[]=[];let offset=0;
  for(const file of files){
    let crc=0xffffffff;for(const byte of file.data)crc=table[(crc^byte)&255]^(crc>>>8);crc=(crc^0xffffffff)>>>0;
    const name=Buffer.from(file.name),compressed=deflateRawSync(file.data),local=Buffer.alloc(30),central=Buffer.alloc(46);
    local.writeUInt32LE(0x04034b50);local.writeUInt16LE(20,4);local.writeUInt16LE(0x800,6);local.writeUInt16LE(8,8);local.writeUInt16LE(33,12);local.writeUInt32LE(crc,14);local.writeUInt32LE(compressed.length,18);local.writeUInt32LE(file.data.length,22);local.writeUInt16LE(name.length,26);
    central.writeUInt32LE(0x02014b50);central.writeUInt16LE(20,4);central.writeUInt16LE(20,6);central.writeUInt16LE(0x800,8);central.writeUInt16LE(8,10);central.writeUInt16LE(33,14);central.writeUInt32LE(crc,16);central.writeUInt32LE(compressed.length,20);central.writeUInt32LE(file.data.length,24);central.writeUInt16LE(name.length,28);central.writeUInt32LE(offset,42);
    chunks.push(local,name,compressed);directory.push(central,name);offset+=local.length+name.length+compressed.length;
  }
  const index=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(index.length,12);end.writeUInt32LE(offset,16);
  await mkdir(dirname(path),{recursive:true});await writeFile(path,Buffer.concat([...chunks,index,end]));
}
