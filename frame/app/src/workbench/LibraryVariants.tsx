import {Button,Select,Field,Input} from 'loom-frame/ui';
import { useEffect, useState } from 'react';
import { Copy, Plus, Save } from 'lucide-react';
import type { Entry, Props } from '../catalog';
import type { ComponentVariant, Theme, ThemeProfile } from '../../shared/theme-schema.ts';

import { ParameterEditor } from './ParameterEditor';
import { ThemeEditor } from './ThemeEditor';
import {PluginStyleEditor} from './PluginHost';
import { PreviewCanvas } from './PreviewCanvas';
import { resolvedTokens, themeOverrides } from './useThemeConfiguration';
export function LibraryVariants({profile,entries,mode,onChange,onCopy,initialEntry,onMode}:{profile:ThemeProfile;entries:Entry[];mode:Theme['mode'];onChange:(p:ThemeProfile)=>void;onCopy:(value:string,message:string)=>void;initialEntry?:string;onMode:(m:Theme['mode'])=>void}) {
  const [componentId,setComponentId]=useState(initialEntry||entries[0]?.id||''),[variantId,setVariantId]=useState('new');
  const entry=entries.find(e=>e.id===componentId)||entries[0];
  const [name,setName]=useState('新变体'),[props,setProps]=useState<Props>(entry?.props||{}),[style,setStyle]=useState<Partial<Theme>>({}),[message,setMessage]=useState('');
  const variants=entry?profile.variants[entry.id]||[]:[];
  const variant=variants.find(v=>v.id===variantId);
  useEffect(()=>{setName(variant?.name||'新变体');setProps(structuredClone((variant?.props||entry?.props||{}) as Props));setStyle(variant?.style||{});setMessage('')},[entry?.id,variantId]);
  if(!entry)return <div className="manager-empty">登记组件源码后，可以为这套组件库管理独立的组件变体。</div>;
  const theme={...profile.styles[mode],...style,mode};
  const duplicate=variants.some(v=>v.id!==variantId&&v.name===name.trim());
  const save=()=>{if(!name.trim()||duplicate)return;const next:ComponentVariant={id:variant?.id||crypto.randomUUID(),name:name.trim(),props,style};onChange({...profile,variants:{...profile.variants,[entry.id]:variant?[...variants.map(v=>v.id===variant.id?next:v)]:[...variants,next]}});setVariantId(next.id);setMessage('已保存变体')};
  return <div className="library-variants"><div className="variant-selectors"><Field label="组件"><Select label="变体组件" value={entry.id} options={entries.map(e=>({value:e.id,label:e.name+' · '+e.label}))} onValueChange={id=>{setComponentId(id);setVariantId('new')}}/></Field><Field label="变体"><Select label="选择变体" value={variantId} options={[{value:'new',label:'新建变体'},...variants.map(v=>({value:v.id,label:v.name}))]} onValueChange={setVariantId}/></Field><Button icon={<Plus/>} onClick={()=>setVariantId('new')}>新建变体</Button></div><div className="variant-workspace"><section className="manager-card variant-form"><Field label="变体名称"><Input aria-label="变体名称" value={name} maxLength={50} onChange={e=>setName(e.currentTarget.value)}/></Field><h3>组件参数</h3><ParameterEditor entry={entry} props={props} onChange={(key,value)=>setProps(previous=>({...previous,[key]:value}))}/><h3>变体样式</h3><PluginStyleEditor libraryKey={profile.libraryKey} theme={theme} onMode={onMode} onChange={t=>setStyle(themeOverrides(t,profile.styles[mode]))} fallback={<ThemeEditor theme={theme} defaults={profile.styles[mode]} palettes={profile.styles} onModeChange={onMode} onChange={t=>setStyle(themeOverrides(t,profile.styles[mode]))}/>}/></section><div className="variant-preview-column"><section className="canvas-section"><PreviewCanvas entry={entry} props={props} theme={theme} tokens={resolvedTokens(profile,mode)} libraryKey={profile.libraryKey} onPatch={(key,value)=>setProps(previous=>({...previous,[key]:value}))}/></section><div className="variant-actions"><Button icon={<Copy/>} onClick={()=>onCopy(JSON.stringify({componentId:entry.id,props,theme,tokens:resolvedTokens(profile,mode)},null,2),'已复制变体配置')}>复制配置</Button><Button variant="primary" icon={<Save/>} disabled={!name.trim()||duplicate} onClick={save}>保存变体</Button></div>{(duplicate||message)&&<p className="w-muted" role="status">{duplicate?'这个变体名称已经存在。':message}</p>}</div></div></div>;
}
