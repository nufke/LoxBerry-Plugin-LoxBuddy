/**
 * In-memory Application State for the PWA
 */
export interface AppState {
  mode: Mode;
  settings: Settings;
  structure: Structure;
  notifications: NotificationMessage[];
}

/**
 * Properties for Control structure
 */
export interface Structure {
  msInfo: { [key: string]: MsInfo };
  globalStates: { [key: string]: GlobalStates };
  controls: { [key: string]: Control };
  categories: { [key: string]: Category };
  rooms: { [key: string]: Room };
}

/**
 * Properties for Settings
 */
export interface Settings {
  app?: AppSettings;
  mqtt?: MqttSettings;
  pms?: PMSSettings;
}

/**
 * Properties for App Settings
 */
export interface AppSettings {
  id: string;
  darkTheme: boolean;
  language: string;
  lockPage: boolean;
  timeout: number;
  enableBiometricId?: boolean; // TODO
  pin: string;
  localNotifications: boolean;
  remoteNotifications: boolean;
}

/**
 * Properties for MQTT Settings
 */
export interface MqttSettings {
  hostname: string;
  port: number;
  username: string;
  password: string;
  topic: string;
}

/**
 * Properties for PMS Settings
 */
export interface PMSSettings {
  url: string; // url to push messaging service
  id: string;  // user/device id (e.g. serialnr)
  key: string; // personal private key
}

/**
 * Properties for App operational mode
 */
export interface Mode {
  connected: boolean
}

export const INITIAL_MQTT_SETTINGS: MqttSettings = {
  hostname: '',
  port: 9083,
  username: '',
  password: '',
  topic: ''
}

export const INITIAL_APP_SETTINGS: AppSettings = {
  id: null,
  darkTheme: true,
  language: 'en',
  lockPage: false,
  timeout: 600000,
  pin: '0000',
  localNotifications: false,
  remoteNotifications: false,
}

export const INITIAL_MODE: Mode = {
  connected: false
}

export const INITIAL_STRUCTURE: Structure = {
  msInfo: {},
  globalStates: {},
  controls: {},
  categories: {},
  rooms: {}
}

/**
 * Initial values for push messaging service
 */
export const INITIAL_PMS_SETTINGS: PMSSettings = {
  url: '',
  id: '',
  key: ''
}

/**
 * Initial values for settings
 */
export const INITIAL_SETTINGS: Settings = {
  app: INITIAL_APP_SETTINGS,
  mqtt: INITIAL_MQTT_SETTINGS,
  pms: INITIAL_PMS_SETTINGS
}

/**
 * Initial Application State
 */
export const INITIAL_APP_STATE: AppState = {
  mode: INITIAL_MODE,
  settings: INITIAL_SETTINGS,
  structure: INITIAL_STRUCTURE,
  notifications: []
}

/**
 * Initial values for global states
 */
export const INITIAL_GLOBALSTATES: GlobalStates = {
  operatingMode: 0,
  sunrise: 0,
  sunset: 0,
  pastTasks: [],
  plannedTasks: [],
  notifications: {},
  modifications: {},
  favColorSequences: [],
  favColors:  [],
  miniserverTime: new Date('2000-01-01'),
  liveSearch: {},
  userSettings: {},
  userSettingsTs: {},
  cloudservice: {},
  hasInternet: 0
}

/**
 * Properties for Miniserver info
 */
export interface MsInfo {
  serialNr: string;             // serial number of the Miniserver
  msName: string;               // name of the Miniserver
  projectName?: string;         // project name as defined in Loxone Config
  localUrl?: string;            // local IP address and port
  remoteUrl?: string;           // internet IP address and port
  hostname?: string;            // miniserver hostname (when using DHCP)
  tempUnit?: number;            // temperature unit: 0 = C, 1 = F
  currency?: string;            // currency symbol
  squareMeasure?: string;       // unit of area
  location?: string;            // location of the Miniserver
  latitude?: number;            // GPS latitude
  longitude?: number;           // GPS longitude
  altitude?: number;            // GPS altitude
  languageCode?: string;        // language string
  heatPeriodStart?: string;     // month and day when the heating period starts (DEPRECATED)
  heatPeriodEnd?: string;       // month and day when the heating period ends (DEPRECATED)
  coolPeriodStart?: string;     // month and day when the cooling period starts (DEPRECATED)
  coolPeriodEnd?: string;       // month and day when the cooling period ends (DEPRECATED)
  catTitle?: string;            // locale name of categories
  roomTitle?: string;           // locale name of rooms
  miniserverType?: 0,           // miniserver type (0:Gen1, 1:GoGen1, 2:Gen2, 3:GoGen2, 4:Compact)
  deviceMonitor?: string;       // ??
  currentUser?: {
    name?: string;              // current user name
    uuid?: string;              // current user uuid
    isAdmin?: boolean;          // is user admin
    changePassword?: boolean;   // can the user change the password
    userRights?: number;        // ??
  }
}

/**
 * Properties for global states
 */
