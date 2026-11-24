import {preferences} from '../client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useDrawerPresence } from 'loom-frame/ui';

const preference=(key:string)=>preferences.getItem(key)!=='false';
export function useWorkbenchPanels(sidebar:RefObject<HTMLElement|null>,inspector:RefObject<HTMLElement|null>) {
  const [sidebarPinned,setSidebarPinned]=useState(()=>preference('frame.sidebar.visible'));
  const [inspectorPinned,setInspectorPinned]=useState(()=>preference('frame.inspector.visible'));
  const [wideLeft,setWideLeft]=useState(()=>matchMedia('(min-width:701px)').matches);
  const [wideRight,setWideRight]=useState(()=>matchMedia('(min-width:981px)').matches);
  const [sidebarOpen,setSidebarOpen]=useState(false),[inspectorOpen,setInspectorOpen]=useState(false),[hoverOpen,setHoverOpen]=useState(false);
  const hoverTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const focusRequested=useRef(false);
  const editing=()=>{const active=document.activeElement;return Boolean(active&&sidebar.current?.contains(active)&&(active.matches('input,textarea,[contenteditable=true]')||active.matches(':focus-visible')))};
  const clearHover=useCallback(()=>{if(hoverTimer.current)clearTimeout(hoverTimer.current);hoverTimer.current=null},[]);
  const closeHover=useCallback(()=>{clearHover();if(sidebar.current?.contains(document.activeElement)||document.activeElement?.closest('.component-hover-preview'))document.getElementById('workbench-sidebar-toggle')?.focus({preventScroll:true});setHoverOpen(false)},[clearHover,sidebar]);
  const sidebarModal=useDrawerPresence(sidebarOpen),inspectorModal=useDrawerPresence(inspectorOpen),hoverPresent=useDrawerPresence(hoverOpen);
  const sidebarDocked=wideLeft&&sidebarPinned,inspectorDocked=wideRight&&inspectorPinned;
  const sidebarFloating=sidebarModal||hoverPresent;
  useEffect(()=>{preferences.setItem('frame.sidebar.visible',String(sidebarPinned))},[sidebarPinned]);
  useEffect(()=>{preferences.setItem('frame.inspector.visible',String(inspectorPinned))},[inspectorPinned]);
  useEffect(()=>{
    const left=matchMedia('(min-width:701px)'),right=matchMedia('(min-width:981px)');
    const update=()=>{setWideLeft(left.matches);setWideRight(right.matches);setSidebarOpen(false);setInspectorOpen(false);closeHover()};
    left.addEventListener('change',update);right.addEventListener('change',update);
    return()=>{left.removeEventListener('change',update);right.removeEventListener('change',update);clearHover()};
  },[closeHover,clearHover]);
  useLayoutEffect(()=>{
    if(!sidebarDocked&&!sidebarFloating&&sidebar.current?.contains(document.activeElement))document.getElementById('workbench-sidebar-toggle')?.focus({preventScroll:true});
    if(!inspectorDocked&&!inspectorModal&&inspector.current?.contains(document.activeElement))document.getElementById('workbench-inspector-toggle')?.focus({preventScroll:true});
  },[sidebarDocked,sidebarFloating,inspectorDocked,inspectorModal,sidebar,inspector]);
  const closeSidebar=useCallback(()=>{if(wideLeft){if(sidebar.current?.contains(document.activeElement))document.getElementById('workbench-sidebar-toggle')?.focus({preventScroll:true});setSidebarPinned(false)}setSidebarOpen(false);closeHover()},[wideLeft,closeHover,sidebar]);
  const closeInspector=useCallback(()=>{if(wideRight){if(inspector.current?.contains(document.activeElement))document.getElementById('workbench-inspector-toggle')?.focus({preventScroll:true});setInspectorPinned(false)}setInspectorOpen(false)},[wideRight,inspector]);
  const toggleSidebar=()=>{closeHover();if(wideLeft)setSidebarPinned(value=>!value);else{setInspectorOpen(false);setSidebarOpen(value=>!value)}};
  const toggleInspector=()=>{if(wideRight)setInspectorPinned(value=>!value);else{setSidebarOpen(false);closeHover();setInspectorOpen(value=>!value)}};
  const summon=(immediate=false)=>{if(sidebarDocked||sidebarModal)return;clearHover();focusRequested.current=immediate;if(immediate)setHoverOpen(true);else hoverTimer.current=setTimeout(()=>setHoverOpen(true),180)};
  const leaveHover=()=>{if(!hoverOpen)return;clearHover();hoverTimer.current=setTimeout(()=>{if(!editing())closeHover();hoverTimer.current=null},240)};
  useEffect(()=>{if(hoverOpen&&focusRequested.current){focusRequested.current=false;sidebar.current?.querySelector<HTMLInputElement>('.sidebar-search input')?.focus({preventScroll:true})}},[hoverOpen,sidebar]);
  useEffect(()=>{
    if(!hoverOpen)return;
    const safe=(node:Element|null)=>Boolean(node&&(sidebar.current?.contains(node)||node.closest('.sidebar-hover-edge,.component-hover-preview,:popover-open')));
    const schedule=()=>{if(hoverTimer.current)return;hoverTimer.current=setTimeout(()=>{if(editing()){clearHover();return}closeHover();hoverTimer.current=null},240)};
    const move=(event:PointerEvent)=>{if(event.pointerType==='touch')return;if(safe(event.target as Element))clearHover();else schedule()};
    const focus=()=>{if(safe(document.activeElement))clearHover();else schedule()};
    const message=(event:MessageEvent)=>{if(event.origin!==location.origin||event.data?.type!=='frame:cursor')return;const owner=[...document.querySelectorAll('iframe')].find(frame=>frame.contentWindow===event.source);if(owner){if(safe(owner))clearHover();else schedule()}};
    const key=(event:KeyboardEvent)=>{if(event.key!=='Escape'||event.defaultPrevented||document.querySelector('dialog[open],:popover-open,.component-hover-preview'))return;closeHover()};
    document.addEventListener('pointermove',move,true);document.addEventListener('focusin',focus);document.addEventListener('keydown',key);window.addEventListener('message',message);
    return()=>{document.removeEventListener('pointermove',move,true);document.removeEventListener('focusin',focus);document.removeEventListener('keydown',key);window.removeEventListener('message',message);clearHover()};
  },[hoverOpen,sidebar,closeHover,clearHover]);
  const dismissPanels=()=>{setSidebarOpen(false);setInspectorOpen(false);closeHover()};
  return {sidebarDocked,inspectorDocked,sidebarFloating,sidebarModal,inspectorModal,sidebarOpen,inspectorOpen,hoverOpen,closeSidebar,closeInspector,toggleSidebar,toggleInspector,summon,leaveHover,clearHover,closeHover,dismissPanels};
}
