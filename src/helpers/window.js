// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import {
  app,
  BrowserWindow,
  screen
} from "electron";
import jetpack from "fs-jetpack";
import env from "env";

export default (name, options) => {
  const userDataDir = jetpack.cwd(app.getPath("userData"));
  const stateStoreFile = `window-state-${name}.json`;
  const defaultSize = {
    width: options.width,
    height: options.height
  };
  let state = {};
  let win;

  const restore = () => {
    let restoredState = {};
    try {
      restoredState = userDataDir.read(stateStoreFile, "json");
    } catch (err) {
      // For some reason json can't be read (might be corrupted).
      // No worries, we have defaults.
    }
    return Object.assign({}, defaultSize, restoredState);
  };

  const getCurrentPosition = () => {
    const position = win.getPosition();
    const size = win.getSize();
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1]
    };
  };

  const windowWithinBounds = (windowState, bounds) => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    );
  };

  const resetToDefaults = () => {
    const bounds = screen.getPrimaryDisplay().bounds;
    return Object.assign({}, defaultSize, {
      x: (bounds.width - defaultSize.width) / 2,
      y: (bounds.height - defaultSize.height) / 2
    });
  };

  const ensureVisibleOnSomeDisplay = windowState => {
    const visible = screen.getAllDisplays().some(display => {
      return windowWithinBounds(windowState, display.bounds);
    });
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults();
    }
    return windowState;
  };

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition());
    }
    userDataDir.write(stateStoreFile, state, {
      atomic: true
    });
  };
  if (env.name === 'production') {
    state = ensureVisibleOnSomeDisplay(restore());
  }
  // default assigning
  if (!options.frame) {
    options.frame = false;
  }
  if (!options.transparent) {
    options.transparent = false;
  }
  if (!options.useContentSize) {
    options.useContentSize = false;
  }
  if (typeof options.alwaysOnTop === 'undefined') {
    options.alwaysOnTop = true;
  }
  if (typeof options.skipTaskbar === 'undefined') {
    options.skipTaskbar = true;
  }
  if (!options.resizable) {
    options.resizable = false;
  }
  if (!options.center) {
    if (!(options.x && options.y)) {
      options.x = 0;
      options.y = 0;
    }
  }

  if (!(options.width && options.height)) {
    const {width, height} = screen.getPrimaryDisplay().size;
    options.width = width;
    options.height = height;
  }
  win = new BrowserWindow(Object.assign({}, options, state));
  win.setTitle("Compact Launcher");
  win.setSize(options.width, options.height);
  if (options.x && options.y) {
    win.setPosition(options.x, options.y);
  }
  win.setAlwaysOnTop(options.alwaysOnTop);
  win.setSkipTaskbar(options.skipTaskbar);
  win.setResizable(options.resizable);


  if (env.name === 'production') {
    win.on("close", saveState);
  }

  return win;
};
