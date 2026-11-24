import {IconButton, Pressable} from 'loom-frame/ui';
import {
  useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent,
} from 'react';
import {
  Columns2, Grip, Maximize, Minimize, Moon, RotateCcw, Scan, Sun,
} from 'lucide-react';
import type {Entry, Props, Value} from '../catalog';
import {defaultThemes, type Theme} from '../theme';
import {PreviewCanvas} from './PreviewCanvas';
import {libraryOptions} from '../library-registry';

type Dimensions = {width: number; height: number};
type Axis = 'width' | 'height' | 'both';

const handles = [
  {axis: 'width', label: '拖动调整容器宽度'},
  {axis: 'height', label: '拖动调整容器高度'},
  {axis: 'both', label: '拖动调整容器宽高'},
] as const;

type PreviewWorkbenchProps = {
  entry: Entry;
  props: Props;
  theme: Theme;
  onPatch: (key: string, value: Value) => void;
  onThemeMode: (mode: 'light' | 'dark') => void;
  palettes?: Record<Theme['mode'], Theme>;
  libraryKey?: string;
  tokens?: Record<string, string>;
  scene?: boolean;
  playback?: number;
};

export function PreviewWorkbench({
  entry, props, theme, onPatch, onThemeMode, palettes = defaultThemes,
  libraryKey = entry.id.split(':')[0], tokens = {}, scene = false, playback = 0,
}: PreviewWorkbenchProps) {
  const options = libraryOptions(libraryKey, entry);
  const fillCanvas = Boolean(options.fillCanvas);
  const viewport = options.viewport;
  const fixedViewport = Boolean(viewport) && !fillCanvas;
  const section = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const [custom, setCustom] = useState<Dimensions | null>(null);
  const [fullCustom, setFullCustom] = useState<Dimensions | null>(null);
  const [actual, setActual] = useState<Dimensions>({width: 0, height: 0});
  const [space, setSpace] = useState({width: 0, height: 0, gap: 0, label: 0});
  const [compare, setCompare] = useState(false);
  const [highlight, setHighlight] = useState(false);
  const [full, setFull] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dimensions = full ? fullCustom : custom;
  const setDimensions = full ? setFullCustom : setCustom;
  const drag = useRef<{x: number; y: number; size: Dimensions; axis: Axis; heightFactor: number} | null>(null);
  const resizeFrame = useRef(0);
  const pendingSize = useRef<Dimensions | null>(null);

  useEffect(() => {
    cancelAnimationFrame(resizeFrame.current);
    resizeFrame.current = 0;
    pendingSize.current = null;
    drag.current = null;
    setDragging(false);
    setCustom(null);
    setFullCustom(null);
    return () => cancelAnimationFrame(resizeFrame.current);
  }, [libraryKey, entry.id]);
  useEffect(() => setCompare(false), [libraryKey]);

  useLayoutEffect(() => {
    const node = frame.current;
    const stage = node?.closest<HTMLElement>('.canvas-stage');
    if (!node || !stage) return;
    const scrollport = stage.closest<HTMLElement>('[data-lui-overlay-scrollport]');
    const scrollContent = scrollport?.firstElementChild;
    const toolbar = stage.previousElementSibling;
    const verticalPadding = (style: CSSStyleDeclaration) =>
      (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);

    const measure = () => {
      const width = node.clientWidth, height = node.clientHeight;
      setActual(previous => previous.width === width && previous.height === height ?
        previous : {width, height});
      const style = getComputedStyle(stage);
      const availableHeight = scrollport && scrollContent && toolbar ? Math.max(120, Math.floor(scrollport.clientHeight -
        verticalPadding(getComputedStyle(scrollContent)) - toolbar.getBoundingClientRect().height - verticalPadding(style) - 3)) : 0;
      const next = {
        width: stage.clientWidth,
        height: availableHeight,
        gap: parseFloat(style.getPropertyValue('--w-frame-gap')) || 0,
        label: parseFloat(style.getPropertyValue('--w-frame-label-height')) || 0,
      };
      setSpace(previous => previous.width === next.width && previous.height === next.height && previous.gap === next.gap &&
        previous.label === next.label ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    observer.observe(stage);
    if (scrollport) observer.observe(scrollport);
    if (toolbar) observer.observe(toolbar);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!full) return;
    const previous = document.activeElement as HTMLElement | null;
    const blocked: [HTMLElement, boolean][] = [];
    let branch = section.current;
    while (branch?.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          blocked.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      branch = branch.parentElement;
      if (branch === document.body) break;
    }
    section.current?.querySelector<HTMLButtonElement>('[aria-label="退出全屏"]')?.focus({preventScroll: true});
    return () => {
      for (const [node, inert] of blocked) node.inert = inert;
      if (previous?.isConnected) previous.focus({preventScroll: true});
    };
  }, [full]);

  useEffect(() => {
    if (!full) return;
    const close = () => {
      drag.current = null;
      cancelAnimationFrame(resizeFrame.current);
      resizeFrame.current = 0;
      pendingSize.current = null;
      setDragging(false);
      setFull(false);
    };
    const key = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) {
        event.preventDefault();
        close();
      }
    };
    const message = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.data?.type !== 'frame:escape') return;
      if ([...section.current!.querySelectorAll('iframe')].some(node => node.contentWindow === event.source)) close();
    };
    document.addEventListener('keydown', key);
    window.addEventListener('message', message);
    return () => {
      document.removeEventListener('keydown', key);
      window.removeEventListener('message', message);
    };
  }, [full]);

  const normalWidth = viewport?.width ?? 400;
  const minimumColumn = viewport?.minWidth ?? 160;
  const requestedWidth = fixedViewport && !full
    ? normalWidth * (compare ? 2 : 1) + (compare ? space.gap : 0)
    : space.width;
  const widthBasis = Math.min(dimensions?.width ?? requestedWidth, space.width);
  const stacked = compare && space.width > 0 && widthBasis < minimumColumn * 2 + space.gap;
  const heightFactor = stacked ? 2 : 1;
  const labelHeight = compare ? space.label : 0;
  const measuredHeight = Math.round((actual.height - (stacked ? space.gap : 0)) / heightFactor - labelHeight);
  const canvasWidth = dimensions?.width ??
    (full || !fixedViewport ? '100%' : stacked || !compare ? normalWidth : requestedWidth);
  const sideSpace = Math.max(0, (space.width - actual.width) / 2);
  const requestedHeight = dimensions?.height ?? viewport?.height ?? options.height ??
    (scene ? 'var(--w-scene-height)' : 'var(--w-canvas-height)');
  const baseHeight = fillCanvas && !full && !dimensions && !stacked && space.height && typeof requestedHeight === 'number'
    ? Math.min(requestedHeight, Math.max(120, space.height - labelHeight)) : requestedHeight;
  const heightValue = typeof baseHeight === 'number' ? baseHeight + 'px' : baseHeight;
  const canvasHeight = full && !dimensions
    ? stacked ? 'calc(200% + var(--w-frame-gap))' : '100%'
    : stacked ? 'calc(2 * (' + heightValue + ' + var(--w-frame-label-height)) + var(--w-frame-gap))'
      : compare ? 'calc(' + heightValue + ' + var(--w-frame-label-height))' : heightValue;

  function clampWidth(width: number) {
    const maximum = space.width || Number.POSITIVE_INFINITY;
    return Math.min(maximum, Math.max(160, width));
  }

  function flush() {
    cancelAnimationFrame(resizeFrame.current);
    resizeFrame.current = 0;
    if (pendingSize.current) {
      setDimensions(pendingSize.current);
      pendingSize.current = null;
    }
  }

  function start(event: PointerEvent<HTMLButtonElement>, axis: Axis) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.focus({preventScroll: true});
    event.currentTarget.setPointerCapture(event.pointerId);
    const size = {width: actual.width, height: measuredHeight};
    drag.current = {x: event.clientX, y: event.clientY, size, axis, heightFactor};
    setDimensions(size);
    setDragging(true);
  }

  function move(event: PointerEvent<HTMLButtonElement>) {
    const change = drag.current;
    if (!change) return;
    const dx = change.axis === 'height' ? 0 : 2 * (event.clientX - change.x);
    const dy = change.axis === 'width' ? 0 : (event.clientY - change.y) / change.heightFactor;
    pendingSize.current = {
      width: clampWidth(Math.round(change.size.width + dx)),
      height: Math.max(120, Math.round(change.size.height + dy)),
    };
    if (!resizeFrame.current) resizeFrame.current = requestAnimationFrame(flush);
  }

  function end() {
    flush();
    drag.current = null;
    setDragging(false);
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>, axis: Axis) {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const step = event.shiftKey ? 50 : 10;
    const dx = axis === 'height' ? 0 : event.key === 'ArrowRight' ? step : event.key === 'ArrowLeft' ? -step : 0;
    const dy = axis === 'width' ? 0 : event.key === 'ArrowDown' ? step : event.key === 'ArrowUp' ? -step : 0;
    setDimensions(previous => ({
      width: clampWidth((previous?.width ?? actual.width) + dx),
      height: Math.max(120, (previous?.height ?? measuredHeight) + dy),
    }));
  }

  function fullscreen() {
    end();
    setFull(!full);
  }

  const alternate = (mode: 'light' | 'dark'): Theme => mode === theme.mode ? theme : {
    ...palettes[mode], accent: theme.accent, radius: theme.radius, fontSize: theme.fontSize,
    motion: theme.motion, borderWidth: theme.borderWidth, shadow: theme.shadow,
  };

  return <section ref={section} data-fixed-viewport={fixedViewport || undefined} data-fill-canvas={fillCanvas || undefined}
    className={'canvas-section responsive-preview' + (full ? ' is-fullscreen is-window-fullscreen' : '')}>
    <div className="canvas-toolbar">
      <div className="canvas-tools">
        <IconButton label="浅色预览" pressed={!compare && theme.mode === 'light'}
          onClick={() => {setCompare(false); onThemeMode('light');}}><Sun/></IconButton>
        <IconButton label="深色预览" pressed={!compare && theme.mode === 'dark'}
          onClick={() => {setCompare(false); onThemeMode('dark');}}><Moon/></IconButton>
        <IconButton label="对比明暗外观" pressed={compare} onClick={() => setCompare(!compare)}><Columns2/></IconButton>
        {options.highlight !== false && <>
          <span className="toolbar-divider"/>
          <IconButton label="高亮组件边界" pressed={highlight} onClick={() => setHighlight(!highlight)}><Scan/></IconButton>
        </>}
      </div>
      <div className="canvas-dimensions">
        <output aria-label="预览容器尺寸">{actual.width} × {actual.height}</output>
        <IconButton label={full ? '恢复铺满画布' : fixedViewport ? '恢复默认预览尺寸' : '恢复容器自适应尺寸'}
          disabled={!dimensions} onClick={() => setDimensions(null)}><RotateCcw/></IconButton>
        <IconButton label={full ? '退出全屏' : '全屏预览'} onClick={fullscreen}>{full ? <Minimize/> : <Maximize/>}</IconButton>
      </div>
    </div>
    <div className="canvas-stage">
      <div className={'resizable-canvas' + (dragging ? ' is-resizing' : '')}
        data-edge-tight={sideSpace < 16 || undefined}
        style={{width: canvasWidth, height: canvasHeight, '--w-preview-side-space': sideSpace + 'px'} as CSSProperties}>
        <div ref={frame} className={'canvas-frames' + (compare ? ' is-compare' : '') + (stacked ? ' is-stacked' : '')}>
          <div className="canvas-frame-wrap">
            {compare && <span className="frame-label">浅色</span>}
            <PreviewCanvas fillContainer entry={entry} props={props} theme={compare ? alternate('light') : theme}
              highlight={highlight} scene={scene} playback={playback} libraryKey={libraryKey} tokens={tokens}
              onPatch={onPatch} title={scene ? entry.label + '使用场景' : undefined}/>
          </div>
          {compare && <div className="canvas-frame-wrap">
            <span className="frame-label">深色</span>
            <PreviewCanvas fillContainer entry={entry} props={props} theme={alternate('dark')} highlight={highlight}
              scene={scene} libraryKey={libraryKey} tokens={tokens} onPatch={onPatch} title={entry.label + '深色对比'}/>
          </div>}
        </div>
        {handles.map(({axis, label}) => <Pressable key={axis} type="button"
          className={'canvas-resize canvas-resize--' + axis} aria-label={label} title={label + '（也可使用方向键）'}
          onPointerDown={event => start(event, axis)} onPointerMove={move}
          onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end} onKeyDown={event => keyboard(event, axis)}>
          {axis === 'both' && <Grip size={14} aria-hidden="true"/>}
        </Pressable>)}
      </div>
    </div>
  </section>;
}
