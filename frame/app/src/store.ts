import type {FrameStorage,SavedConfiguration,ThemeDocument} from '../../src/index';
import {settings} from 'virtual:frame-settings';
let database:Promise<IDBDatabase>|undefined;
function open(){return database??=new Promise<IDBDatabase>((resolve,reject)=>{const request=indexedDB.open('loom-frame:'+settings.storageNamespace,1);request.onupgradeneeded=()=>{request.result.createObjectStore('documents');request.result.createObjectStore('configurations',{keyPath:'key'})};request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();database=undefined};resolve(db)};request.onerror=()=>{database=undefined;reject(request.error)};request.onblocked=()=>{database=undefined;reject(new Error('请关闭其他工作台窗口后重试'))}})}
async function transact<T>(store:string,mode:IDBTransactionMode,operation:(store:IDBObjectStore)=>IDBRequest<T>):Promise<T>{const db=await open();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);let request:IDBRequest<T>;try{request=operation(tx.objectStore(store))}catch(e){reject(e);return}tx.oncomplete=()=>resolve(request.result);tx.onabort=()=>reject(tx.error??new Error('配置未能保存'));tx.onerror=()=>reject(tx.error)})}
export const storage:FrameStorage={
 async readThemes(){return (await transact<ThemeDocument|undefined>('documents','readonly',store=>store.get('themes')))??null},
 async writeThemes(document){await transact('documents','readwrite',store=>store.put(structuredClone(document),'themes'))},
 async listConfigurations(){const all=await transact<SavedConfiguration[]>('configurations','readonly',store=>store.getAll());return all.sort((a,b)=>b.savedAt.localeCompare(a.savedAt))},
 async saveConfiguration(name,config){const record={...structuredClone(config),name:name.trim(),key:crypto.randomUUID(),savedAt:new Date().toISOString()};await transact('configurations','readwrite',store=>store.put(record));return record},
};
