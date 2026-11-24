import { Component, useEffect, useLayoutEffect, useState, useRef, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Entry, Props, Value } from './catalog';
import { libraries, libraryEntries, loadLibraryRenderer, libraryOptions, type LibraryRenderer } from './library-registry';
import { defaultThemes, type Theme } from './theme';

import { usePreviewHighlight } from './usePreviewHighlight';
import './preview.css';
class Boundary extends Component<{children:ReactNode;resetKey:string},{failed:boolean}> {
  state={failed:false}; static getDerivedStateFromError(){return{failed:true}}
  componentDidUpdate(previous:Readonly<{children:ReactNode;resetKey:string}>){if(previous.resetKey!==this.props.resetKey&&this.state.failed)this.setState({failed:false})}
  render(){return this.state.failed?<div className="preview-error"><p>这组参数无法显示组件。</p><p>请检查列表内容，或恢复默认参数。</p></div>:this.props.children}
}
function Preview() {
  type RenderState={entry:Entry;props:Props;theme:Theme;tokens:Record<string,string>;libraryKey:string;renderer:LibraryRenderer;scene:boolean;playback:number};
  const [state,setState]=useState<RenderState|null>(null),[failure,setFailure]=useState(''),[highlight,setHighlight]=useState(false);
  const sequence=useRef(0),appliedTokens=useRef<string[]>([]);
  const trusted=location.origin;
  usePreviewHighlight(highlight&&libraryOptions(state?.libraryKey??'',state?.entry).highlight!==false);
  useEffect(()=>{
    let live=true;
    const render=async(data:{id:string;props?:Props;theme?:Theme;tokens?:Record<string,string>;libraryKey?:string;highlight?:boolean;scene?:boolean;playback?:number})=>{
      const request=++sequence.current,key=data.libraryKey||data.id?.split(':')[0]||'';
      const entry=libraryEntries(key).find(e=>e.id===data.id||e.legacyIds?.includes(data.id));
      if(!entry){setFailure('这个组件不在当前组件库中。');setState(null);return}
      try{const renderer=await loadLibraryRenderer(key);if(!live||request!==sequence.current)return;document.documentElement.dataset.libraryKey=key;setState({entry,props:data.props||entry.props,theme:data.theme||libraries.find(library=>library.key===key)?.defaults?.light||defaultThemes.light,tokens:data.tokens||{},libraryKey:key,renderer,scene:Boolean(data.scene),playback:Number.isSafeInteger(data.playback)?data.playback!:0});setFailure('');setHighlight(Boolean(data.highlight))}catch{if(live&&request===sequence.current){setFailure('无法加载组件预览，请重新预览。');setState(null)}}
    };
    const handle=(message:MessageEvent)=>{if(message.source===parent&&message.origin===trusted&&message.data?.type==='frame:render')void render(message.data)};
    const escape=(e:KeyboardEvent)=>{
      if(e.key!=='Escape'||e.defaultPrevented)return;
      // 原生 dialog/popover 先消费本次 Escape（cancel 在 keydown 默认行为之后触发）；
      // 仅当本文档没有接管 Esc 的原生层时才把 Escape 转发给工作台。
      if(document.querySelector('dialog[open],:popover-open'))return;
      parent.postMessage({type:'frame:escape'},trusted);
    };
    document.addEventListener('keydown',escape);window.addEventListener('message',handle);parent.postMessage({type:'frame:ready'},trusted);
    if(parent===window){const params=new URLSearchParams(location.search),key=params.get('library')||'';void render({id:params.get('id')||libraryEntries(key)[0]?.id,libraryKey:key})}
    return()=>{live=false;window.removeEventListener('message',handle);document.removeEventListener('keydown',escape)};
  },[]);
  useEffect(()=>{
    let last='',point:{x:number;y:number}|null=null;
    const send=(target:Element|null)=>{const cursor=target?getComputedStyle(target).cursor:'auto';if(cursor!==last){last=cursor;parent.postMessage({type:'frame:cursor',cursor},trusted)}};
    const move=(event:PointerEvent)=>{point={x:event.clientX,y:event.clientY};const target=event.composedPath().find(node=>node instanceof Element) as Element|undefined;send(target||null)};
    const leave=()=>{point=null;last='';parent.postMessage({type:'frame:cursor',cursor:'auto'},trusted)};
    const observer=new MutationObserver(()=>{if(point)send(document.elementFromPoint(point.x,point.y))});
    if(document.documentElement)observer.observe(document.documentElement,{attributes:true,subtree:true,childList:true,attributeFilter:['class','style','disabled','aria-disabled']});
    document.addEventListener('pointermove',move,true);document.addEventListener('pointerover',move,true);document.documentElement.addEventListener('pointerleave',leave);
    return()=>{observer.disconnect();document.removeEventListener('pointermove',move,true);document.removeEventListener('pointerover',move,true);document.documentElement.removeEventListener('pointerleave',leave)};
  },[]);
  useLayoutEffect(()=>{if(!state)return;document.documentElement.style.background=state.theme.surface;for(const key of appliedTokens.current)document.documentElement.style.removeProperty(key);state.renderer.applyTheme(state.theme,state.tokens);appliedTokens.current=Object.keys(state.tokens);document.documentElement.style.setProperty('--library-text',state.theme.text);document.documentElement.style.setProperty('--library-bg',state.theme.surface)},[state?.theme,state?.tokens,state?.renderer]);
  useEffect(()=>{if(state)parent.postMessage({type:'frame:painted'},trusted)},[state?.entry.id,state?.renderer]);
  useLayoutEffect(()=>{window.scrollTo({top:0,left:0})},[state?.entry.id,state?.scene]);
  const patch=(key:string,value:Value)=>{if(!state)return;setState(previous=>previous?{...previous,props:{...previous.props,[key]:value}}:previous);parent.postMessage({type:'frame:patch',id:state.entry.id,key,value},trusted)};
  const Renderer=state?.scene?state.renderer.renderScene:state?.renderer.render;
  return <main className="preview-root" data-wide={state?.entry.wide} data-scene={state?.scene||undefined} aria-label={(state?.entry.label||'组件')+(state?.scene?'使用场景':'预览')}>{failure?<div className="preview-error">{failure}</div>:state&&Renderer?<Boundary resetKey={state.libraryKey+state.entry.id+state.scene+JSON.stringify(state.props)}><Renderer key={libraryOptions(state.libraryKey,state.entry).persistent?'persistent-preview':state.libraryKey+state.entry.id+state.scene+state.playback} entry={state.entry} props={state.props} theme={state.theme} highlight={highlight} playback={state.playback} onPatch={patch} onEvent={()=>{}}/></Boundary>:state?.scene?<p className="preview-error">这套组件库尚未提供使用场景。</p>:null}</main>;

}
document.documentElement.style.background='transparent';
document.documentElement.setAttribute('data-loom-motion-preview', '');
const root=import.meta.hot?.data.root ?? createRoot(document.getElementById('root')!);
if(import.meta.hot)import.meta.hot.data.root=root;
root.render(<Preview/>);
