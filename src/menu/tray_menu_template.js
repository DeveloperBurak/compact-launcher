import {app} from "electron";


export const trayMenuTemplate = [
  {
    label: "Exit",
    click: () => {
      app.quit();
    },
  },
  /*{
    label: "About",
    click: () => {

    }
  }*/
];
