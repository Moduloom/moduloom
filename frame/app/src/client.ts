import {settings} from 'virtual:frame-settings';
import {libraries} from './library-registry';
import {buildUsageCode} from '../shared/usage-code';
import type {Entry,Props} from '../shared/preview-contract';
export function runtimeUrl(plugin:string,path=''){if(!/^[a-z][a-z0-9-]*$/.test(plugin))throw new Error('无效的插件标识');return settings.base+'runtime/'+plugin+'/'+path.replace(/^\//,'')}
export const frameSettings=settings;
export const preferenceKey=(key:string)=>'loom-frame.'+settings.storageNamespace+'.'+key;
// 预览客户端插件可经 loom-frame/client 获得与工作台一致的默认用法示例生成器。
export function usageCode(entry:Entry,props:Props){return buildUsageCode(libraries,entry,props)}

export const preferences={getItem:(key:string)=>{try{return localStorage.getItem(preferenceKey(key))}catch{return null}},setItem:(key:string,value:string)=>{try{localStorage.setItem(preferenceKey(key),value)}catch{}},removeItem:(key:string)=>{try{localStorage.removeItem(preferenceKey(key))}catch{}}};
