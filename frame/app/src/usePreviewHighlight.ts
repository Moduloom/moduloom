import { useLayoutEffect } from 'react';

// Only the preview document receives these markers; library props and exports
// remain untouched. Skip demo context wrappers, and follow portals into body.
export function usePreviewHighlight(enabled:boolean) {
  useLayoutEffect(()=>{
    if(!enabled)return;
    const marked=new Set<Element>();
    const visit=(element:Element)=>{
      if(element.matches('input[hidden],script,style,.preview-error,[data-radix-focus-guard]'))return;
      if(element.classList.contains('preview-root')||element.hasAttribute('data-preview-wrapper')||getComputedStyle(element).display==='contents') { for(const child of element.children)visit(child);return }
      const box=element.getBoundingClientRect();if(!box.width||!box.height)return;
      element.setAttribute('data-frame-preview-highlight','');marked.add(element);
    };
    const update=()=>{
      for(const element of marked)element.removeAttribute('data-frame-preview-highlight');marked.clear();
      const root=document.querySelector('.preview-root');
      if(root?.hasAttribute('data-scene')){const target=root.querySelector('[data-scene-target]');if(target)visit(target)}else if(root)visit(root);
      for(const portal of document.body.children){if(portal.id==='root')continue;const content=portal.matches('[role="dialog"],[role="menu"],[role="listbox"],[role="tooltip"],[role="status"],[role="alert"]')?portal:portal.querySelector('[role="dialog"],[role="menu"],[role="listbox"],[role="tooltip"],[role="status"],[role="alert"]');if(content)visit(content)}
    };
    update();
    const observer=new MutationObserver(update);if(document.body)observer.observe(document.body,{childList:true,subtree:true});
    return()=>{observer.disconnect();for(const element of marked)element.removeAttribute('data-frame-preview-highlight')};
  },[enabled]);
}
