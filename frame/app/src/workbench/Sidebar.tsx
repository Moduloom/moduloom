import {IconButton,SearchField,Collapse as TreeBranch,Pressable,OverlayScrollArea} from 'loom-frame/ui';
// @refresh reset
import { useEffect, useState } from 'react';
import { Search, ChevronDown, Star, Moon, Sun, X } from 'lucide-react';
import type {Entry} from '../catalog';
import { componentKinds } from '../component-kinds';
import type { Configuration } from './storage';
import { useHoverPreview } from './useHoverPreview';


import { directoryGroups } from './component-order';
export function Sidebar({selected,onSelect,onSaved,onClose,shellDark,onShellMode,inventory,libraryRegistered,previewScope,getPreview,onManageComponents,active=true,availableCount=inventory.length}: {selected:string;onSelect:(entry:Entry)=>void;onSaved:()=>void;onClose:()=>void;shellDark:boolean;onShellMode:()=>void;inventory:Entry[];libraryRegistered:boolean;previewScope:string;getPreview:(entry:Entry)=>Configuration;onManageComponents:()=>void;active?:boolean;availableCount?:number}) {
  const hoverPreview=useHoverPreview(previewScope,getPreview,active);
  const [query,setQuery]=useState('');
  const [searchCollapsed,setSearchCollapsed]=useState<string[]>([]);
  const searching=Boolean(query.trim());
  const changeQuery=(value:string)=>{hoverPreview.dismiss();setQuery(value);setSearchCollapsed([])};
  const [expanded,setExpanded]=useState<string[]>(['basic','composite']);
  const [expandedGroups,setExpandedGroups]=useState<string[]>(()=>{const entry=inventory.find(e=>e.id===selected);return entry?[entry.kind+':'+entry.group]:[]});
  useEffect(()=>{const entry=inventory.find(e=>e.id===selected);if(!entry)return;setExpanded(previous=>previous.includes(entry.kind)?previous:[...previous,entry.kind]);const key=entry.kind+':'+entry.group;setExpandedGroups(previous=>previous.includes(key)?previous:[...previous,key]);setSearchCollapsed(previous=>previous.filter(value=>value!==entry.kind&&value!==key))},[selected,inventory]);
  const toggle=(key:string,previous:string[])=>previous.includes(key)?previous.filter(value=>value!==key):[...previous,key];
  const availableGroups=directoryGroups(inventory);
  const found=inventory.filter(e=>[e.name,e.label,e.id,e.group,...(e.aliases??[]),...(e.legacyIds??[])].join(' ').toLowerCase().includes(query.toLowerCase().trim()));
  const renderItem = (entry: Entry) => {
    const direct = entry.directoryLevel === 'kind';
    const item = <Pressable type="button" className="tree-item" key={entry.id}
      aria-current={entry.id === selected ? 'page' : undefined}
      onClick={() => {hoverPreview.dismiss(); onSelect(entry);}}>
      <span className="tree-dot"/><span>{direct ? entry.label : entry.name}</span>
      {!direct && entry.name !== entry.label && <span className="tree-item-label">{entry.label}</span>}
    </Pressable>;
    return direct ? item : hoverPreview.wrap(entry, item);
  };
  return <aside className="sidebar"><div className="sidebar-heading"><span>组件</span><span className="count-pill">{inventory.length}</span><span className="sidebar-close"><IconButton label="关闭组件目录" onClick={onClose}><X/></IconButton></span></div><div className="sidebar-search"><SearchField mode="compact" label="搜索组件" placeholder="搜索名称或 ID…" clearLabel="清空搜索" value={query} onValueChange={changeQuery}/></div>
    <OverlayScrollArea areaClassName="workbench-scroll"><nav className="component-tree" aria-label="组件目录">{componentKinds.map(({value:kind,label})=>{
      const items=found.filter(e=>e.kind===kind);if(!items.length)return null;
      const open=searching?!searchCollapsed.includes(kind):expanded.includes(kind);
      return <section key={kind} className="tree-kind-section" aria-label={label+'组件'}>
        <Pressable className="tree-group tree-kind" type="button" aria-expanded={open} onClick={()=>searching?setSearchCollapsed(previous=>toggle(kind,previous)):setExpanded(previous=>toggle(kind,previous))}><ChevronDown className={open?'':'is-closed'}/><span>{label}</span><span>{items.length}</span></Pressable>
        <TreeBranch open={open}><div className="tree-categories">
          {items.filter(entry => entry.directoryLevel === 'kind').map(renderItem)}
          {availableGroups.map(group=>{
          const components=items.filter(entry=>entry.directoryLevel!=='kind'&&entry.group===group);if(!components.length)return null;
          const key=kind+':'+group,groupOpen=searching?!searchCollapsed.includes(key):expandedGroups.includes(key);
          return <section key={key} aria-label={label+' · '+group}>
            <Pressable type="button" className="tree-group tree-category" aria-expanded={groupOpen} onClick={()=>searching?setSearchCollapsed(previous=>toggle(key,previous)):setExpandedGroups(previous=>toggle(key,previous))}><ChevronDown className={groupOpen?'':'is-closed'}/><span>{group}</span><span>{components.length}</span></Pressable>
            <TreeBranch open={groupOpen}><div className="tree-items">{components.map(renderItem)}</div></TreeBranch>
          </section>;
        })}</div></TreeBranch>
      </section>;
    })}{!found.length&&<div className="search-empty"><Search/><p>{inventory.length?'没有找到组件':availableCount?'这个主题还没有组件':libraryRegistered?'此库暂无组件':'尚未接入组件库'}</p>{(inventory.length>0||availableCount>0)&&<Pressable type="button" onClick={()=>inventory.length?changeQuery(''):onManageComponents()}>{inventory.length?'清空搜索':'选择组件'}</Pressable>}</div>}</nav></OverlayScrollArea>
    <footer className="sidebar-footer"><Pressable type="button" onClick={onSaved}><Star/><span>已保存配置</span></Pressable><div className="sidebar-utilities"><IconButton label={shellDark?'工作台切换浅色':'工作台切换深色'} onClick={onShellMode}>{shellDark?<Sun/>:<Moon/>}</IconButton></div></footer>
  </aside>;
}
