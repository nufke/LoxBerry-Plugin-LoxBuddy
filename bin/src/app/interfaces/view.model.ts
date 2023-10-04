import { Control, SubControl, Room, Category } from './data.model';

/**
 * View Models used for Components to store UI specific properties and states
 */

export interface CategoryListVM {
  categories: Category[];
  categoriesList: Category[];
  categoriesFavs: Category[];
}

export interface RoomListVM {
  rooms: Room[];
  roomsList: Room[];
  roomsFavs: Room[];
}

export interface ControlListVM {
  controls: Control[];
  favorites: Control[];
  labels?: Room[] | Category[];
  page?: Room | Category | { name: string };
}

export interface ColorPickerVM {
  control: Control;
  subControl: SubControl;
  rgb: {
    r: number;
    g: number;
    b: number;
  }
  position: number;
}

export interface DimmerVM {
  control: Control;
  subControl: SubControl;
  ui: {
    name: string;
    buttonColor: string;
    slider: {
      position: number;
      min: number;
      max: number;
      step: number;
      color: string;
    }
  }
  rgb?: number[];
}

export interface RadioListItem {
  id: number;
  name: string;
  value?: number[];
  show?: boolean;
  abs?: number[]; // TODO selarate listitem for present
}

export interface RadioVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    radioList: RadioListItem[];
    selectedId: number;
    icon?: {
      tempBase: string;
      tempDec: string
    }
    status: {
      text: string;
      color: string;
    }
    toggle?: boolean;
  }
  subControls?: SubControl[];
}

export interface IRCVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    tempTarget: number,
    tempActual: number,
    tempUnit: string,
    modeList: RadioListItem[];
    mode: number;
    presetList: RadioListItem[];
    preset: number;
    icon: {
      tempBase: string;
      tempDec: string
    }
    status: {
      text: string;
      color: string;
    }
  }
}

export interface SliderVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    slider:  {
      position: number;
    }
    status: {
      text: string;
      color: string;
    }
  }
}

export interface SwitchVM {
  control: Control;
  subControl: SubControl;
  ui: {
    name: string;
    status: {
      text: string;
      color: string;
    }
    toggle: boolean;
  }
}

export interface TextVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    icon?: {
      tempBase: string;
      tempDec: string
    }
    status: {
      text: string;
      color: string;
    }
  }
}
export interface DaytimerVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    icon?: {
      tempBase: string;
      tempDec: string
    }
    status: {
      text: string;
      color: string;
    }
    timer: {
      enabled: boolean;
      endTime: number;
      text: string;
    }
    calendar: {
      output: boolean;
      datetime: string;
      locale: string;
    }
  }
}

export interface AlarmVM {
  control: Control;
  ui: {
    name: string;
    room: string;
    category: string;
    icon?: {
      tempBase: string;
      tempDec: string
    }
    status: {
      text: string;
      color: string;
    }
    button: {
      text: string;
    }
  }
  state: boolean; // e.g. armed, service
}