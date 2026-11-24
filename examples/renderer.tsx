import type {LibraryRenderer} from 'loom-frame';
import {Button} from 'loom-frame/ui';
import 'loom-frame/ui/styles.css';

export const renderer: LibraryRenderer = {
  applyTheme(theme) {
    document.documentElement.dataset.luiTheme = theme.mode;
    document.documentElement.style.setProperty('--lui-accent', theme.accent);
  },
  render({props}) {
    return <Button variant="primary" disabled={Boolean(props.disabled)}>{String(props.label)}</Button>;
  },
};
