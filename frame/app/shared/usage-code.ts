import type {Entry,Props} from './preview-contract.ts';

export type UsageLibrary={key:string;styles?:string[];entries:Entry[]};

function findUsageEntry(libraries:readonly UsageLibrary[],id:string,key?:string):Entry|undefined{const scoped=key?libraries.filter(l=>l.key===key):libraries;return scoped.flatMap(l=>l.entries).find(e=>e.id===id||e.legacyIds?.includes(id)||e.name===id||e.aliases?.includes(id))}

// 从组件清单与当前参数生成真实可运行的 JSX 用法示例，与预览工作台共用同一份生成逻辑。
export function buildUsageCode(libraries:readonly UsageLibrary[],entry:Entry,props:Props){
  const library=libraries.find(l=>l.entries.some(e=>e.id===entry.id));const imports=new Map<string,Set<string>>();
  const element=(name:string,values:Props):string=>{const target=findUsageEntry(libraries,name,library?.key);const owner=target?.package??entry.package;if(!imports.has(owner))imports.set(owner,new Set());imports.get(owner)!.add(name);const {children,...rest}=values;const attributes=Object.entries(rest).filter(([,v])=>v!==null).map(([key,v])=>`  ${key}={${expression(v)}}`).join('\n');return `<${name}${attributes?'\n'+attributes:''}${children===undefined?'\n/>':`\n>\n  {${expression(children)}}\n</${name}>`}`};
  const expression=(value:any):string=>value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.component==='string'&&value.props?element(value.component,value.props):JSON.stringify(value);
  const jsx=element(entry.name,props);return [...imports].map(([owner,names])=>`import { ${[...names].join(', ')} } from '${owner}';`).concat((library?.styles??[]).map((style:string)=>`import '${style}';`)).join('\n')+'\n\n'+jsx;
}
