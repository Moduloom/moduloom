import {Field,Input,NumberInput,Select,Switch,TextareaInput} from 'loom-frame/ui';
import { useEffect, useRef, useState } from 'react';
import type { Entry, Field as Parameter, Props, Value } from '../catalog';

function JsonEditor({field,value,onChange}:{field:Parameter;value:Value;onChange:(value:Value)=>void}) {
  const [text,setText]=useState(JSON.stringify(value,null,2));const [error,setError]=useState('');
  const editing=useRef(false);
  useEffect(()=>{if(!editing.current){setText(JSON.stringify(value,null,2));setError('')}},[value]);
  return <><TextareaInput className="lui-input w-json-input" aria-label={field.label} aria-invalid={Boolean(error)} spellCheck={false} value={text} onFocus={()=>{editing.current=true}} onBlur={()=>{editing.current=false;if(!error)setText(JSON.stringify(value,null,2))}} onChange={e=>{const next=e.currentTarget.value;setText(next);try{const parsed=JSON.parse(next);if(Array.isArray(value)&&!Array.isArray(parsed))throw new Error();if(value!==null&&!Array.isArray(value)&&typeof value==='object'&&(typeof parsed!=='object'||parsed===null||Array.isArray(parsed)))throw new Error();onChange(parsed);setError('')}catch{setError('请填写有效的 JSON，预览保留上次的内容。')}}}/><div className="w-field-error" role={error?'status':undefined}>{error}</div></>;
}
export function ParameterEditor({entry,props,onChange}:{entry:Entry;props:Props;onChange:(key:string,value:Value)=>void}) {
  return <div className="parameter-fields">{entry.fields.map(field=>field.kind==='boolean'?<div className="w-toggle-row" key={field.key}><div><span>{field.label}</span><code>{field.key}</code></div><Switch label={field.label} checked={Boolean(props[field.key])} onCheckedChange={value=>onChange(field.key,value)} labelHidden/></div>:<Field key={field.key} label={field.label} code={field.key}>
    {field.kind==='select'?<Select label={field.label} value={String(props[field.key]??'')} options={selectOptions(field,props)} onValueChange={value=>onChange(field.key,value)}/>:field.kind==='json'?<JsonEditor field={field} value={props[field.key]} onChange={value=>onChange(field.key,value)}/>:field.kind==='number'?<NumberInput label={field.label} min={field.min} max={field.max} step={field.step} value={Number(props[field.key])} onValueChange={value=>onChange(field.key,value)}/>:field.multiline?<TextareaInput className="lui-input w-json-input" aria-label={field.label} rows={9} spellCheck={false} value={String(props[field.key]??'')} onChange={e=>onChange(field.key,e.currentTarget.value)}/>:<Input aria-label={field.label} type="text" value={String(props[field.key]??'')} onChange={e=>onChange(field.key,e.currentTarget.value)}/>}
  </Field>)}{!entry.fields.length&&<p className="w-muted">这个组件没有可调参数，可在“样式”中调整外观。</p>}</div>;
}
function selectOptions(field:Parameter,props:Props){
 const source=field.optionsFrom?props[field.optionsFrom]:undefined;
 if(Array.isArray(source))return source.filter(item=>item&&typeof item==='object'&&!Array.isArray(item)&&typeof item.value==='string').map(item=>({value:String((item as any).value),label:String((item as any).label??(item as any).value)}));
 return (field.options??[]).map(value=>({value,label:field.optionLabels?.[value]??value}));
}
