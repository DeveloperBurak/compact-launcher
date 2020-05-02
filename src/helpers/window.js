// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import {BrowserWindow, screen} from "electron";

export default (name, options) => {
  let win;

  // default assigning
  if (options.frame == null) {
    options.frame = false;
  }
  if (options.transparent == null) {
    options.transparent = false;
  }
  if (options.useContentSize == null) {
    options.useContentSize = false;
  }
  if (options.alwaysOnTop == null) {
    options.alwaysOnTop = true;
  }
  if (options.skipTaskbar == null) {
    options.skipTaskbar = true;
  }
  if (options.resizable == null) {
    options.resizable = false;
  }
  if (options.center == null) {
    if (!(options.x && options.y)) {
      options.x = 0;
      options.y = 0;
    }
  }

  if (options.width == null && options.height == null) {
    const {width, height} = screen.getPrimaryDisplay().size;
    options.width = width;
    options.height = height;
  }
  win = new BrowserWindow(Object.assign({}, options));
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
