import type {Theme} from './theme-schema.ts';

export type ComponentKind = 'basic' | 'composite';
export type Value = string | number | boolean | null | Value[] | {[key:string]:Value};
export type Props = Record<string,Value>;
export type Field = {key:string;label:string;kind:'text'|'number'|'boolean'|'select'|'json';options?:string[];optionLabels?:Record<string,string>;optionsFrom?:string;multiline?:boolean;min?:number;max?:number;step?:number};
export type PreviewOptions={viewport?:{width:number;height:number;minWidth?:number};fillCanvas?:boolean;persistent?:boolean;scene?:boolean;states?:boolean;highlight?:boolean;language?:string;height?:number};
export type Entry = {id:string;preview?:PreviewOptions;name:string;label:string;group:string;kind:ComponentKind;description:string;package:string;source:string;props:Props;fields:Field[];related?:string[];basicComponentIds?:string[];wide?:boolean;sourceName?:string;runtimeId?:string;aliases?:string[];legacyIds?:string[];sourceStatus?:'current'|'retained';directoryLevel?:'kind';sourceParameters?:string;callbacks?:string[];slots?:string[]};
export const groups=['操作','表单','图标','导航','浮层','展示','反馈','布局','设置','语音','消息','资料'] as const;
export const emptyEntry:Entry={id:'frame:unregistered',name:'',label:'',group:'展示',kind:'basic',description:'',package:'',source:'',props:{},fields:[]};
