import {preferences} from './client';
import { createRoot } from 'react-dom/client';
import App from './workbench/App';
import './workbench/styles.css';
document.documentElement.setAttribute('data-loom-motion-preview', '');
try{document.documentElement.dataset.luiTheme=preferences.getItem('frame.workbench.theme')==='dark'?'dark':'light'}catch{}
const root=import.meta.hot?.data.root ?? createRoot(document.getElementById('root')!);
if(import.meta.hot)import.meta.hot.data.root=root;
root.render(<App/>);
