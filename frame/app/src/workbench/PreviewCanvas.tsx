import { useEffect, useRef } from 'react';
import type { Entry, Props, Value } from '../catalog';
import type { Theme } from '../theme';
import {libraryOptions} from '../library-registry';
import {frameSettings} from '../client';
export function PreviewCanvas({entry,props,theme,onPatch,title,highlight=false,scene=false,playback=0,libraryKey=entry.id.split(':')[0],tokens={},onReady,fillContainer=false}: {entry:Entry;props:Props;theme:Theme;onPatch?:(key:string,value:Value)=>void;title?:string;highlight?:boolean;scene?:boolean;playback?:number;libraryKey?:string;tokens?:Record<string,string>;onReady?:()=>void;fillContainer?:boolean}) {
  const viewport=libraryOptions(libraryKey,entry).viewport;
  const ref=useRef<HTMLIFrameElement>(null);
  const initialId=useRef(entry.id);
  const latest=useRef({entry,props,theme,highlight,scene,playback,libraryKey,tokens});latest.current={entry,props,theme,highlight,scene,playback,libraryKey,tokens};
  const send=()=>{const c=latest.current;ref.current?.contentWindow?.postMessage({type:'frame:render',id:c.entry.id,props:c.props,theme:c.theme,highlight:c.highlight,scene:c.scene,playback:c.playback,libraryKey:c.libraryKey,tokens:c.tokens},location.origin)};
  useEffect(()=>{const receive=(e:MessageEvent)=>{if(e.origin!==location.origin||e.source!==ref.current?.contentWindow)return;if(e.data?.type==='frame:ready')send();if(e.data?.type==='frame:painted')onReady?.();if(e.data?.type==='frame:cursor'&&typeof e.data.cursor==='string'&&e.data.cursor.length<100&&CSS.supports('cursor',e.data.cursor)){ref.current!.style.cursor=e.data.cursor;ref.current!.dataset.previewCursor=e.data.cursor}if(e.data?.type==='frame:patch'&&e.data.id===latest.current.entry.id)onPatch?.(e.data.key,e.data.value)};window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive)},[onPatch,onReady]);
  useEffect(send,[entry.id,props,theme,highlight,scene,playback,libraryKey,tokens]);
  return <iframe key={libraryKey} ref={ref} title={title||entry.label+'交互预览'} src={frameSettings.base+'preview.html?library='+encodeURIComponent(libraryKey)+'&id='+encodeURIComponent(initialId.current)} onLoad={send} onPointerLeave={()=>{if(ref.current)ref.current.style.cursor='auto'}} className="preview-frame" style={{background:theme.surface,...(viewport&&!fillContainer?{width:viewport.width,height:viewport.height,maxWidth:'none',marginInline:'auto'}:{})}}/>;
}
