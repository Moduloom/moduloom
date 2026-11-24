import {Field,IconButton,Input,NumberInput,SegmentedControl,Select,Pressable} from 'loom-frame/ui';
import { Check, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { accents, defaultThemes, type Theme } from '../theme';
import type {AccentPreset} from '../../../src/index';

const colors: {key:'accent'|'surface'|'text'|'muted'|'border';label:string}[]=[{key:'accent',label:'强调色'},{key:'surface',label:'表面'},{key:'text',label:'主要文字'},{key:'muted',label:'次要文字'},{key:'border',label:'边框'}];
function ColorValue({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}) {
  const [draft,setDraft]=useState(value);useEffect(()=>setDraft(value),[value]);
  return <Input className="color-value" aria-label={label} value={draft} maxLength={7} aria-invalid={!/^#[0-9a-f]{6}$/i.test(draft)||undefined} onChange={e=>{const next=e.currentTarget.value;setDraft(next);if(/^#[0-9a-f]{6}$/i.test(next))onChange(next)}} onBlur={()=>{if(!/^#[0-9a-f]{6}$/i.test(draft))setDraft(value)}}/>;
}
const fallbackPresets = accents.map(color => ({
  color,
  name: ({'#63766b':'鼠尾草','#4c8dff':'蓝色','#2ac3b0':'薄荷','#9b7bff':'紫色','#f071a5':'玫瑰'}[color] ?? '自定义'),
}));

export function ThemeAccentPresets({value, onChange, presets = fallbackPresets}: {
  value: string; onChange: (color: string) => void; presets?: readonly AccentPreset[];
}) {
  return <Field label="强调色预设">
    <div className="accent-presets">
      {presets.map(({name, color}) => <Pressable key={color} type="button"
        aria-label={'强调色 ' + name} aria-pressed={value === color} style={{background: color}}
        onClick={() => onChange(color)}>{value === color && <Check/>}</Pressable>)}
    </div>
  </Field>;
}

export function ThemeEditor({theme,onChange,defaults=defaultThemes[theme.mode],palettes=defaultThemes,onModeChange,accentPresets}: {theme:Theme;onChange:(next:Theme)=>void;defaults?:Theme;palettes?:Record<Theme['mode'],Theme>;onModeChange?:(mode:Theme['mode'])=>void;accentPresets?:readonly AccentPreset[]}) {
  const set=(key:keyof Theme,value:string|number)=>onChange({...theme,[key]:value});
  const restore=(key:keyof Theme,label:string)=><IconButton size="small" label={'恢复'+label+'默认值'} disabled={theme[key]===defaults[key]} onClick={()=>set(key,defaults[key])}><RotateCcw/></IconButton>;
  return <div className="theme-fields"><Field label="明暗"><SegmentedControl label="预览明暗" value={theme.mode} items={[{value:'light',label:'浅色'},{value:'dark',label:'深色'}]} onValueChange={value=>onModeChange?onModeChange(value as Theme['mode']):onChange({...palettes[value as Theme['mode']],accent:theme.accent,radius:theme.radius,fontSize:theme.fontSize,motion:theme.motion,borderWidth:theme.borderWidth,shadow:theme.shadow})}/></Field>
    <ThemeAccentPresets value={theme.accent} presets={accentPresets} onChange={color=>set('accent',color)}/>
    <div className="inspector-divider"/>{colors.map(({key,label})=><Field key={key} label={label} action={restore(key,label)}><div className="color-field"><Input type="color" aria-label={label+'选择'} value={theme[key]} onChange={e=>set(key,e.currentTarget.value)}/><ColorValue label={label+'颜色值'} value={theme[key]} onChange={value=>set(key,value)}/></div></Field>)}
    <div className="inspector-divider"/>{[{key:'borderWidth',label:'线框宽度',max:6,step:0.5,unit:'px'},{key:'radius',label:'控件圆角',max:24,unit:'px'},{key:'fontSize',label:'字号',min:12,max:24,unit:'px'},{key:'motion',label:'过渡时间',max:600,unit:'ms'}].map(({key,label,min=0,max,unit,step=1})=><Field key={key} label={label} action={restore(key as keyof Theme,label)}><NumberInput label={label} min={min} max={max} step={step} unit={unit} value={Number(theme[key as keyof Theme])} onValueChange={value=>set(key as keyof Theme,value)}/></Field>)}
    <Field label="阴影" action={restore('shadow','阴影')}><Select label="阴影" value={theme.shadow} options={[{value:'soft',label:'柔和'},{value:'none',label:'无'}]} onValueChange={value=>set('shadow',value)}/></Field>
  </div>;
}
