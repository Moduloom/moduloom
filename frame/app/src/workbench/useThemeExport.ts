import { useEffect, useMemo, useState } from 'react';
import { hasThemeAdapter, loadThemeAdapter, type LibraryThemeAdapter } from '../library-registry';
import type { Theme } from '../theme';

export type ThemeExport={
  css:string;
  note:string;
  error:string;
  canExport:boolean;
};

// 主题 CSS 由各组件库的纯 themeAdapter 生成；这里只处理加载竞态与降级说明，
// 不内置任何具体库的 token 映射。
export function useThemeExport(libraryKey:string,theme:Theme,tokens:Record<string,string>|undefined):ThemeExport{
  const supported=hasThemeAdapter(libraryKey);
  const [adapter,setAdapter]=useState<{key:string;value:LibraryThemeAdapter}|null>(null);
  const [loadError,setLoadError]=useState<{key:string;message:string}|null>(null);
  useEffect(()=>{
    if(!supported){setAdapter(null);setLoadError(null);return}
    let live=true;setAdapter(null);setLoadError(null);
    loadThemeAdapter(libraryKey).then(value=>{if(live)setAdapter({key:libraryKey,value})},error=>{if(live)setLoadError({key:libraryKey,message:error instanceof Error?error.message:String(error)})});
    return()=>{live=false};
  },[libraryKey,supported]);
  return useMemo(()=>{
    const declared=tokens&&Object.keys(tokens).length?tokens:undefined;
    if(!supported){
      if(!declared)return {css:'',note:'这套组件库未提供主题映射，也没有可导出的样式变量。',error:'',canExport:false};
      return {css:tokenCss(declared),note:'这套组件库未提供主题映射，以下仅为已声明的样式变量。',error:'',canExport:true};
    }
    const failure=loadError&&loadError.key===libraryKey?loadError.message:'';
    if(failure)return {css:'',note:'',error:'加载主题导出适配失败：'+failure,canExport:false};
    if(!adapter||adapter.key!==libraryKey)return {css:'',note:'正在加载这套组件库的主题导出适配…',error:'',canExport:false};
    try{
      return {css:adapter.value.exportCss(theme,declared??{}),note:'',error:'',canExport:true};
    }catch(error){
      return {css:'',note:'',error:'生成主题 CSS 失败：'+(error instanceof Error?error.message:String(error)),canExport:false};
    }
  },[supported,loadError,adapter,libraryKey,theme,tokens]);
}

const tokenCss=(tokens:Record<string,string>)=>':root {\n'+Object.entries(tokens).map(([key,value])=>'  '+key+': '+value+';').join('\n')+'\n}';
