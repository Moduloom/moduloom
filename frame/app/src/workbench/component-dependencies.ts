import type {Entry,Props,Value} from '../catalog';
export function usedBasicComponents(entry:Entry,props:Props,entries:Entry[]):Entry[]{
 const byName=new Map(entries.flatMap(e=>[e.name,...(e.aliases??[])].map(name=>[name,e] as const))),ids=new Set(entry.basicComponentIds??[]);
 function visit(value:Value|undefined){if(!value||typeof value!=='object')return;if(Array.isArray(value)){value.forEach(visit);return}if(typeof value.component==='string'&&value.props&&typeof value.props==='object'&&!Array.isArray(value.props)){const component=byName.get(value.component);if(component){if(component.kind==='basic')ids.add(component.id);for(const id of component.basicComponentIds??[])ids.add(id)}Object.values(value.props).forEach(visit)}}
 for(const field of entry.fields)if(field.kind==='json'&&(!entry.slots?.length||entry.slots.includes(field.key)))visit(props[field.key]);
 return entries.filter(e=>e.kind==='basic'&&ids.has(e.id));
}
