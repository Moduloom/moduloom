import {Button,Field,IconButton,Input,Dialog,SegmentedControl,Select,useModalState,useDrawerFocus,Collapse,Pressable,Tabs,Toast,TextareaInput,OverlayScrollArea} from 'loom-frame/ui';
import {preferences} from '../client';
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState, useMemo, type CSSProperties } from 'react';
import { Check, ChevronLeft, ChevronRight, Code2, Copy, Grid2X2, PanelsTopLeft, PanelLeft, PanelRight, Play, RotateCcw, Save, SlidersHorizontal, Upload, X } from 'lucide-react';
import type {Entry,Props,Value} from '../catalog';
import {emptyEntry} from '../../shared/preview-contract';
import { libraries, libraryEntries, findLibraryEntry, libraryOptions } from '../library-registry';
import { type Theme } from '../theme';



import { useWorkbenchPanels } from './useWorkbenchPanels';
import {PluginToolbar,PluginStyleEditor,useLibraryPlugin} from './PluginHost';
import { Sidebar } from './Sidebar';
import { ParameterEditor } from './ParameterEditor';
import { ThemeEditor } from './ThemeEditor';
import { ThemeBar } from './ThemeBar';
import { ThemeManager } from './ThemeManager';
import {ComponentDependencies} from './ComponentDependencies';
import {usedBasicComponents} from './component-dependencies';

import { useThemeProfiles } from './useThemeProfiles';
import { useThemeExport } from './useThemeExport';
import { useThemeConfiguration, previewConfiguration } from './useThemeConfiguration';
import { PreviewWorkbench } from './PreviewWorkbench';
import { componentKindLabel } from '../component-kinds';
import { PreviewCanvas } from './PreviewCanvas';

