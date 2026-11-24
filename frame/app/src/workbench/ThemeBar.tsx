import {Button,Select,IconButton,Pressable} from 'loom-frame/ui';
import { Palette, Plus, SlidersHorizontal } from 'lucide-react';
import type { ThemeProfile } from './useThemeProfiles';
import type { ReactNode } from 'react';

export function ThemeBar({profiles,active,ready,error,onSelect,onEdit,onCreate,onRetry,leading,navigation,actions}:{profiles:ThemeProfile[];active:ThemeProfile;ready:boolean;error:string;onSelect:(id:string)=>void;onEdit:()=>void;onCreate:()=>void;onRetry:()=>void;leading?:ReactNode;navigation?:ReactNode;actions?:ReactNode}) {
  return <header className="theme-bar">{leading}{navigation&&<div className="theme-component-navigation" role="group" aria-label="切换组件">{navigation}</div>}<div className="theme-bar-title"><Palette aria-hidden="true" style={{width:'var(--lui-icon-size)',height:'var(--lui-icon-size)'}}/><span>组件库主题</span></div><div className="theme-picker" inert={!ready||undefined}><Select label="切换主题" value={active.id} options={profiles.map(p=>({value:p.id,label:p.name}))} onValueChange={onSelect}/></div><IconButton label="新建组件库主题" disabled={!ready} onClick={onCreate}><Plus/></IconButton><Button className="theme-config-action" icon={<SlidersHorizontal/>} disabled={!ready} onClick={onEdit}>主题管理</Button>{error&&<Pressable className="theme-save-error" type="button" onClick={onRetry}>{error} · 重试</Pressable>}{actions&&<div className="theme-bar-panel-actions">{actions}</div>}</header>;
}
