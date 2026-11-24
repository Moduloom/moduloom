import {preferences} from '../client';
import {normalizeTheme,validTokenValue} from '../../shared/theme-schema';
import type {Entry,Props} from '../../shared/preview-contract';
import {storage} from 'virtual:frame-storage';
import {libraries,findLibraryEntry} from '../library-registry';
import {defaultThemes,type Theme} from '../theme';
export type Configuration={componentId:string;props:Props;theme:Theme;tokens?:Record<string,string>};
export type Saved=Configuration&{key:string;name:string;savedAt:string};
export function readPreviewTheme():Theme{try{return normalizeTheme(JSON.parse(preferences.getItem('frame.preview.theme-config')??'null'))}catch{return {...defaultThemes.light}}}
export function validateConfiguration(value:unknown):Configuration{const input=value as Configuration;const entry=input&&findLibraryEntry(input.componentId);if(!entry)throw new Error('配置中的组件不在当前组件库中。');if(!input.props||typeof input.props!=='object'||Array.isArray(input.props))throw new Error('组件参数格式不正确。');if(input.tokens&&Object.entries(input.tokens).some(([key,v])=>!/^--[-a-zA-Z0-9]+$/.test(key)||!validTokenValue(v)))throw new Error('设计变量格式不正确。');return {componentId:entry.id,props:{...structuredClone(entry.props),...input.props},theme:normalizeTheme(input.theme),...(input.tokens?{tokens:input.tokens}:{})}}
export function readDraft(id:string):Configuration{const entry=findLibraryEntry(id);if(!entry)throw new Error('组件尚未登记。');return {componentId:entry.id,props:structuredClone(entry.props),theme:readPreviewTheme()}}
export function writeDraft(config:Configuration){preferences.setItem('frame.draft.'+config.componentId,JSON.stringify(config))}
export const listSaved=async()=>(await storage.listConfigurations()).map(item=>({...item,componentId:findLibraryEntry(item.componentId)?.id??item.componentId}));
export const saveConfiguration=(name:string,config:Configuration)=>storage.saveConfiguration(name,config);
export {usageCode} from '../client';
