import {Component,lazy,Suspense,useEffect,useState,type ReactNode} from 'react';
import {plugins,libraryPlugin} from '../library-registry';
import type {ClientPlugin,StyleEditorProps} from '../../../src/index';
function PluginFailure(){return <p className="w-field-error" role="alert">插件无法加载，请刷新重试。</p>}
class PluginBoundary extends Component<{children:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<PluginFailure/>:this.props.children}}
const toolbars=plugins.filter(p=>p.load).map(p=>({key:p.key,Component:lazy(async()=>({default:(await p.load!()).plugin.Toolbar??(()=>null)}))}));
export function PluginToolbar(){return <>{toolbars.map(({key,Component})=><PluginBoundary key={key}><Suspense fallback={null}><Component/></Suspense></PluginBoundary>)}</>}
export function useLibraryPlugin(key:string){const [value,setValue]=useState<{key:string;plugin:ClientPlugin}>();useEffect(()=>{let active=true;const source=libraryPlugin(key);if(source?.load)void source.load().then(module=>{if(active)setValue({key,plugin:module.plugin})}).catch(()=>{if(active)setValue({key,plugin:{StyleEditor:PluginFailure}})});return()=>{active=false}},[key]);return value?.key===key?value.plugin:undefined}
export function PluginStyleEditor({libraryKey,fallback,...props}:StyleEditorProps&{libraryKey:string;fallback:ReactNode}){const plugin=useLibraryPlugin(libraryKey);return plugin?.StyleEditor?<PluginBoundary key={libraryKey}><plugin.StyleEditor {...props}/></PluginBoundary>:fallback}
