/**
 * In-memory Application State for the PWA
 */
export interface AppState {
  mode: Mode;
  settings: Settings;
  structure: Structure;
}

export interface Structure {
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
}

/**
 * Properties for App Settings
 */
export interface AppSettings {
  dark_theme: boolean;
  language: string;
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
 * Properties for App operational mode
 */
export interface Mode {
  connected: boolean
}

export const INITIAL_MQTT_SETTINGS: MqttSettings = {
  hostname: '',
  port: null,
  username: '',
  password: '',
  topic: ''
}

export const INITIAL_APP_SETTINGS: AppSettings = {
  dark_theme: false,
  language: 'en'
}

export const INITIAL_MODE: Mode = {
  connected: false
}

export const INITIAL_STRUCTURE: Structure = {
  controls: {},
  categories: {},
  rooms: {}
}

/**
 * Application State initial values
 */
export const INITIAL_APP_STATE: AppState = {
  mode: INITIAL_MODE,
  settings: {
    app: INITIAL_APP_SETTINGS,
    mqtt: INITIAL_MQTT_SETTINGS
  },
  structure: INITIAL_STRUCTURE
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
