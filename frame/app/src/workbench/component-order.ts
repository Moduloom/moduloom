import {groups,type Entry} from '../../shared/preview-contract.ts';
import { componentKinds } from '../component-kinds.ts';

export const directoryGroups=(entries:Entry[])=>[...new Set([...groups,...entries.map(entry=>entry.group)])];
export function directoryOrder(entries:Entry[]) {
  const purposes=directoryGroups(entries);
  return componentKinds.flatMap(({value}) => {
    const section = entries.filter(entry => entry.kind === value);
    return [
      ...section.filter(entry => entry.directoryLevel === 'kind'),
      ...purposes.flatMap(group => section.filter(entry => entry.directoryLevel !== 'kind' && entry.group === group)),
    ];
  });
}
