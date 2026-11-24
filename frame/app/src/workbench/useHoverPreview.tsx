import { useEffect, useRef, useState, type CSSProperties, type ReactElement } from 'react';
import { HoverCard, type HoverCardHandle } from 'loom-frame/ui';
import type { Entry } from '../catalog';
import type { Configuration } from './storage';
import { PreviewCanvas } from './PreviewCanvas';

// 通用浮层（定位/延时/Escape/焦点恢复/关闭句柄）由 loom-ui HoverCard 提供；
// 这里只保留业务：条目尺寸、预览主题、painted 可见性与气泡 iframe 通信。
export function useHoverPreview(scope:string,getConfiguration:(entry:Entry)=>Configuration,enabled=true){
  const [entry,setEntry]=useState<Entry|null>(null);
  const [painted,setPainted]=useState(false);
  const [compact,setCompact]=useState(()=>typeof matchMedia==='function'&&matchMedia('(max-width:700px)').matches);
  const cardRef=useRef<HoverCardHandle|null>(null);
  const bubbleRef=useRef<HTMLDivElement|null>(null);
  useEffect(()=>{const media=matchMedia('(max-width:700px)');const update=()=>setCompact(media.matches);media.addEventListener('change',update);update();return()=>media.removeEventListener('change',update)},[]);
  const dismiss=()=>setEntry(null);
  useEffect(()=>{dismiss()},[scope,enabled]);
  useEffect(()=>{
    if(!entry)return;
    const message=(e:MessageEvent)=>{
      if(e.origin!==location.origin||e.data?.type!=='frame:escape')return;
      if(e.source===bubbleRef.current?.querySelector('iframe')?.contentWindow)cardRef.current?.dismiss({restoreFocus:true});
    };
    window.addEventListener('message',message);
    return()=>window.removeEventListener('message',message);
  },[entry]);
  const change=(item:Entry,next:boolean)=>{
    if(next){if(entry?.id!==item.id){setPainted(false);setEntry(item)}}
    else setEntry(current=>current?.id===item.id?null:current);
  };
  const wrap=(item:Entry,trigger:ReactElement)=>{
    const active=entry?.id===item.id;
    if(!active)return <HoverCard key={item.id} label={item.label+'气泡预览'} trigger={trigger} disabled={!enabled||compact} open={false} onOpenChange={next=>change(item,next)}>{null}</HoverCard>;
    const configuration=getConfiguration(item);
    const css=getComputedStyle(document.documentElement);
    const num=(name:string,fallback:number)=>{const value=parseFloat(css.getPropertyValue(name));return Number.isFinite(value)&&value>0?value:fallback};
    const icon=item.group==='图标';
    const width=Math.max(num(icon?'--w-hover-icon-size':item.wide?'--w-hover-wide-width':'--w-hover-width',320),num('--w-hover-title-width',240));
    const height=num(icon?'--w-hover-icon-size':'--w-hover-height',240);
    const style={'--hover-bg':configuration.theme.surface,'--hover-border':configuration.theme.border,'--hover-text':configuration.theme.text,'--hover-muted':configuration.theme.muted,'--hover-preview-height':height+'px',width,background:configuration.theme.surface,borderColor:configuration.theme.border,...(painted?{}:{visibility:'hidden'})} as CSSProperties;
    return <HoverCard key={item.id} ref={cardRef} label={item.label+'气泡预览'} trigger={trigger} className="component-hover-preview" style={style} side="right" align="center" offset={num('--w-hover-gap',12)} openDelay={180} closeDelay={140} disabled={!enabled||compact}
      open onOpenChange={next=>change(item,next)}>
      <div ref={bubbleRef} className="component-hover-body">
        <header className="component-hover-heading"><strong>{item.name}</strong><span>{item.label}</span></header>
        <PreviewCanvas fillContainer key={item.id} entry={item} props={configuration.props} theme={configuration.theme} onReady={()=>setPainted(true)} libraryKey={scope} tokens={configuration.tokens} title={item.label+'气泡组件'}/>
      </div>
    </HoverCard>;
  };
  return {wrap,dismiss};
}
