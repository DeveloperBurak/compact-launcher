import { BrowserWindow, Menu, screen } from 'electron';
import path from 'path';
import scenes from '../configs/scenes.json';
import { devLog } from '../helpers/console';
import { isDev } from '../helpers/env';
import { isLinux, isWindows } from '../helpers/os';
import { getSteamUser, themeInfo } from '../strings/ipc';
import * as setting from '../strings/settings';
import { primaryThemeColor, secondaryThemeColor, textColor } from '../strings/store';

export default class WindowHandler {
  constructor({ steamDriver, preferenceManager, storeManager }) {
    this.collapsedWindow = null;
    this.expandedWindow = null;
    this.settingsWindow = null;
    this.toolsWindow = null;
    this.welcomeWindow = null;
    this.steamDriver = steamDriver;
    this.preferenceManager = preferenceManager;
    this.storeManager = storeManager;
  }

  openWelcomeWindow = () => {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays.find((display) => display.bounds.x === 0 || display.bounds.y === 0);
    const welcomeWindow = this.createWindow('welcome', scenes.welcomeScreen);
    welcomeWindow.setBounds({
      x: primaryDisplay.bounds.x + primaryDisplay.size.width / 2 - welcomeWindow.getSize()[0] / 2,
      y: primaryDisplay.bounds.y + primaryDisplay.size.height / 2 - welcomeWindow.getSize()[1] / 2,
    });
    welcomeWindow.loadURL(path.join(__dirname, 'views/welcome.html'));
    Menu.setApplicationMenu(null);
    welcomeWindow.on('ready-to-show', () => {
      welcomeWindow.show();
      if (this.expandedWindow != null) this.expandedWindow.close();
      this.welcomeWindow = welcomeWindow;
    });
    welcomeWindow.on('closed', () => {
      this.welcomeWindow = null;
    });
  };

  openCollapsedWindow = () => {
    if (this.collapsedWindow == null) {
      const collapsedWindow = this.createWindow('collapsed', scenes.collapsed);
      collapsedWindow.loadURL(path.join(__dirname, 'views', 'collapsed.html'));
      collapsedWindow.on('ready-to-show', () => {
        collapsedWindow.show();
        this.sendThemeInfo(collapsedWindow);
        if (this.expandedWindow != null) this.expandedWindow.close();
        this.collapsedWindow = collapsedWindow;
      });
      collapsedWindow.on('closed', () => {
        this.collapsedWindow = null;
      });
    } else {
      this.collapsedWindow.show();
    }
  };

  openExpandedWindow = () => {
    if (this.expandedWindow == null) {
      const expandedWindow = this.createWindow('expanded', scenes.expanded);
      expandedWindow.loadURL(path.join(__dirname, 'views/expanded.html'));
      expandedWindow.on('ready-to-show', async () => {
        let steamUser;
        try {
          steamUser = await this.steamDriver.getUser();
        } catch (err) {
          devLog(err);
        }
        if (steamUser != null && steamUser.account !== false) {
          expandedWindow.webContents.send(getSteamUser, steamUser);
        }
        this.expandedWindow = expandedWindow;
        this.expandedWindow.show();
        this.sendThemeInfo(expandedWindow);
        if (this.collapsedWindow != null) {
          this.collapsedWindow.close();
          this.collapsedWindow = null;
        }
      });
      expandedWindow.on('closed', () => {
        this.expandedWindow = null;
      });
    } else {
      this.expandedWindow.show();
    }
  };

  openSettingsWindow = () => {
    if (this.settingsWindow == null) {
      const settingsWindow = this.createWindow('subSettings', scenes.settingsScreen);
      settingsWindow.loadURL(path.join(__dirname, 'views/sub/settings.html'));
      settingsWindow.setMenu(null);
      settingsWindow
        .on('ready-to-show', () => {
          this.settingsWindow = settingsWindow;
          if (this.expandedWindow != null) {
            this.expandedWindow.close();
            this.expandedWindow = null;
          }
          settingsWindow.show();
          this.sendThemeInfo(settingsWindow);
        })
        .on('closed', () => {
          this.settingsWindow = null;
        });
    } else {
      this.settingsWindow.show();
    }
  };

  openToolsWindow = () => {
    if (this.toolsWindow === null) {
      const toolsWindow = this.createWindow('subTools', scenes.toolsScreen);
      toolsWindow.loadURL(path.join(__dirname, 'views/sub/tools.html'));
      toolsWindow.setMenu(null);
      this.toolsWindow = toolsWindow;
      this.toolsWindow
        .on('ready-to-show', () => {
          if (this.expandedWindow != null) {
            this.expandedWindow.close();
            this.expandedWindow = null;
          }
          this.toolsWindow.show();
          this.sendThemeInfo(this.toolsWindow);
        })
        .on('closed', () => {
          this.toolsWindow = null;
        });
    }
  };

  /**
   * @param {BrowserWindow} win
   */
  sendThemeInfo = (win) => {
    win.webContents.send(themeInfo, {
      primary: this.storeManager.get(primaryThemeColor),
      secondary: this.storeManager.get(secondaryThemeColor),
      text: this.storeManager.get(textColor),
    });
  };

  createWindow = (_name, options) => {
    let win = null;
    const windowOptions = {
      frame: options.frame ?? false,
      transparent: options.transparent ?? false,
      useContentSize: options.useContentSize ?? false,
      skipTaskbar: options.skipTaskbar ?? true,
      resizable: options.resizable ?? false,
      show: options.show ?? false,
      center: options.center ?? null,
      fullscreen: options.fullscreen ?? null,
      width: options.width ?? screen.getPrimaryDisplay().size.width,
      height: options.height ?? screen.getPrimaryDisplay().size.height,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js'),
      },
    };

    if (options.type === 'toolbar') {
      if (isWindows() || isLinux()) {
        windowOptions.type = options.type;
      }
    }

    const alwaysOnTop = this.preferenceManager.get(setting.alwaysOnTop);
    if (typeof options.alwaysOnTop !== typeof undefined) {
      windowOptions.alwaysOnTop = options.alwaysOnTop;
    } else if (alwaysOnTop != null) {
      windowOptions.alwaysOnTop = alwaysOnTop;
    }

    // TODO add multimonitor support
    if (windowOptions.center == null) {
      windowOptions.x = options.x ?? 0;
      windowOptions.y = options.y ?? 0;
    }

    win = new BrowserWindow(windowOptions);
    const additionalTitle = options.title != null ? ` - ${options.title}` : '';
    win.setTitle(`Compact Launcher ${additionalTitle}`);
    win.setSkipTaskbar(options.skipTaskbar ?? false);
    if (options.devTools && isDev()) {
      win.webContents.openDevTools({ mode: 'undocked' });
    }
    win.webContents.setFrameRate(60);
    return win;
  };

  static getCurrentWindow = () => BrowserWindow.getFocusedWindow();

  static getAllWindows = () => BrowserWindow.getAllWindows();
}
