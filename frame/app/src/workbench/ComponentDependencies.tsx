import {Fragment,type MouseEvent} from 'react';
import type {Entry} from '../catalog';

export function ComponentDependencies({entries,onNavigate}:{entries:Entry[];onNavigate:(entry:Entry)=>void}){
  const follow=(event:MouseEvent<HTMLAnchorElement>,entry:Entry)=>{
    if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    event.preventDefault();onNavigate(entry);
  };
  return <div className="component-dependencies" aria-label="已用到的基础组件">
    <span className="component-dependencies-label">已用到的基础组件</span>
    <div className="component-dependency-list">{entries.length?entries.map(entry=><a key={entry.id} className="component-dependency-link" href={'#'+encodeURIComponent(entry.id)} title={entry.name+' · '+entry.label} onClick={event=>follow(event,entry)}>{entry.name.split(/(?=[A-Z][a-z])/).map((part,index)=><Fragment key={index}>{index>0&&<wbr/>}{part}</Fragment>)}</a>):<span className="component-dependencies-empty">—</span>}</div>
  </div>;
}
