export type {ComponentKind} from '../shared/preview-contract.ts';
import type {ComponentKind} from '../shared/preview-contract.ts';
export const componentKinds = [{value:'basic',label:'基础'},{value:'composite',label:'组合'}] as const;
export const componentKindLabel = (kind:ComponentKind) => kind==='basic'?'基础':'组合';
