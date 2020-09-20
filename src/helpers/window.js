// This helper remembers the size and position of your windows (and restores
// them in that place after app relaunch).
// Can be used for more than one window, just construct many
// instances of it and give each different name.

import { BrowserWindow, screen } from "electron";
import { getSetting } from "../system/System";
import * as setting from "./settingKeys";

export default (name, options) => {
  let win;

  // default assigning
  options.frame = options.frame ?? false;
  options.transparent = options.transparent ?? false;
  options.useContentSize = options.useContentSize ?? false;
  options.alwaysOnTop = options.alwaysOnTop ?? false;
  options.skipTaskbar = options.skipTaskbar ?? true;
  options.resizable = options.resizable ?? false;
  options.show = options.show ?? false;
  options.webPreferences = { nodeIntegration: true };
  getSetting(setting.alwaysOnTop).then((value) => {
    if (value != null) {
      options.alwaysOnTop = value;
    }
  }).catch(error => {
    console.log(error)
  });
  if (options.center == null) {
    options.x = options.x ?? 0;
    options.y = options.y ?? 0;
  }

  if (options.width == null && options.height == null) {
    const { width } = screen.getPrimaryDisplay().size;
    options.width = width;
  }
  if(options.height == null){
    const { height } = screen.getPrimaryDisplay().size;
    options.height = height;
  }
  win = new BrowserWindow(Object.assign({}, options));
  const additionalTitle = options.title != null ? " - " + options.title : null;
  win.setTitle("Compact Launcher" + additionalTitle);
  win.setSize(options.width, options.height);
  if (options.x && options.y) {
    win.setPosition(options.x, options.y);
  }
  win.setAlwaysOnTop(options.alwaysOnTop);
  win.setSkipTaskbar(options.skipTaskbar);
  return win;
};
