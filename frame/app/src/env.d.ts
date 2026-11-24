declare module 'virtual:frame-libraries' {const libraries:unknown[];export default libraries}
declare module 'virtual:frame-plugins' {const plugins:unknown[];export default plugins}
declare module 'virtual:frame-settings' {export const settings:{name:string;base:string;storageNamespace:string}}
declare module 'virtual:frame-storage' {import type {FrameStorage} from '../../src/index';export const storage:FrameStorage}
