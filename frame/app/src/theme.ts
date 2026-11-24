import type {Theme} from '../shared/theme-schema';
export type {Theme};
export const defaultThemes:Record<'light'|'dark',Theme>={light:{mode:'light',accent:'#63766b',surface:'#ffffff',text:'#292c2a',muted:'#737a75',border:'#dfe3df',radius:8,fontSize:14,motion:180,borderWidth:1,shadow:'soft'},dark:{mode:'dark',accent:'#92b6a0',surface:'#24262b',text:'#f2f3f5',muted:'#b5bac1',border:'#45494f',radius:8,fontSize:14,motion:180,borderWidth:1,shadow:'soft'}};
export const accents=['#63766b','#4c8dff','#2ac3b0','#9b7bff','#f071a5'];
