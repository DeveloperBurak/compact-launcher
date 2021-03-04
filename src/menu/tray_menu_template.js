import { app } from "electron";
import ActiveWindowTracker from "../system/ActiveWindowTracker";
import { openSettingsWindow } from "../system/WindowHandler";

export const trayMenuTemplate = [
  {
    label: "Foreground Program",
    submenu: [
      {
        label: "Add to Blacklist",
        click: () => {
          ActiveWindowTracker.addProgram();
        },
      },
      {
        label: "Remove From Blacklist",
        click: () => {
          ActiveWindowTracker.removeProgram();
        },
      },
    ]
  },
  {
    label: "Settings",
    click: () => {
      openSettingsWindow();
    },
  },
  {
    label: "Exit",
    click: () => {
      app.quit();
    },
  },
];
