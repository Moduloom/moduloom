import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const root=fileURLToPath(new URL('../..',import.meta.url));
const library=resolve(root,'android/voice-room');
process.env.VOICE_ROOM_ANDROID_ASSETS??=resolve(root,'android/preview-assets/voice-room');
process.chdir(library);
await import(pathToFileURL(resolve(library,'scripts/preview.ts')).href);
