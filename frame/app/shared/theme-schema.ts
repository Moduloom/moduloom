export type Theme = { mode:'light'|'dark'; accent:string; surface:string; text:string; muted:string; border:string; radius:number; fontSize:number; motion:number; borderWidth:number; shadow:'soft'|'none' };
export type DesignToken={label:string;group:string;light:string;dark:string};
export type ComponentVariant={id:string;name:string;props:Record<string,unknown>;style:Partial<Theme>};
export type ThemeProfile={id:string;name:string;libraryKey:string;styles:Record<'light'|'dark',Theme>;defaults:Record<'light'|'dark',Theme>;componentIds:string[];catalogIds?:string[];tokens:Record<string,DesignToken>;variants:Record<string,ComponentVariant[]>};
export type ThemeDocument={version:2;profiles:ThemeProfile[];archived:ThemeProfile[]};
export const validComponentId=(id:unknown):id is string=>typeof id==='string'&&/^[a-z][a-z0-9-]{0,79}:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
export function normalizeTheme(value:unknown):Theme {
  if(!value||typeof value!=='object')throw new Error('样式参数格式不正确。');
  const t={borderWidth:1,shadow:'soft',...value} as Theme;
  if(!['light','dark'].includes(t.mode)||!['accent','surface','text','muted','border'].every(k=>/^#[0-9a-f]{6}$/i.test(String(t[k as keyof Theme])))||!['radius','fontSize','motion','borderWidth'].every(k=>Number.isFinite(t[k as keyof Theme]))||t.radius<0||t.radius>24||t.fontSize<12||t.fontSize>24||t.motion<0||t.motion>600||t.borderWidth<0||t.borderWidth>6||!['soft','none'].includes(t.shadow))throw new Error('样式参数格式不正确。');
  return Object.fromEntries(['mode','accent','surface','text','muted','border','radius','fontSize','motion','borderWidth','shadow'].map(k=>[k,t[k as keyof Theme]])) as Theme;
}
export function validTokenValue(value:unknown):value is string {return typeof value==='string'&&value.length>0&&value.length<=1000&&!/[;{}<>]/.test(value)}
export function normalizeThemeDocument(value:unknown):ThemeDocument {
  const data=value as ThemeDocument;
  if(!data||data.version!==2||!Array.isArray(data.profiles)||!data.profiles.length||!Array.isArray(data.archived||[]))throw new Error('组件库主题配置格式不正确。');
  const ids=new Set<string>();
  const normalize=(p:ThemeProfile):ThemeProfile=>{
    if(!p||typeof p.id!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(p.id)||ids.has(p.id)||typeof p.libraryKey!=='string'||!/^[-a-zA-Z0-9]{1,80}$/.test(p.libraryKey)||typeof p.name!=='string'||!p.name.trim()||p.name.length>50||!Array.isArray(p.componentIds)||p.componentIds.some(id=>!validComponentId(id)))throw new Error('组件库主题配置格式不正确。');
    ids.add(p.id);
    const styles={light:normalizeTheme(p.styles?.light),dark:normalizeTheme(p.styles?.dark)};
    const defaults={light:normalizeTheme(p.defaults?.light||styles.light),dark:normalizeTheme(p.defaults?.dark||styles.dark)};
    if(styles.light.mode!=='light'||styles.dark.mode!=='dark'||defaults.light.mode!=='light'||defaults.dark.mode!=='dark')throw new Error('明暗配置不正确。');
    const tokens:Record<string,DesignToken>={};
    for(const [key,t] of Object.entries(p.tokens||{})){if(!/^--[-a-zA-Z0-9]+$/.test(key)||!t||typeof t.label!=='string'||!t.label.trim()||typeof t.group!=='string'||!validTokenValue(t.light)||!validTokenValue(t.dark))throw new Error('设计变量格式不正确。');tokens[key]={label:t.label.trim(),group:t.group,light:t.light,dark:t.dark}}
    const variants:Record<string,ComponentVariant[]>={};
    for(const [componentId,list] of Object.entries(p.variants||{})){if(!validComponentId(componentId)||!Array.isArray(list))throw new Error('组件变体格式不正确。');const variantIds=new Set<string>();variants[componentId]=list.map(v=>{if(!v||typeof v.id!=='string'||variantIds.has(v.id)||typeof v.name!=='string'||!v.name.trim()||v.name.length>50||!v.props||typeof v.props!=='object'||Array.isArray(v.props))throw new Error('组件变体格式不正确。');variantIds.add(v.id);normalizeTheme({...styles.light,...v.style,mode:'light'});return {id:v.id,name:v.name.trim(),props:v.props,style:v.style||{}}})}
    if(p.catalogIds!==undefined&&(!Array.isArray(p.catalogIds)||p.catalogIds.some(id=>!validComponentId(id))))throw new Error('组件库清单格式不正确。');
    return {id:p.id,name:p.name.trim(),libraryKey:p.libraryKey,styles,defaults,componentIds:[...new Set(p.componentIds)],...(p.catalogIds?{catalogIds:[...new Set(p.catalogIds)]}:{}),tokens,variants};
  };
  return {version:2,profiles:data.profiles.map(p=>normalize(p)),archived:(data.archived||[]).map(p=>normalize(p))};
}