import { directoryOrder } from './component-order';
import { listSaved, readPreviewTheme, saveConfiguration, usageCode, validateConfiguration, type Configuration, type Saved } from './storage';
function initialEntry(){const fallback=libraries.flatMap(l=>l.entries)[0]??emptyEntry;try{const id=decodeURIComponent(location.hash.slice(1));return findLibraryEntry(id)||fallback}catch{return fallback}}
export default function App(){
  useEffect(()=>{try{const raw=decodeURIComponent(location.hash.slice(1)),canonical=findLibraryEntry(raw)?.id;if(canonical&&canonical!==raw)history.replaceState(history.state,'','#'+encodeURIComponent(canonical))}catch{}},[]);
  const themes=useThemeProfiles();
  const profile=themes.profile;
  const plugin=useLibraryPlugin(profile.libraryKey);
  const [mode,setMode]=useState<Theme['mode']>(()=>{const saved=preferences.getItem('frame.preview.mode');return saved==='light'||saved==='dark'?saved:readPreviewTheme().mode});
  const inventory=useMemo(()=>libraryEntries(profile.libraryKey).filter(e=>profile.componentIds.includes(e.id)),[profile.componentIds,profile.libraryKey]);
  const [entry,setEntry]=useState(initialEntry);
  const options=libraryOptions(profile.libraryKey,entry);
  const ownedEntries=useMemo(()=>libraryEntries(profile.libraryKey),[profile.libraryKey]);
  const hasEntry=ownedEntries.some(item=>item.id===entry.id);
  const headingRef=useRef<HTMLHeadingElement>(null),dependencyFocus=useRef(false);
  useLayoutEffect(()=>{if(dependencyFocus.current){dependencyFocus.current=false;headingRef.current?.focus({preventScroll:true})}},[entry.id]);
  const orderedEntries=useMemo(()=>directoryOrder(inventory),[inventory]);
  const currentIndex=orderedEntries.findIndex(item=>item.id===entry.id);
  const previousEntry=currentIndex>0?orderedEntries[currentIndex-1]:undefined;
  const nextEntry=currentIndex>=0?orderedEntries[currentIndex+1]:undefined;
  const navigationFocus=useRef<'previous'|'next'|null>(null);
  useLayoutEffect(()=>{
    const direction=navigationFocus.current;navigationFocus.current=null;
    if(direction==='previous'&&!previousEntry&&nextEntry)document.getElementById('workbench-component-next')?.focus({preventScroll:true});
    if(direction==='next'&&!nextEntry&&previousEntry)document.getElementById('workbench-component-previous')?.focus({preventScroll:true});
  },[entry.id,previousEntry,nextEntry]);
  const [config,setConfig]=useThemeConfiguration(entry,profile,mode);
  const themeExport=useThemeExport(profile.libraryKey,config.theme,config.tokens);
  const basicDependencies=useMemo(()=>usedBasicComponents(entry,config.props,ownedEntries),[entry,config.props,ownedEntries]);
  const [managerOpen,setManagerOpen]=useState(()=>history.state?.view==='themes');
  const [themeName,setThemeName]=useState(''),[selectedVariant,setSelectedVariant]=useState('default');

  const [tab,setTab]=useState('preview');const [inspector,setInspector]=useState('props');
  const [allStates,setAllStates]=useState(false);
  const [shellDark,setShellDark]=useState(()=>preferences.getItem('frame.workbench.theme')==='dark');
  const [playback,setPlayback]=useState(0);
  const inspectorScrollRef=useRef<HTMLDivElement>(null);
  const mainScrollRef=useRef<HTMLDivElement>(null);
  useLayoutEffect(()=>{mainScrollRef.current?.scrollTo({top:0,left:0})},[entry.id,tab,managerOpen]);
  const sidebarRef=useRef<HTMLDivElement>(null);const inspectorRef=useRef<HTMLElement>(null);
  const panels=useWorkbenchPanels(sidebarRef,inspectorRef);
  const {sidebarDocked,inspectorDocked,sidebarFloating,sidebarModal:sidebarPresent,inspectorModal:inspectorPresent,sidebarOpen,inspectorOpen,hoverOpen,closeSidebar,closeInspector}=panels;
  useEffect(()=>{inspectorScrollRef.current?.scrollTo({top:0})},[managerOpen,inspector]);
  useEffect(()=>{if(!managerOpen)inspectorScrollRef.current?.scrollTo({top:0})},[entry.id]);
  useDrawerFocus(sidebarPresent,sidebarRef,closeSidebar);useDrawerFocus(inspectorPresent,inspectorRef,closeInspector);
  const [modal,setModal,modalClosing]=useModalState<'save'|'saved'|'import'|'clipboard'|'new-theme'>();
  const [saved,setSaved]=useState<Saved[]>([]);const [loadError,setLoadError]=useState('');const [name,setName]=useState('');
  const [importText,setImportText]=useState('');const [importError,setImportError]=useState('');const [busy,setBusy]=useState(false);
  const [toast,setToast]=useState('');const [fallbackText,setFallbackText]=useState('');
  useEffect(()=>{document.documentElement.dataset.luiTheme=shellDark?'dark':'light';preferences.setItem('frame.workbench.theme',shellDark?'dark':'light')},[shellDark]);
  useEffect(()=>{preferences.setItem('frame.preview.mode',mode)},[mode]);
  useEffect(()=>{if(!themes.ready)return;if(ownedEntries.some(e=>e.id===entry.id))return;if(inventory.length){setEntry(inventory[0]);setTab('preview');history.replaceState(null,'','#'+encodeURIComponent(inventory[0].id))}},[inventory,ownedEntries,entry.id,themes.ready]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),2400);return()=>clearTimeout(timer)},[toast]);
  useEffect(()=>{const navigate=()=>{const requested=initialEntry();const target=themes.document.profiles.find(p=>p.componentIds.includes(requested.id));if(target&&target.id!==profile.id)themes.select(target.id);const next=target?requested:ownedEntries.find(e=>e.id===requested.id)||inventory[0];if(next)setEntry(next);setTab('preview');setAllStates(false);setManagerOpen(history.state?.view==='themes')};window.addEventListener('hashchange',navigate);window.addEventListener('popstate',navigate);return()=>{window.removeEventListener('hashchange',navigate);window.removeEventListener('popstate',navigate)}},[inventory,ownedEntries,themes.document,profile.id,themes.select]);
  const select=(next:Entry)=>{if(next.id===entry.id)return;setEntry(next);setTab(current=>current==='scene'?'scene':'preview');setAllStates(false);history.pushState(null,'','#'+encodeURIComponent(next.id))};
  const selectProfile=(id:string)=>{
    const next=themes.document.profiles.find(p=>p.id===id);themes.select(id);
    if(!next)return;
    const entries=libraryEntries(next.libraryKey).filter(e=>next.componentIds.includes(e.id));
    const target=entries.find(e=>e.id===entry.id)??entries[0];
    if(target){if(target.id!==entry.id)setEntry(target);setTab(current=>current==='scene'?'scene':'preview');setAllStates(false);history.pushState(null,'','#'+encodeURIComponent(target.id))}
    else history.pushState(null,'',location.pathname+location.search)
  };
  const followDependency=(next:Entry)=>{dependencyFocus.current=true;select(next);setTab('preview')};
  const stepComponent=(direction:'previous'|'next',button:HTMLButtonElement)=>{navigationFocus.current=button.matches(':focus-visible')?direction:null;panels.dismissPanels();const next=direction==='previous'?previousEntry:nextEntry;if(next)select(next)};
  const patch=useCallback((key:string,value:Value)=>setConfig(previous=>({...previous,props:{...previous.props,[key]:value}})),[setConfig]);
  const changeTheme=(theme:Theme)=>{if(theme.mode!==mode){setMode(theme.mode);return}setConfig(previous=>({...previous,theme}))};
  const changeGlobalTheme=(theme:Theme)=>themes.update({...profile,styles:{...profile.styles,[theme.mode]:theme}});
  const editGlobalTheme=()=>{panels.dismissPanels();setManagerOpen(true);history.pushState({view:'themes'},'')};
  const backToWorkbench=()=>{setManagerOpen(false);history.pushState({view:'workbench'},'')};
  const createTheme=()=>{setThemeName('');setModal('new-theme')};
  const getPreview=useCallback((next:Entry)=>next.id===entry.id?config:previewConfiguration(next,profile,mode),[entry.id,config,profile,mode]);
  const switchTheme=(next:Theme['mode'])=>setMode(next);
  const replay=()=>{if(entry.fields.some(field=>field.key==='open'&&field.kind==='boolean'))patch('open',true);setPlayback(value=>value+1)};
  const reset=()=>{setConfig({componentId:entry.id,props:structuredClone(entry.props),theme:{...profile.styles[mode]}});setToast('已恢复默认')};
  const copy=async(text:string,message:string)=>{try{await navigator.clipboard.writeText(text);setToast(message)}catch{setFallbackText(text);setModal('clipboard')}};
  const openSaved=async()=>{setModal('saved');setBusy(true);setLoadError('');setImportError('');try{setSaved(await listSaved())}catch{setLoadError('无法读取已保存配置，请重试。')}finally{setBusy(false)}};
  const save=async()=>{if(!name.trim()||busy)return;setBusy(true);try{await saveConfiguration(name.trim(),config);setModal(null);setToast('已保存配置')}catch(error){setToast(error instanceof TypeError?'保存失败，请重试':(error as Error).message)}finally{setBusy(false)}};
  const load=(c:Configuration)=>{try{const value=validateConfiguration(c);const next=findLibraryEntry(value.componentId)!;if(!profile.componentIds.includes(next.id))throw new Error('当前主题未启用这个组件，请先在主题配置中选择。');setEntry(next);setMode(value.theme.mode);setConfig(value);setModal(null);setTab('preview');setAllStates(false);history.pushState(null,'','#'+encodeURIComponent(next.id));setToast('已应用配置')}catch(e){setImportError((e as Error).message)}};
  const code=plugin?.usageCode?.(entry,config.props)??usageCode(entry,config.props);
  const styleDefaults=profile.styles[mode];
  const styleChanged=Object.keys(styleDefaults).some(key=>config.theme[key as keyof Theme]!==styleDefaults[key as keyof Theme]);
  const entryVariants=profile.variants[entry.id]||[];
  useEffect(()=>setSelectedVariant('default'),[entry.id,profile.id]);
  const applyVariant=(id:string)=>{setSelectedVariant(id);const v=entryVariants.find(item=>item.id===id);if(v)setConfig({componentId:entry.id,props:structuredClone(v.props) as Props,theme:{...profile.styles[mode],...v.style,mode}});else setConfig({componentId:entry.id,props:structuredClone(entry.props),theme:{...profile.styles[mode]}})};
  return <div className="workbench"><div inert={sidebarPresent||inspectorPresent||undefined}><ThemeBar profiles={themes.document.profiles} active={profile} ready={themes.ready} error={themes.error} onRetry={themes.retry} onSelect={selectProfile} onEdit={editGlobalTheme} onCreate={createTheme} navigation={!managerOpen?<><IconButton id="workbench-component-previous" label="上一个组件" title={previousEntry?'上一个：'+previousEntry.name+' · '+previousEntry.label:'已是第一个组件'} disabled={!themes.ready||!previousEntry} onClick={event=>stepComponent('previous',event.currentTarget)}><ChevronLeft/></IconButton><IconButton id="workbench-component-next" label="下一个组件" title={nextEntry?'下一个：'+nextEntry.name+' · '+nextEntry.label:'已是最后一个组件'} disabled={!themes.ready||!nextEntry} onClick={event=>stepComponent('next',event.currentTarget)}><ChevronRight/></IconButton></>:undefined} leading={!managerOpen?<IconButton id="workbench-sidebar-toggle" aria-controls="workbench-sidebar" label={sidebarDocked||sidebarOpen?'关闭组件目录':'打开组件目录'} pressed={sidebarDocked||sidebarOpen} onClick={panels.toggleSidebar}><PanelLeft/></IconButton>:undefined} actions={<><PluginToolbar/>{!managerOpen?<IconButton id="workbench-inspector-toggle" aria-controls="workbench-inspector" label={inspectorDocked||inspectorOpen?'关闭参数面板':'打开参数面板'} pressed={inspectorDocked||inspectorOpen} disabled={!hasEntry} onClick={panels.toggleInspector}><PanelRight/></IconButton>:null}</>}/></div>
    {managerOpen?<ThemeManager profile={profile} profiles={themes.document.profiles} archived={themes.document.archived} mode={mode} onMode={setMode} onUpdate={themes.update} onBack={backToWorkbench} onCopy={copy} onArchive={()=>themes.archive(profile.id)} onRestore={themes.restore}/>:<div className={hasEntry?'workspace':'workspace is-empty'} style={{'--w-left-size':sidebarDocked?'var(--w-nav-width)':'0px','--w-right-size':hasEntry&&inspectorDocked?'var(--w-inspector-width)':'0px'} as CSSProperties} data-sidebar-docked={sidebarDocked} data-inspector-docked={inspectorDocked}><><div id="workbench-sidebar" ref={sidebarRef} role={sidebarPresent?'dialog':undefined} aria-modal={sidebarPresent||undefined} aria-label={sidebarPresent?'组件目录':undefined} inert={inspectorPresent||(!sidebarDocked&&!sidebarOpen&&!hoverOpen)||undefined} aria-hidden={!sidebarDocked&&!sidebarOpen&&!hoverOpen||undefined} className={'sidebar-host'+(!sidebarDocked&&sidebarFloating?' is-floating is-open'+(!sidebarOpen&&!hoverOpen?' is-closing':''):'')} onPointerEnter={panels.clearHover} onPointerLeave={e=>{if(e.relatedTarget instanceof Element&&e.relatedTarget.closest('.component-hover-preview,.lui-select-popup'))return;panels.leaveHover()}}><Sidebar active={sidebarDocked||sidebarOpen||hoverOpen} inventory={inventory} availableCount={ownedEntries.length} libraryRegistered={libraries.some(library=>library.key===profile.libraryKey)} previewScope={profile.libraryKey} getPreview={getPreview} onManageComponents={editGlobalTheme} selected={entry.id} onSelect={next=>{select(next);if(!sidebarDocked)closeSidebar()}} onSaved={openSaved} onClose={closeSidebar} shellDark={shellDark} onShellMode={()=>setShellDark(!shellDark)}/></div>{!sidebarDocked&&!sidebarOpen&&<Pressable type="button" className="sidebar-hover-edge" tabIndex={hoverOpen?-1:0} aria-controls="workbench-sidebar" aria-expanded={hoverOpen} aria-label="悬浮打开组件目录" onPointerEnter={e=>{if(e.pointerType!=='touch')panels.summon()}} onPointerLeave={panels.clearHover} onFocus={()=>panels.summon(true)} onClick={()=>panels.summon(true)}/>}{sidebarPresent&&<Pressable className="sidebar-backdrop" aria-label="关闭组件目录" onClick={closeSidebar}/>}
    {hasEntry?<main className="main-panel" inert={sidebarPresent||inspectorPresent||undefined}><div className="component-heading"><div className="breadcrumb"><span>组件</span><ChevronRight/><span>{componentKindLabel(entry.kind)}</span>{entry.directoryLevel!=='kind'&&<><ChevronRight/><span>{entry.group}</span></>}<ChevronRight/><span>{entry.name}</span></div><div className="component-title-row"><div><div className="component-title"><h1 ref={headingRef} tabIndex={-1}>{entry.name.split(/(?=[A-Z][a-z])/).map((part,index)=><Fragment key={index}>{index>0&&<wbr/>}{part}</Fragment>)}</h1>{entry.name!==entry.label&&<span>{entry.label}</span>}</div><p>{entry.description}</p>{entry.kind==='composite'&&entry.directoryLevel!=='kind'&&<ComponentDependencies entries={basicDependencies} onNavigate={followDependency}/>}</div><Button variant="primary" icon={<Copy/>} onClick={()=>copy(entry.id,'已复制组件 ID')}>复制 ID</Button></div></div>
      <div className="content-tabs"><Tabs label="组件内容" value={tab} onValueChange={value=>setTab(value as typeof tab)} items={[{key:'preview',label:'预览',icon:<Grid2X2/>},{key:'scene',label:'场景',icon:<PanelsTopLeft/>},{key:'code',label:'用法',icon:<Code2/>},{key:'config',label:'配置',icon:<SlidersHorizontal/>}].filter(item=>options.scene===true||item.key!=='scene').map(({key,...item})=>({...item,value:key}))}/><div className="component-content-actions">{(tab==='preview'||tab==='scene')&&<Button className="replay-action" icon={<Play/>} onClick={replay}>重新预览</Button>}<IconButton label="恢复默认参数和样式" onClick={reset}><RotateCcw/></IconButton></div></div>
      <OverlayScrollArea viewportRef={mainScrollRef} areaClassName="workbench-scroll" className="main-scroll">{tab==='preview'?<><PreviewWorkbench entry={entry} props={config.props} theme={config.theme} onPatch={patch} onThemeMode={switchTheme} palettes={profile.styles} libraryKey={profile.libraryKey} tokens={config.tokens} playback={playback}/>
        <section className="usage-summary"><div><h2>使用组件</h2><span>ID 与配置分别复制</span></div><Button variant="ghost" icon={<Code2/>} onClick={()=>setTab('code')}>查看用法<ChevronRight/></Button></section><div className="summary-code">{plugin?.usageCode?plugin.usageCode(entry,config.props):<><span className="syntax-purple">import</span> {'{ '+entry.name+' }'} <span className="syntax-purple">from</span> <span className="syntax-green">'{entry.package}'</span>;</>}</div>
        {options.states!==false&&<section className="state-section"><Pressable className="state-toggle" type="button" aria-expanded={allStates} onClick={()=>setAllStates(!allStates)}><span>状态与变体</span><span>{allStates?'收起':'展开'}<ChevronRight className={allStates?'rotate-90':''}/></span></Pressable><Collapse key={entry.id} open={allStates} lazy><div className="state-grid">{stateVariants(entry,config.props).map(variant=><div className="state-card" key={variant.label}><header>{variant.label}</header><PreviewCanvas entry={entry} props={variant.props} theme={config.theme} libraryKey={profile.libraryKey} tokens={config.tokens} title={entry.label+' '+variant.label}/></div>)}</div></Collapse></section>}
      </>:tab==='scene'?<PreviewWorkbench key="scene" entry={entry} props={config.props} theme={config.theme} onPatch={patch} onThemeMode={switchTheme} palettes={profile.styles} libraryKey={profile.libraryKey} tokens={config.tokens} playback={playback} scene/>:tab==='code'?<section className="code-section"><div className="section-title"><h2>用法示例</h2><Button icon={<Copy/>} onClick={()=>copy(code,'已复制用法示例')}>复制代码</Button></div><pre>{code}</pre><div className="code-note">交互组件的回调由使用它的项目提供；预览中的操作使用示例回调。</div>{options.states!==false&&<><div className="section-title"><h2>样式变量</h2><Button icon={<Copy/>} disabled={!themeExport.canExport} onClick={()=>copy(themeExport.css,'已复制样式')}>复制 CSS</Button></div>{themeExport.error&&<p className="w-field-error" role="status">{themeExport.error}</p>}{themeExport.note&&<div className="code-note">{themeExport.note}</div>}{themeExport.css&&<pre>{themeExport.css}</pre>}</>}{entry.related?.length&&<div className="related-exports"><h2>相关导出</h2><div>{entry.related.map(name=><code key={name}>{name}</code>)}</div></div>}<div className="source-location"><span>组件源码</span><code>{entry.source}</code></div></section>:<section className="code-section"><div className="section-title"><h2>当前配置</h2><Button className="mobile-config-actions" icon={<Copy/>} onClick={()=>copy(JSON.stringify(config,null,2),'已复制配置')}>复制配置</Button></div><pre>{JSON.stringify(config,null,2)}</pre><div className="config-actions mobile-config-actions"><Button icon={<Upload/>} onClick={()=>{setImportText('');setImportError('');setModal('import')}}>粘贴配置</Button><Button icon={<Save/>} onClick={()=>{setName(entry.label+' · '+(config.theme.mode==='light'?'浅色':'深色'));setModal('save')}}>保存配置</Button></div></section>}</OverlayScrollArea>
    </main>:<main className="theme-empty" inert={sidebarPresent||inspectorPresent||undefined}><h1>{libraryEntries(profile.libraryKey).length?'还没有启用组件':'这套组件库尚未添加组件源码'}</h1><Button onClick={editGlobalTheme}>主题管理</Button></main>}{hasEntry&&<aside id="workbench-inspector" ref={inspectorRef} role={inspectorPresent?'dialog':undefined} aria-modal={inspectorPresent||undefined} aria-label={inspectorPresent?'调整组件':undefined} inert={sidebarPresent||(!inspectorDocked&&!inspectorOpen)||undefined} aria-hidden={!inspectorDocked&&!inspectorOpen||undefined} className={'inspector'+(inspectorPresent?' is-floating is-open'+(!inspectorOpen?' is-closing':''):'')}><div className="inspector-header"><h2>调整组件</h2><IconButton label="关闭参数面板" onClick={closeInspector}><X/></IconButton></div><div className="inspector-tabs"><SegmentedControl label="调整内容" value={inspector} items={[{value:'props',label:'参数'},{value:'theme',label:'样式'}]} onValueChange={setInspector}/><IconButton label="恢复默认样式" disabled={!styleChanged} onClick={()=>changeTheme({...styleDefaults})}><RotateCcw/></IconButton></div><OverlayScrollArea viewportRef={inspectorScrollRef} areaClassName="workbench-scroll" className="inspector-scroll">{entryVariants.length>0&&<Field label="组件变体"><Select label="工作台组件变体" value={selectedVariant} options={[{value:'default',label:'组件默认'},...entryVariants.map(v=>({value:v.id,label:v.name}))]} onValueChange={applyVariant}/></Field>}{inspector==='props'?<ParameterEditor key={entry.id} entry={entry} props={config.props} onChange={patch}/>:<PluginStyleEditor libraryKey={profile.libraryKey} theme={config.theme} onMode={setMode} onChange={changeTheme} fallback={<ThemeEditor theme={config.theme} accentPresets={libraries.find(library=>library.key===profile.libraryKey)?.accentPresets} defaults={styleDefaults} palettes={profile.styles} onModeChange={setMode} onChange={changeTheme}/>}/>}</OverlayScrollArea><footer className="inspector-footer"><Button variant="primary" icon={<Copy/>} onClick={()=>copy(JSON.stringify(config,null,2),'已复制配置')}>复制配置</Button><div><Button variant="ghost" icon={<Upload/>} onClick={()=>{setImportText('');setImportError('');setModal('import')}}>粘贴配置</Button><Button variant="ghost" icon={<Save/>} onClick={()=>{setName(entry.label+' · '+profile.name);setModal('save')}}>保存</Button></div></footer></aside>}{inspectorPresent&&<Pressable className="inspector-backdrop" aria-label="关闭参数面板" onClick={closeInspector}/>}</></div>}
    {modal==='new-theme'&&<Dialog closing={modalClosing} title="新建组件库主题" onOpenChange={next=>{if(!next)(()=>setModal(null))()}} footer={<><Button onClick={()=>setModal(null)}>取消</Button><Button variant="primary" disabled={!themeName.trim()||themes.document.profiles.some(p=>p.name===themeName.trim())} onClick={()=>{themes.add(themeName.trim());setModal(null);setManagerOpen(true);history.pushState({view:'themes'},'')}}>创建</Button></>} open><Field label="组件库主题名称"><Input aria-label="新组件库主题名称" autoFocus value={themeName} maxLength={50} placeholder="例如：组件库 B" onChange={e=>setThemeName(e.currentTarget.value)}/></Field>{themes.document.profiles.some(p=>p.name===themeName.trim())&&<p className="w-field-error" role="status">这个主题名称已经存在。</p>}<p className="new-library-note">基于当前组件库创建一套独立的主题配置。</p></Dialog>}
    {toast&&<Toast open={Boolean(toast)} title={toast} onDismiss={()=>setToast('')}/>}
    {modal==='save'&&<Dialog closing={modalClosing} title="保存配置" onOpenChange={next=>{if(!next)(()=>setModal(null))()}} footer={<><Button onClick={()=>setModal(null)}>取消</Button><Button variant="primary" disabled={!name.trim()||busy} onClick={save}>{busy?'保存中…':'保存'}</Button></>} open><Field label="配置名称"><Input autoFocus aria-label="配置名称" value={name} maxLength={80} onChange={e=>setName(e.currentTarget.value)} onKeyDown={e=>{if(e.key==='Enter')save()}}/></Field></Dialog>}
    {modal==='saved'&&<Dialog closing={modalClosing} title="已保存配置" onOpenChange={next=>{if(!next)(()=>setModal(null))()}} open><div className="saved-list">{importError&&<p role="status">{importError}</p>}{busy&&!saved.length?<p>正在读取…</p>:loadError?<div><p>{loadError}</p><Button onClick={openSaved}>重试</Button></div>:saved.length?saved.map(item=><Pressable key={item.key} type="button" onClick={()=>load(item)}><span><strong>{item.name}</strong><code>{item.componentId}</code></span><span>{new Date(item.savedAt).toLocaleDateString('zh-CN')}<ChevronRight/></span></Pressable>):<div className="saved-empty"><Save/><p>还没有保存的配置</p><span>调整组件后，点击“保存”即可收集。</span></div>}</div></Dialog>}
    {modal==='import'&&<Dialog closing={modalClosing} title="粘贴配置" onOpenChange={next=>{if(!next)(()=>setModal(null))()}} footer={<><Button onClick={()=>setModal(null)}>取消</Button><Button variant="primary" disabled={!importText.trim()} onClick={()=>{try{load(validateConfiguration(JSON.parse(importText)))}catch(e){setImportError(e instanceof SyntaxError?'配置不是有效的 JSON。':(e as Error).message)}}}>应用配置</Button></>} open><TextareaInput className="lui-input config-import" autoFocus aria-label="粘贴组件配置" placeholder="粘贴复制的 JSON 配置…" value={importText} onChange={e=>{setImportText(e.currentTarget.value);setImportError('')}}/><div className="import-error" role="status">{importError}</div></Dialog>}
    {modal==='clipboard'&&<Dialog closing={modalClosing} title="手动复制" onOpenChange={next=>{if(!next)(()=>setModal(null))()}} open><p>浏览器未允许自动复制，可以选中下面的内容复制。</p><TextareaInput className="lui-input config-import" aria-label="待复制内容" readOnly value={fallbackText} onFocus={e=>e.currentTarget.select()}/></Dialog>}
  </div>;
}
function stateVariants(entry:Entry,props:Props):{label:string;props:Props}[]{
  const fields=new Set(entry.fields.map(f=>f.key));const result=[{label:'当前配置',props}];
  if(fields.has('disabled'))result.push({label:'禁用',props:{...props,disabled:true}});
  if(fields.has('busy'))result.push({label:'加载中',props:{...props,busy:true}});
  if(fields.has('invalid'))result.push({label:'错误',props:{...props,invalid:true}});
  if(fields.has('error'))result.push({label:'错误',props:{...props,error:'请填写有效的内容'}});
  if(fields.has('checked'))result.push({label:'未选择',props:{...props,checked:false}});
  if(fields.has('children')&&typeof props.children==='string')result.push({label:'长文本',props:{...props,children:'用于查看长文本布局与换行效果的内容'}});
  if(result.length===1){const field=entry.fields.find(f=>f.kind==='select');if(field)field.options?.filter(value=>value!==props[field.key]).slice(0,2).forEach(value=>result.push({label:value,props:{...props,[field.key]:value}}));}
  return result;
}
