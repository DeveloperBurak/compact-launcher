import EE from 'events';
import { SERVER_URL } from './configs/app.json';
import ForegroundProgramTracker from './system/ForegroundProgramTracker';
import ListUI from './system/ListUI';
import PreferenceManager from './system/PreferenceManager';
import ProgramHandler from './system/ProgramHandler';
import ProgramImageManager from './system/ProgramImageManager';
import Steam from './system/Steam';
import StoreManager from './system/StoreManager';
import Timer from './system/Timer';
import TrayManager from './system/TrayManager';
import UserManager from './system/UserManager';
import WindowHandler from './system/WindowHandler';

Object.setPrototypeOf(Timer.prototype, EE.EventEmitter.prototype);
Object.setPrototypeOf(ForegroundProgramTracker.prototype, EE.EventEmitter.prototype);

export const storeManager = new StoreManager();
const steamDriver = new Steam({ storeManager });
export const userManager = new UserManager({ steamDriver });
export const preferenceManager = new PreferenceManager({ userManager });
export const windowHandler = new WindowHandler({ steamDriver, preferenceManager, storeManager });
export const foregroundProgramTracker = new ForegroundProgramTracker({ windowHandler });
export const programHandler = new ProgramHandler();
export const ListUIObj = new ListUI();
export const programImageManager = new ProgramImageManager(`${SERVER_URL}api/programs`);
export const trayManager = new TrayManager({ foregroundProgramTracker, windowHandler });
export const timer = new Timer();
