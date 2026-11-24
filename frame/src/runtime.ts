import {spawn, type ChildProcess} from 'node:child_process';
import {resolve} from 'node:path';
import type {FramePlugin} from './index';

type RunningPlugin = {
  key: string;
  child: ChildProcess;
  url: string;
  shutdownPath?: string;
};

function waitUntilReady(child: ChildProcess, key: string): Promise<number> {
  return new Promise((accept, reject) => {
    let pending = '';
    const finish = (error?: Error, port?: number) => {
      clearTimeout(timer);
      child.stdout?.off('data', read);
      child.off('error', failed);
      child.off('exit', exited);
      if (error) reject(error);
      else accept(port!);
    };
    const failed = (error: Error) => finish(error);
    const exited = () => finish(new Error('插件 '+key+' 已退出'));
    const read = (buffer: Buffer) => {
      pending += buffer.toString();
      if (pending.length > 65536) return finish(new Error('插件启动信息过长'));
      const index = pending.indexOf('\n');
      if (index < 0) return;
      try {
        const {port} = JSON.parse(pending.slice(0, index));
        if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error();
        finish(undefined, port);
      } catch {
        finish(new Error('插件 '+key+' 未返回有效的启动端口'));
      }
    };
    const timer = setTimeout(() => finish(new Error('插件 '+key+' 启动超时')), 20000);
    child.stdout?.on('data', read);
    child.once('error', failed);
    child.once('exit', exited);
  });
}

async function stopPlugin(item: RunningPlugin): Promise<void> {
  if (item.child.exitCode !== null) return;
  if (item.shutdownPath) {
    await fetch(item.url+item.shutdownPath, {
      method: 'POST', signal: AbortSignal.timeout(1000),
    }).catch(() => {});
  }
  item.child.stdin?.end();
  if (item.child.exitCode !== null) return;
  await new Promise<void>(done => {
    const timer = setTimeout(() => { item.child.kill(); done(); }, 4000);
    item.child.once('exit', () => { clearTimeout(timer); done(); });
  });
}

export async function startPluginRuntimes(plugins: FramePlugin[], root: string) {
  const running: RunningPlugin[] = [];
  let stopping: Promise<void> | undefined;
  const stop = () => stopping ??= Promise.all(running.map(stopPlugin)).then(() => {});
  try {
    for (const plugin of plugins) {
      if (!plugin.enabled || !plugin.runtime) continue;
      const runtime = plugin.runtime;
      const child = spawn(runtime.command, runtime.args ?? [], {
        cwd: runtime.cwd ? resolve(root, runtime.cwd) : root,
        env: {...process.env, ...runtime.environment},
        windowsHide: true,
        // The Android runtime observes EOF to stop when its owning host exits.
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      child.stderr?.on('data', buffer => process.stderr.write(buffer));
      let port: number;
      try { port = await waitUntilReady(child, plugin.key); }
      catch (error) { child.stdin?.end(); child.kill(); throw error; }
      child.stdout?.resume();
      running.push({key:plugin.key, child, url:'http://127.0.0.1:'+port, shutdownPath:runtime.shutdownPath});
    }
    return {running, stop};
  } catch (error) {
    await stop();
    throw error;
  }
}
