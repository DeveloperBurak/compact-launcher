// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import {BrowserWindow, screen} from "electron";

export default (name, options) => {
  let win;

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
  return win;
};
