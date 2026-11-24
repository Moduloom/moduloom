import {preferences} from '../client';
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import { type Entry, type Props } from '../catalog';
import { normalizeTheme, type Theme, type ThemeProfile } from '../../shared/theme-schema.ts';
import type { Configuration } from './storage';
import {legacyEntryIds,legacyProfileIds} from '../library-registry';
type Draft={key:string;props:Props;overrides:Partial<Theme>};
const keyFor=(profileId:string,id:string)=>'frame.theme-draft.'+profileId+'.'+id;
export function themeOverrides(theme:Theme,base:Theme):Partial<Theme> {return Object.fromEntries(Object.keys(base).filter(key=>key!=='mode'&&theme[key as keyof Theme]!==base[key as keyof Theme]).map(key=>[key,theme[key as keyof Theme]]))}
function read(entry:Entry,profile:ThemeProfile):Draft {
  const key=keyFor(profile.id,entry.id);
  for(const profileId of legacyProfileIds(profile.id,profile.libraryKey))for(const id of legacyEntryIds(entry))try{const stored=JSON.parse(preferences.getItem(keyFor(profileId,id))||'null');if(stored&&stored.props&&stored.overrides){normalizeTheme({...profile.styles.light,...stored.overrides,mode:'light'});return {key,props:{...structuredClone(entry.props),...stored.props},overrides:stored.overrides}}}catch{}
  if(profile.id==='default')for(const id of [entry.id,...(entry.legacyIds??[])])try{const legacy=JSON.parse(preferences.getItem('frame.draft.'+id)||'null');if(legacy?.props)return {key,props:{...structuredClone(entry.props),...legacy.props},overrides:{}}}catch{}
  return {key,props:structuredClone(entry.props),overrides:{}};
}
export function resolvedTokens(profile:ThemeProfile,mode:Theme['mode']) {return Object.fromEntries(Object.entries(profile.tokens).map(([key,t])=>[key,t[mode]]))}
export function previewConfiguration(entry:Entry,profile:ThemeProfile,mode:Theme['mode']):Configuration {const draft=read(entry,profile);return {componentId:entry.id,props:draft.props,theme:{...profile.styles[mode],...draft.overrides,mode},tokens:resolvedTokens(profile,mode)}}
export function useThemeConfiguration(entry:Entry,profile:ThemeProfile,mode:Theme['mode']) {
  const key=keyFor(profile.id,entry.id);
  const [draft,setDraft]=useState(()=>read(entry,profile));
  let current=draft;
  if(draft.key!==key){current=read(entry,profile);setDraft(current)}
  const config=useMemo<Configuration>(()=>({componentId:entry.id,props:current.props,theme:{...profile.styles[mode],...current.overrides,mode},tokens:resolvedTokens(profile,mode)}),[entry.id,current.props,current.overrides,profile.styles,profile.tokens,mode]);
  useEffect(()=>{if(draft.key===key)try{preferences.setItem(key,JSON.stringify({props:draft.props,overrides:draft.overrides}))}catch{}},[draft,key]);
  const setConfig=useCallback((value:SetStateAction<Configuration>)=>setDraft(previous=>{
    const resolved={componentId:entry.id,props:previous.key===key?previous.props:structuredClone(entry.props),theme:{...profile.styles[mode],...(previous.key===key?previous.overrides:{}),mode}};
    const next=typeof value==='function'?value(resolved):value;
    return {key:keyFor(profile.id,next.componentId),props:next.props,overrides:themeOverrides(next.theme,profile.styles[next.theme.mode])};
  }),[entry.id,key,profile.id,profile.styles,mode]);
  return [config,setConfig] as const;
}
