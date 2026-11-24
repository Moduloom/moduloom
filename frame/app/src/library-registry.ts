import configuredLibraries from 'virtual:frame-libraries';
import configuredPlugins from 'virtual:frame-plugins';
import type {Entry} from '../shared/preview-contract';
import type {ClientPlugin,FrameLibrary,FramePlugin,LibraryRenderer,LibraryThemeAdapter} from '../../src/index';
export type {LibraryRenderer,LibraryThemeAdapter,RenderProps} from '../../src/index';
export type RegisteredLibrary=FrameLibrary&{entries:Entry[];catalogEntry:string;rendererEntry:string;themeAdapterEntry?:string;load?:()=>Promise<{renderer:LibraryRenderer}>;loadThemeAdapter?:()=>Promise<{themeAdapter:LibraryThemeAdapter}>};
export type RegisteredPlugin=FramePlugin&{load?:()=>Promise<{plugin:ClientPlugin}>};
export const libraries=configuredLibraries as RegisteredLibrary[];
export const plugins=configuredPlugins as RegisteredPlugin[];
export const libraryEntries=(key:string):Entry[]=>libraries.find(l=>l.key===key)?.entries??[];
export const canonicalLibraryKey=(key:string)=>libraries.find(l=>l.key===key||l.legacyKeys?.includes(key))?.key??key;
export function canonicalEntryId(id:string){const separator=id.indexOf(':');if(separator<0)return id;const key=canonicalLibraryKey(id.slice(0,separator)),next=key+id.slice(separator);return libraries.find(l=>l.key===key)?.entries.find(e=>e.id===next||e.legacyIds?.includes(next))?.id??next}
export function legacyEntryIds(entry:Entry){const library=libraries.find(l=>l.entries.some(e=>e.id===entry.id)),ids=[entry.id,...(entry.legacyIds??[])];return [...new Set([...ids,...(library?.legacyKeys??[]).flatMap(key=>ids.map(id=>key+id.slice(id.indexOf(':'))))])]}
export function legacyProfileIds(profileId:string,key:string){return profileId===key?[profileId,...(libraries.find(l=>l.key===key)?.legacyKeys??[])]:[profileId]}
export function findLibraryEntry(id:string,key?:string):Entry|undefined{const current=canonicalEntryId(id);return libraries.filter(l=>!key||l.key===canonicalLibraryKey(key)).flatMap(l=>l.entries).find(e=>e.id===current||e.legacyIds?.includes(current)||e.name===id||e.aliases?.includes(id))}
export async function loadLibraryRenderer(key:string):Promise<LibraryRenderer>{const library=libraries.find(l=>l.key===canonicalLibraryKey(key));if(!library?.load)throw new Error('请先接入组件库的预览实现。');return (await library.load()).renderer}
export const hasThemeAdapter=(key:string)=>Boolean(libraries.find(l=>l.key===canonicalLibraryKey(key))?.loadThemeAdapter);
export async function loadThemeAdapter(key:string):Promise<LibraryThemeAdapter>{const library=libraries.find(l=>l.key===canonicalLibraryKey(key));if(!library?.loadThemeAdapter)throw new Error('这套组件库没有声明 themeAdapter，无法导出主题映射。');const module=await library.loadThemeAdapter();if(typeof module.themeAdapter?.exportCss!=='function')throw new Error('themeAdapter 模块没有导出可用的 exportCss 函数。');return module.themeAdapter}
export function libraryOptions(key:string,entry?:Entry){const library=libraries.find(l=>l.key===key);return {...library?.preview,...entry?.preview}}
export const libraryPlugin=(key:string)=>plugins.find(p=>p.key===libraries.find(l=>l.key===key)?.plugin);