export interface GlobalStates {
  operatingMode?: number;       // operating mode number
  sunrise?: number;             // minutes since midnight, using Miniserver location
  sunset?: number;              // minutes since midnight, using Miniserver location
  pastTasks?: string[];         // ??
  plannedTasks?: string[];      // ??
  notifications?: any;          // notifications
  modifications?: any;          // structural changes made via API published as text events
  favColorSequences?: string[]; // favorite color sequences used in LightControllerV2
  favColors?:  string[];        // favorite colors used in LightControllerV2
  miniserverTime?: Date;        // current date, time & UTC-offset of the Miniserver
  liveSearch?: any;             // JSON object with current information about device learning
  userSettings?: any;           // ??
  userSettingsTs?: any;         // ??
  cloudservice?: any;           // ??
  hasInternet?: number;         // ??
}

/**
 * Properties for Control elements
 */
export interface Control {
  serialNr: string;             // serial nr of the device
  uuid: string;                 // unique identifier to identify the control
  uuidAction: string;           // unique identifier to identify the control action (same as uuid)
  mqtt: string;                 // MQTT topic to publish commands
  name: string;                 // GUI name of the control
  defaultIcon: string;          // default icon
  icon: {
    href: string;               // location or URL of SVG icon
    color?: string;             // color of icon in RGB hex notation, e.g. #FFFFFF (optional)
  }
  type: string;                 // type of control, e.g., switch, button, slider, etc.
  room: string;                 // uuid of room (serialNr of room should match serialNr of control)
  category: string;             // uuid of category (serialNr of category should match serialNr of control)
  isFavorite: boolean;          // elevate to favorite item (optional)
  isVisible?: boolean;          // make control invisible (optional)
  isSecured?: boolean;          // passwd/PIN protected control (optional)
  details: any;                 // control details
  states: any;                  // control states
  subControls: {
    [key: string]: SubControl;  // subControls
  }
  defaultRating: number;        // default rating
  order: number[];              // defines the order for the controls (optional)
}

/**
 * Properties for SubControl elements
 */
export interface SubControl {
  uuid: string;                 // unique identifier to identify the subcontrol
  uuidAction: string;           // unique identifier to identify the subcontrol action (same as uuid)
  name: string;                 // GUI name of the subcontrol
  mqtt: string;                 // MQTT topic to publish commands
  icon: {
    href: string;               // location or URL of SVG icon
    color?: string;             // color of icon in RGB hex notation, e.g. #FFFFFF (optional)
  }
  type: string;                 // type of control, e.g., switch, button, slider, etc.
  isFavorite?: boolean;         // elevate to favorite item (optional)
  isVisible?: boolean;          // make control invisible (optional)
  isSecured?: boolean;          // passwd/PIN protected control (optional)
  states: any;                  // control states
  order: number[];              // defines the order of subControls (optional)
}

/**
 * Properties to specify Category
 */
export interface Category {
  serialNr: string;             // serial nr of the device
  uuid: string;                 // unique identifier to identify the category
  mqtt: string;                 // MQTT topic to publish commands
  name: string;                 // GUI name of the category
  icon: {
    href: string;               // location or URL of default SVG icon
    color?: string;             // color in RGB hex notation, e.g. #FFFFFF (optional)
  }
  type: string;                 // type of category
  image?: string;               // location for the bitmap image (optional)
  isFavorite?: boolean;         // elevate to favorite item (optional)
  isVisible?: boolean;          // make category invisible (optional)
  isSecured?: boolean;          // passwd/PIN protected control (optional)
  defaultRating: number;        // default rating
  order?: number[];             // defines the order for categories (optional)
}

/**
 * Properties to specify Room
 */
export interface Room {
  serialNr: string;             // serial nr of the device
  uuid: string;                 // unique identifier to identify the room as MQTT topic  (device-uuid)
  mqtt: string;                 // MQTT topic to publish commands
  name: string;                 // GUI name of the room
  icon: {
    href: string;               // location or URL to SVG icon
    color?: string;             // color in RGB hex notation, e.g. #FFFFFF (optional)
  }
  type: string;                 // type of room
  image?: string;               // location for the bitmap image (optional)
  isFavorite?: boolean;         // elevate to favorite item (optional)
  isVisible?: boolean;          // make category invisible (optional)
  isSecured?: boolean;          // passwd/PIN protected control (optional)
  defaultRating: number;        // default rating
  order?: number[];             // defines the order for rooms (optional)
}

/**
 * Properties to specify a notification message
 */
export interface NotificationMessage {
  data?: { 
    mac: string;   // mac or serial ID of miniserver
    lvl: number;   // level: 1 = Info, 2 = Error, 3 = SystemError
    uuid?: string; // UUID of Control (optional)
  }
  message: string; // message, could be value, e.g. "1"
  title: string;   // title
  ts: number;      // unix timestamp, e.g. 1697891543
  type: number;    // 10 = normal message, 11 = message summary
  uid: string;     // unique message id
  uids?: string[]; // list of messages (optional)
  url?: string;    // url/path to control (optional, added by LoxBuddy)
}