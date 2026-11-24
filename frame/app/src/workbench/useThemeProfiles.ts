import {useCallback,useEffect,useRef,useState} from 'react';
import {libraries,canonicalLibraryKey,canonicalEntryId} from '../library-registry';
import {defaultThemes} from '../theme';
import {normalizeThemeDocument,type ThemeProfile,type ThemeDocument} from '../../shared/theme-schema';
import {storage} from 'virtual:frame-storage';
import {settings} from 'virtual:frame-settings';
import {preferences} from '../client';
export type {ThemeProfile,ThemeDocument};
const emptyProfile=():ThemeProfile=>({id:'unregistered',libraryKey:'unregistered',name:settings.name,styles:structuredClone(defaultThemes),defaults:structuredClone(defaultThemes),componentIds:[],tokens:{},variants:{}});
function initial():ThemeDocument{return {version:2,archived:[],profiles:libraries.length?libraries.map(l=>({id:l.key,libraryKey:l.key,name:l.name,styles:structuredClone(l.defaults??defaultThemes),defaults:structuredClone(l.defaults??defaultThemes),componentIds:l.entries.map(e=>e.id),catalogIds:l.entries.map(e=>e.id),tokens:{},variants:{}})):[emptyProfile()]}}
function mergeVariants(primary:ThemeProfile['variants'],extra:ThemeProfile['variants']):ThemeProfile['variants'] {
 return Object.fromEntries([...new Set([...Object.keys(primary),...Object.keys(extra)])].map(key=>{
  const seen=new Set<string>();
  return [key,[...(primary[key]??[]),...(extra[key]??[])].filter(variant=>{if(seen.has(variant.id))return false;seen.add(variant.id);return true})];
 }));
}
function reconcile(value:ThemeDocument){
 const next=normalizeThemeDocument(value);let migrated=false;
 const canonicalId=(id:string)=>{const current=canonicalEntryId(id);if(current!==id)migrated=true;return current};
 const groups=new Map<string,{profile:ThemeProfile;active:boolean;canonical:boolean}>();
 for(const record of [...next.profiles.map(profile=>({profile,active:true})),...next.archived.map(profile=>({profile,active:false}))]){
  const profile=record.profile,previous=profile.libraryKey,current=canonicalLibraryKey(previous),canonical=previous===current;
  if(!canonical)migrated=true;
  profile.libraryKey=current;
  if(profile.id===previous)profile.id=current;
  profile.componentIds=[...new Set(profile.componentIds.map(canonicalId))];
  if(profile.catalogIds)profile.catalogIds=[...new Set(profile.catalogIds.map(canonicalId))];
  profile.variants=Object.entries(profile.variants).reduce<ThemeProfile['variants']>((all,[id,variants])=>mergeVariants(all,{[canonicalId(id)]:variants}),{});
  const key=current+':'+profile.id,existing=groups.get(key);
  if(!existing){groups.set(key,{profile,active:record.active,canonical});continue}
  migrated=true;
  const primary=canonical&&!existing.canonical?profile:existing.profile,secondary=primary===profile?existing.profile:profile;
  existing.profile={...primary,componentIds:[...new Set([...primary.componentIds,...secondary.componentIds])],catalogIds:[...new Set([...(primary.catalogIds??primary.componentIds),...(secondary.catalogIds??secondary.componentIds)])],variants:mergeVariants(primary.variants,secondary.variants)};
  existing.active=existing.active||record.active;existing.canonical=existing.canonical||canonical;
 }
 next.profiles=[];next.archived=[];
 for(const group of groups.values())(group.active?next.profiles:next.archived).push(group.profile);
 if(libraries.length)next.profiles=next.profiles.filter(profile=>profile.libraryKey!=='unregistered');
 for(const library of libraries){
  const existing=[...next.profiles,...next.archived].filter(profile=>profile.libraryKey===library.key);
  if(!existing.length){next.profiles.push(initial().profiles.find(profile=>profile.libraryKey===library.key)!);continue}
  for(const profile of existing){
   const current=library.entries.map(entry=>entry.id),known=new Set(profile.catalogIds??profile.componentIds);
   profile.componentIds=[...new Set([...profile.componentIds.filter(id=>current.includes(id)),...current.filter(id=>!known.has(id))])];profile.catalogIds=current;
  }
 }
 return {document:next,migrated};
}
export function useThemeProfiles(){
 const [document,setDocument]=useState(initial),[activeId,setActiveId]=useState(()=>canonicalLibraryKey(preferences.getItem('active-theme')??'')),[ready,setReady]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[retry,setRetry]=useState(0);
 const dirty=useRef(false),revision=useRef(0),chain=useRef(Promise.resolve());
 useEffect(()=>{let live=true;void storage.readThemes().then(async saved=>{if(!live)return;if(saved){const next=reconcile(saved);if(next.migrated)await storage.writeThemes(next.document);if(!live)return;setDocument(next.document)}setReady(true);setError('')}).catch(()=>{if(live)setError('无法读取主题，请重试')});return()=>{live=false}},[reload]);
 useEffect(()=>{if(!ready||!dirty.current)return;const current=revision.current;chain.current=chain.current.catch(()=>{}).then(()=>storage.writeThemes(document)).then(()=>{if(current===revision.current){dirty.current=false;setError('')}}).catch(()=>setError('主题尚未保存，请重试'))},[document,ready,retry]);
 const mutate=useCallback((change:(value:ThemeDocument)=>ThemeDocument)=>{dirty.current=true;revision.current++;setDocument(change)},[]);
const fallback=initial().profiles[0];const startup=useRef(location.hash.slice(1));let requested='';try{requested=canonicalEntryId(decodeURIComponent(startup.current))}catch{}
const requestedProfile=requested?document.profiles.find(p=>p.componentIds.includes(requested)):undefined;const profile=requestedProfile??document.profiles.find(p=>p.id===activeId)??document.profiles[0]??fallback;if(ready&&requestedProfile){startup.current='';if(activeId!==profile.id)setActiveId(profile.id)}
 useEffect(()=>{preferences.setItem('active-theme',profile.id)},[profile.id]);
 const select=useCallback((id:string)=>setActiveId(id),[]);
 const update=useCallback((value:ThemeProfile)=>mutate(old=>({...old,profiles:old.profiles.map(p=>p.id===value.id?value:p)})),[mutate]);
 const add=useCallback((name:string)=>{const id=crypto.randomUUID();const source=document.profiles.find(p=>p.id===activeId)??document.profiles[0]??fallback;const value={...structuredClone(source),id,name};mutate(old=>({...old,profiles:[...old.profiles,value]}));setActiveId(id);return value},[mutate,activeId,document]);
 const archive=useCallback((id:string)=>mutate(old=>old.profiles.length<2?old:{...old,profiles:old.profiles.filter(p=>p.id!==id),archived:[...old.archived,...old.profiles.filter(p=>p.id===id)]}),[mutate]);
 const restore=useCallback((id:string)=>mutate(old=>({...old,profiles:[...old.profiles,...old.archived.filter(p=>p.id===id)],archived:old.archived.filter(p=>p.id!==id)})),[mutate]);
 return {document,profile,ready,error,retry:()=>ready?setRetry(v=>v+1):setReload(v=>v+1),select,update,add,archive,restore};
}
