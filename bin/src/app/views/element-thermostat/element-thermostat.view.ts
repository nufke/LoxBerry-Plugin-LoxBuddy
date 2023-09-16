import { Component, OnInit, Input, Output, EventEmitter, Renderer2, ViewChild, ElementRef, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ControlService } from '../../services/control.service';

interface propTypes {
  height: string;             // Height of the thermostat (ex: 50% or 400px)
  width: string;              // Width of the thermostat (ex: 50% or 400px)
  numTicks: number;           // Total number of ticks that will be rendered on the thermostat wheel
  minValue: number;           // Lowest temperature able to be displayed on the thermostat
  maxValue: number;           // Highest temperature able to be displayed on the thermostat
  away: boolean;              // Indicates whether or not the thermostat is in "away mode"
  leaf: boolean;              // Indicates whether or not the thermostat is in "energy savings mode"
  ambientTemperature: number; // Actual temperature detected by the thermostat
  targetTemperature: number;  // Desired temperature that the thermostat attempts to reach
  hvacMode: string;           // Current mode of operation within the thermostat ('off', 'heating', 'cooling')
  is_heating: boolean;        // Current heating state
  is_cooling: boolean;        // Current cooling state
};

@Component({
  selector: 'element-thermostat-view',
  templateUrl: 'element-thermostat.view.html',
  styleUrls: ['./element-thermostat.view.scss'],
})
export class ElementThermostatView
  implements OnInit {

  @ViewChild('thermostat', { static: true }) thermostat: ElementRef;

  @Input() tempActual: string;
  @Input() tempTarget: string;
  @Input() mode: string;
  @Input() preset: string;
  @Output() onChange = new EventEmitter<number>();

  // TODO define ViewModel
  styles;
  ambientPosition;
  radius;
  diameter;
  translate;
  interval;

  ambientTemperatureStr = '';
  targetTemperatureStr = ['',''];

  emitChange = false;
  disabled = true;

  ticks = {
    points: [],
    pointsAmbient: [],
    pointsTarget: [],
    min: null,
    max: null,
    rangeValue: null,
    theta: null,
    degrees: null,
    offsetDegrees: null,
    outerRadius: null,
    innerRadius: null
  }

  svg = {
    root: null,
    group: null,
    dial: null,
    tickArray: [],
    ring: null,
    touchArea: null,
    txtTarget: null,
    txtTemperature: null,
    txtTargetTemp: null,
    txtTargetTempDot: null,
    txtAmbientTemp: null,
    leaf: null,
    heating: null,
    cooling: null,
    txtAway: null,
    iconUp: null,
    iconDown: null,
    btnUp: null,
    btnDown: null,
    unit: null
  }

  props: propTypes = {
    height: '350px',
    width: '350px',
    numTicks: 150,
    minValue: 10, //TODO C/F settings (C10, F50)
    maxValue: 30, //TODO C/F settings (C30, F86)
    away: false,
    leaf: false,
    is_heating: false,
    is_cooling: false,
    ambientTemperature: 10,
    targetTemperature: 10,
    hvacMode: 'heating'
  };

  constructor(
    public translateService: TranslateService,
    public controlService: ControlService,
    public renderer: Renderer2
  ) {

    this.diameter = 350;
    this.radius = this.diameter / 2;
    this.ticks.rangeValue = this.props.maxValue - this.props.minValue;

    this.ticks.outerRadius = this.diameter / 30;
    this.ticks.innerRadius = this.diameter / 8;

    this.ticks.degrees = 300;
    this.ticks.offsetDegrees = 180 - (360 - this.ticks.degrees) / 2;
    this.ticks.theta = this.ticks.degrees / this.props.numTicks;

    // Renders the degree ticks around the outside of the thermostat.
    this.ticks.points = [
      [this.radius - 1, this.ticks.outerRadius],
      [this.radius + 1, this.ticks.outerRadius],
      [this.radius + 1, this.ticks.innerRadius],
      [this.radius - 1, this.ticks.innerRadius],
    ];

    this.ticks.pointsTarget = [
      [this.radius - 2.5, this.ticks.outerRadius],
      [this.radius + 2.5, this.ticks.outerRadius],
      [this.radius + 2.5, this.ticks.innerRadius + 20],
      [this.radius - 2.5, this.ticks.innerRadius + 20],
    ];

    this.ticks.pointsAmbient = [
      [this.radius - 2.5, this.ticks.outerRadius],
      [this.radius + 2.5, this.ticks.outerRadius],
      [this.radius + 2.5, this.ticks.innerRadius],
      [this.radius - 2.5, this.ticks.innerRadius],
    ];

    // The styles change based on state.
    this.styles = this.getStyles();
  }

  ngOnChanges() {
    this.props.ambientTemperature = Number(this.tempActual);
    this.props.targetTemperature = Number(this.tempTarget);
    let mode = Number(this.mode);
    let preset = Number(this.preset);
    this.disabled = (mode != 5)&&(mode != 6);
    this.props.leaf = (preset == 0);
    this.render();
  }

  ngOnInit() {
    this.initSVG();
    this.render();
    // Add event listeners for temperate scolling
    this.svg.touchArea.addEventListener('mouseup', this.dragEnd.bind(this));
    this.svg.touchArea.addEventListener('mousedown', this.dragEnd.bind(this));
    this.svg.touchArea.addEventListener('click', this.dragEnd.bind(this));
    this.svg.touchArea.addEventListener('touchend', this.dragEnd.bind(this));
    this.svg.touchArea.addEventListener('mousemove', this.dragMove.bind(this));
    this.svg.touchArea.addEventListener('touchmove', this.dragMove.bind(this));
    this.svg.touchArea.addEventListener('touchmove', this.dragMove.bind(this));

    // Add event listeners for buttons
    this.svg.btnDown.addEventListener('click', this.btnDown.bind(this));
    this.svg.btnDown.addEventListener('touchstart', this.btnDownStart.bind(this));
    this.svg.btnDown.addEventListener('touchend', this.btnDownEnd.bind(this));
    this.svg.btnUp.addEventListener('click', this.btnUp.bind(this));
    this.svg.btnUp.addEventListener('touchstart', this.btnUpStart.bind(this));
    this.svg.btnUp.addEventListener('touchend', this.btnUpEnd.bind(this));
  }

  ngOnDestroy(): void {
  }

  btnUp($event) {
    if (this.disabled) return; // no action if disabled
    this.props.targetTemperature = Number(this.props.targetTemperature) + 0.5;
    if (this.props.targetTemperature > this.props.maxValue) {
      this.props.targetTemperature = this.props.maxValue;
    }
    this.render();
    if (this.emitChange) this.onChange.emit(this.props.targetTemperature);
  }

  btnDown($event) {
    if (this.disabled) return; // no action if disabled
    this.props.targetTemperature = Number(this.props.targetTemperature) - 0.5;
    if (this.props.targetTemperature < this.props.minValue) {
      this.props.targetTemperature = this.props.minValue;
    }
    this.render();
    if (this.emitChange) this.onChange.emit(this.props.targetTemperature);
  }

  btnDownStart($event) {
    if (this.disabled) return; // no action if disabled
    this.emitChange = false;
    this.interval = setInterval(() => {
      this.btnDown($event);
    }, 80);
  }

  btnUpStart($event) {
    if (this.disabled) return; // no action if disabled
    this.emitChange = false;
    this.interval = setInterval(() => {
      this.btnUp($event);
    }, 80);
  }

  btnDownEnd($event) {
    if (this.disabled) return; // no action if disabled
    this.emitChange = true;
    clearInterval(this.interval);
  }

  btnUpEnd($event) {
    if (this.disabled) return; // no action if disabled
    this.emitChange = true;
    clearInterval(this.interval);
  }

  private getStyles() {
    return {
      svg: {
        'WebkitUserSelect': 'none',
        'MozUserSelect': 'none',
        'msUserSelect': 'none',
        'userSelect': 'none'
      },
      dial: {
        'fill': '#0a0c0d', // TODO ion-background-color bark/light
        'WebkitTransition': 'fill 0.5s',
        'transition': 'fill 0.5s',
      },
      ring: {
        'fill': 'transparent',
        'stroke': 'rgba(255, 255, 255, 0.1)',
        'stroke-width': '40',
      },
      description: {
        'fill': 'white',
        'text-anchor': 'middle',
        'alignment-baseline': 'central',
        'font-size': '18px',
        'font-weight': 'normal',
        'visibility': (this.props.away ? 'hidden' : 'visible'),
      },
      targettemp: {
        'fill': 'white',
        'text-anchor': 'middle',
        'font-family': 'Helvetica, sans-serif',
        'alignment-baseline': 'central',
        'font-size': '98px',
        'letter-spacing': '0.01em',
        'font-weight': 'bold',
        'visibility': (this.props.away ? 'hidden' : 'visible'),
      },
      targettempdot: {
        'fill': 'white',
        'text-anchor': 'middle',
        'font-family': 'Helvetica, sans-serif',
        'alignment-baseline': 'central',
        'font-size': '40px',
        'font-weight': 'bold',
      },
      ambienttemp: {
        'fill': 'white',
        'text-anchor': 'middle',
        'font-family': 'Helvetica, sans-serif',
        'alignment-baseline': 'central',
        'font-size': '18px',
        'letter-spacing': '0.01em',
        'font-weight': 'bold',
      },
      away: {
        'fill': 'white',
        'text-anchor': 'middle',
        'font-family': 'Helvetica, sans-serif',
        'alignment-baseline': 'central',
        'font-size': '72px',
        'font-weight': 'bold',
        'opacity': (this.props.away ? 1 : 0),
        'pointer-events': 'none',
      },
      leaf: {
        'fill': '#13EB13',
        'opacity': (this.props.leaf ? 1 : 0),
        'visibility': (this.props.away ? 'hidden' : 'visible'),
        'pointer-events': 'none',
        'style': 'transition: opacity 0.5s'
      },
      heating: {
        'fill': '#e73246',
        'opacity': (this.props.is_heating ? 1 : 0),
        'visibility': (this.props.away ? 'hidden' : 'visible'),
        'pointer-events': 'none',
        'style': 'transition: opacity 0.5s'
      },
      cooling: {
        'fill': '#00b0db',
        'opacity': (this.props.is_cooling ? 1 : 0),
        'visibility': (this.props.away ? 'hidden' : 'visible'),
        'pointer-events': 'none',
        'style': 'transition: opacity 0.5s'
      },
      unit: {
        'fill': 'white',
        'text-anchor': 'middle',
        'alignment-baseline': 'central',
        'font-size': '20px'
      },
    };
  }

  private pointsToPath(points) {
    return [points.map(
      (point, iPoint) => [(iPoint > 0 ? 'L' : 'M'), point[0], ' ', point[1]].join('')
    ).join(' '), 'Z'].join('');
  }

  private rotatePoint(point, angle, origin) {
    const radians = angle * Math.PI / 180;
    const x = point[0] - origin[0];
    const y = point[1] - origin[1];
    const x1 = x * Math.cos(radians) - y * Math.sin(radians) + origin[0];
    const y1 = x * Math.sin(radians) + y * Math.cos(radians) + origin[1];
    return [x1, y1];
  }

  private rotatePoints(points, angle, origin) {
    const _self = this;
    return points.map(
      (point) => _self.rotatePoint(point, angle, origin)
    );
  }

  private restrictToRange(val, min, max) {
    if (val < min) return min;
    if (val > max) return max;
    return val;
  }

  private scalePoint(point, scale) {
    return isNaN(point) ? point : point * scale;
  }

  private createSVGElement(tag, attributes, appendTo) {
    let element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    this.attr(element, attributes);
    if (appendTo) {
      appendTo.appendChild(element);
    }
    return element;
  }

  private createSVGTextElement(text, attributes, appendTo) {
    let element = this.createSVGElement('text', attributes, appendTo);
    element.appendChild(document.createTextNode(text));
    return element;
  }

  // Set attributes for an element
  private attr(element, attrs) {
    for (let key in attrs) {
      if (typeof attrs[key] === 'object' && attrs[key] !== null)
        this.attr(element, attrs[key]);
      else
        element.setAttribute(key, attrs[key]);
    }
  }

  private setMixMaxRange() {
    // Determine the maximum and minimum values to display.
    let actualMinValue;
    let actualMaxValue;
    if (this.props.away) {
      actualMinValue = this.props.ambientTemperature;
      actualMaxValue = actualMinValue;
    } else {
      actualMinValue = Math.min(this.props.ambientTemperature, this.props.targetTemperature);
      actualMaxValue = Math.max(this.props.ambientTemperature, this.props.targetTemperature);
    }
    this.ticks.min = this.restrictToRange(Math.round((actualMinValue - this.props.minValue)
      / this.ticks.rangeValue * this.props.numTicks), 0, this.props.numTicks - 1);
    this.ticks.max = this.restrictToRange(Math.round((actualMaxValue - this.props.minValue)
      / this.ticks.rangeValue * this.props.numTicks), 0, this.props.numTicks - 1);
  }

  private initSVG() {
    const _self = this;
    this.setMixMaxRange();
    this.svg.tickArray = [];

    // draw svg root component
    this.svg.root = this.createSVGElement('svg', {
      width: this.props.width,
      height: this.props.height,
      viewBox: '0 0 ' + this.diameter + ' ' + this.diameter,
      style: this.styles.svg,
    }, this.thermostat.nativeElement);

    // draw dial
    this.svg.dial = this.createSVGElement('circle', {
      cx: this.radius,
      cy: this.radius,
      r: this.radius,
      style: this.styles.dial
    }, this.svg.root);

    // draw svg group
    this.svg.group = this.createSVGElement('g', {
    }, this.svg.root);

    // draw ticks
    for (let iTick = 0; iTick < this.props.numTicks; iTick++) {
      const tickElement = this.createSVGElement('path', {
        key: ['tick-', iTick].join(''),
        d: this.pointsToPath(
          this.rotatePoints(
            this.ticks.points,
            iTick * this.ticks.theta - this.ticks.offsetDegrees,
            [this.radius, this.radius])),
        style: {
          fill: 'rgba(255, 255, 255, 0.3)'
        },
      }, this.svg.group);
      this.svg.tickArray.push(tickElement);
    }

    // draw ring
    this.svg.ring = this.createSVGElement('circle', {
      cx: this.radius,
      cy: this.radius,
      r: this.radius * 0.842,
      style: this.styles.ring
    }, this.svg.root);

    // draw toucharea
    this.svg.touchArea = this.createSVGElement('circle', {
      cx: this.radius,
      cy: this.radius,
      r: this.radius,
      style: {
        fill: 'transparent'
      },
    }, this.svg.root);

    // draw text 'target'
    this.svg.txtTarget = this.createSVGTextElement(this.translateService.instant('Target'), {
      x: this.radius,
      y: this.radius - this.radius / 2.2,
      style: this.styles.description,
    }, this.svg.root);

    // draw text 'temperature'
    this.svg.txtTemperature = this.createSVGTextElement(this.translateService.instant('Temperature').toLowerCase(), {
      x: this.radius,
      y: this.radius - this.radius / 3,
      style: this.styles.description,
    }, this.svg.root);

    // draw text targetTemperature
    this.svg.txtTargetTemp = this.createSVGTextElement(this.targetTemperatureStr[0], {
      x: this.radius,
      y: this.radius,
      style: this.styles.targettemp,
    }, this.svg.root);

    // draw text targetTemperature dot
    this.svg.txtTargetTempDot = this.createSVGTextElement(this.targetTemperatureStr[1], {
      x: this.radius + this.radius / 2.5,
      y: this.radius - this.radius / 8.5,
      style: this.styles.targettempdot,
    }, this.svg.root);

    // draw text ambientTemperature
    this.svg.txtAmbientTemp = this.createSVGTextElement(this.ambientTemperatureStr, {
      x: (this.ambientPosition && this.ambientPosition[0]) ? this.ambientPosition[0] : '',
      y: (this.ambientPosition && this.ambientPosition[1]) ? this.ambientPosition[1] : '',
      style: this.styles.ambienttemp,
    }, this.svg.root);

    // draw text 'AWAY'
    this.svg.txtAway = this.createSVGTextElement('AWAY', {
      x: this.radius,
      y: this.radius,
      style: this.styles.away,
    }, this.svg.root);

    // Determines the positioning of the leaf, should it be displayed.
    const leafScale = this.radius / 5 / 100;
    let leafSVG = ['M', 3, 84, 'c', 24, 17, 51, 18, 73, -6, 'C', 100, 52, 100,
      22, 100, 4, 'c', -13, 15, -37, 9, -70, 19, 'C', 4, 32, 0, 63, 0, 76, 'c',
      6, -7, 18, -17, 33, -23, 24, -9, 34, -9, 48, -20, -9, 10, -20, 16, -43, 24,
      'C', 22, 63, 8, 78, 3, 84, 'z',
    ].map(
      (point) => _self.scalePoint(point, leafScale)
    ).join(' ');

    this.translate = [this.radius - (leafScale * 100 * 0.5), this.radius * 1.4];

    // draw leaf symbol
    this.svg.leaf = this.createSVGElement('path', {
      d: leafSVG,
      style: this.styles.leaf,
      transform: 'translate(' + this.translate[0] + ',' + this.translate[1] + ')',
    }, this.svg.root);

    this.svg.heating = this.createSVGElement('path', {
      d: "M394.23 197.56a300.43 300.43 0 00-53.37-90C301.2 61.65 249.05 32 208 32a16 16 0 00-15.48 20c13.87 53-14.88 97.07-45.31 143.72C122 234.36 96 274.27 96 320c0 88.22 71.78 160 160 160s160-71.78 160-160c0-43.3-7.32-84.49-21.77-122.44zm-105.9 221.13C278 429.69 265.05 432 256 432s-22-2.31-32.33-13.31S208 390.24 208 368c0-25.14 8.82-44.28 17.34-62.78 4.95-10.74 10-21.67 13-33.37a8 8 0 0112.49-4.51A126.48 126.48 0 01275 292c18.17 24 29 52.42 29 76 0 22.24-5.42 39.77-15.67 50.69z",
      style: this.styles.heating,
      transform: 'scale(0.05) translate(1700, 3000)',
    }, this.svg.root);

    this.svg.cooling = this.createSVGElement('path', {
      d: "M461 349l-34-19.64a89.53 89.53 0 0120.94-16 22 22 0 00-21.28-38.51 133.62 133.62 0 00-38.55 32.1L300 256l88.09-50.86a133.46 133.46 0 0038.55 32.1 22 22 0 1021.28-38.51 89.74 89.74 0 01-20.94-16l34-19.64A22 22 0 10439 125l-34 19.63a89.74 89.74 0 01-3.42-26.15A22 22 0 00380 96h-.41a22 22 0 00-22 21.59 133.61 133.61 0 008.5 49.41L278 217.89V116.18a133.5 133.5 0 0047.07-17.33 22 22 0 00-22.71-37.69A89.56 89.56 0 01278 71.27V38a22 22 0 00-44 0v33.27a89.56 89.56 0 01-24.36-10.11 22 22 0 10-22.71 37.69A133.5 133.5 0 00234 116.18v101.71L145.91 167a133.61 133.61 0 008.52-49.43 22 22 0 00-22-21.59H132a22 22 0 00-21.59 22.41 89.74 89.74 0 01-3.41 26.19L73 125a22 22 0 10-22 38.1l34 19.64a89.74 89.74 0 01-20.94 16 22 22 0 1021.28 38.51 133.62 133.62 0 0038.55-32.1L212 256l-88.09 50.86a133.62 133.62 0 00-38.55-32.1 22 22 0 10-21.28 38.51 89.74 89.74 0 0120.94 16L51 349a22 22 0 1022 38.1l34-19.63a89.74 89.74 0 013.42 26.15A22 22 0 00132 416h.41a22 22 0 0022-21.59 133.61 133.61 0 00-8.5-49.41L234 294.11v101.71a133.5 133.5 0 00-47.07 17.33 22 22 0 1022.71 37.69A89.56 89.56 0 01234 440.73V474a22 22 0 0044 0v-33.27a89.56 89.56 0 0124.36 10.11 22 22 0 0022.71-37.69A133.5 133.5 0 00278 395.82V294.11L366.09 345a133.61 133.61 0 00-8.52 49.43 22 22 0 0022 21.59h.43a22 22 0 0021.59-22.41 89.74 89.74 0 013.41-26.19l34 19.63A22 22 0 10461 349z",
      style: this.styles.cooling,
      transform: 'scale(0.05) translate(1700, 3600)',
    }, this.svg.root);

    // draw icon down
    this.svg.iconDown = this.createSVGElement('path', {
      d: 'M 7 12 l 9 9 9-9',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '3',
      'stroke': '#fff',
      'fill': 'transparent',
      transform: 'translate(125, 299)',
    }, this.svg.root);

    // draw icon up
    this.svg.iconUp = this.createSVGElement('path', {
      d: 'M 7 12 l 9-9 9 9',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'stroke-width': '3',
      'stroke': '#fff',
      'fill': 'transparent',
      transform: 'translate(200, 307)'
    }, this.svg.root);

    // draw invisible area for button down
    this.svg.btnDown = this.createSVGElement('circle', {
      cx: 140,
      cy: 315,
      r: 30,
      style: {
        fill: 'transparent'
      }
    }, this.svg.root);

    // draw invisible area for button up
    this.svg.btnUp = this.createSVGElement('circle', {
      cx: 215,
      cy: 315,
      r: 30,
      style: {
        fill: 'transparent'
      }
    }, this.svg.root);

    // draw unit text °C
    this.svg.unit = this.createSVGTextElement('°C', {
      x: this.radius + 70,
      y: this.radius + 30,
      style: this.styles.unit,
    }, this.svg.root);
  }

  private render() {
    if (!this.svg.root) return; // do not render if we do not have initialized SVG..

    this.setMixMaxRange();
    this.svg.tickArray.forEach((tick, iTick) => {
      let isMarkerTarget = (this.props.targetTemperature > this.props.ambientTemperature) ? iTick === this.ticks.max : iTick === this.ticks.min;
      let isMarkerAmbient = (this.props.targetTemperature > this.props.ambientTemperature) ? iTick === this.ticks.min : iTick === this.ticks.max;
      let isActive = iTick >= this.ticks.min && iTick <= this.ticks.max;
      this.attr(tick, {
        d: this.pointsToPath(
          this.rotatePoints(
            (isMarkerTarget || isMarkerAmbient) ? (isMarkerTarget ? this.ticks.pointsTarget : this.ticks.pointsAmbient) : this.ticks.points,
            iTick * this.ticks.theta - this.ticks.offsetDegrees,
            [this.radius, this.radius])),
        style: {
          fill: isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
        },
      });
    });

    // Determines whether the ambient temperature label will be displayed
    // to the left or right of the tick range.
    const lblAmbientPosition = [
      this.radius,
      this.ticks.outerRadius - (this.ticks.outerRadius - this.ticks.innerRadius) / 2,
    ];

    const peggedValue = this.restrictToRange(
      this.props.ambientTemperature,
      this.props.minValue,
      this.props.maxValue);

    let degs = this.ticks.degrees * (peggedValue - this.props.minValue) / this.ticks.rangeValue - this.ticks.offsetDegrees;

    if (peggedValue > this.props.targetTemperature) {
      degs += 9;
    } else {
      degs -= 9;
    }

    this.ambientPosition = this.rotatePoint(lblAmbientPosition, degs, [this.radius, this.radius]);

    // Update ambient and target Temperature and do rounding to 0.5
    this.ambientTemperatureStr = Number(this.props.ambientTemperature).toFixed(1);
    this.targetTemperatureStr = String(Math.round(this.props.targetTemperature*2)/2).split('.'); // round to 0.5

    // render target and ambient temperature
    this.svg.txtTargetTemp.textContent = this.targetTemperatureStr[0];
    this.svg.txtTargetTempDot.textContent = this.targetTemperatureStr[1];
    this.svg.txtAmbientTemp.textContent = this.ambientTemperatureStr;

    this.attr(this.svg.txtAmbientTemp, {
      x: (this.ambientPosition && this.ambientPosition[0]) ? this.ambientPosition[0] : '',
      y: (this.ambientPosition && this.ambientPosition[1]) ? this.ambientPosition[1] : '',
      style: this.styles.ambienttemp,
    });

    // align .5 temperature notation with base temperature
    let textArea = this.getTextSize(this.svg.txtTargetTemp);
    this.attr(this.svg.txtTargetTempDot, {
      x: 175 + textArea.width / 2 + 12, // TODO variables for coordinates
      y: 175 - textArea.height / 2 + 39 // TODO variables for coordinates
    });

    // Update heating / cooling dial color depending on temperatures

    /* TODO disabled for now, define algorithm when to enable/disable
    if (this.props.hvacMode === 'heating' && this.props.targetTemperature > this.props.ambientTemperature) {
      this.attr(this.svg.heating, { style: { 'opacity': 1 } } );
    } else {
      if (this.props.hvacMode === 'cooling' && this.props.targetTemperature < this.props.ambientTemperature) {
        this.attr(this.svg.cooling, { style: { 'opacity': 1 } } );
      } else {
        this.attr(this.svg.heating, { style: { 'opacity': 0 } } );
        this.attr(this.svg.cooling, { style: { 'opacity': 0 } } );
      }
    }
    */
    if (this.disabled) {
      this.attr(this.svg.iconDown, { style: { 'display': 'none' } } );
      this.attr(this.svg.iconUp, { style: { 'display': 'none' } } );
      this.attr(this.svg.btnDown, { style: { 'display': 'none' } } );
      this.attr(this.svg.btnUp, { style: { 'display': 'none' } } );
    }
    else {
      this.attr(this.svg.iconDown, { style: { 'display': 'true' } } );
      this.attr(this.svg.iconUp, { style: { 'display': 'true' } } );
      this.attr(this.svg.btnDown, { style: { 'display': 'true' } } );
      this.attr(this.svg.btnUp, { style: { 'display': 'true' } } );
    }

    if (this.props.leaf) {
      this.attr(this.svg.leaf, { style: { 'opacity': 1 } } );
    }
    else {
      this.attr(this.svg.leaf, { style: { 'opacity': 0 } } );
    }
  }

  private eventPosition(ev) {
    let area = this.svg.touchArea.getBoundingClientRect();
    let x0 = area.left + area.width / 2;
    let y0 = area.top + area.height / 2;
    if (ev.targetTouches && ev.targetTouches.length) {  //
      return [x0 - ev.targetTouches[0].clientX, y0 - ev.targetTouches[0].clientY];
    } else {
      return [x0 - ev.x, y0 - ev.y];
    };
  }

  private calcAngleDegrees(x, y) {
    let angle = Math.atan2(y, x) * 180 / Math.PI + (360 - this.ticks.degrees);
    if (angle < 0) angle += 360;
    if (angle <= this.ticks.degrees) {
      this.props.targetTemperature = (angle / this.ticks.degrees) * (this.props.maxValue - this.props.minValue) + this.props.minValue;
      this.props.targetTemperature = Math.round(this.props.targetTemperature*2)/2; // round to 0.5
      this.render();
    }
  }

  private dragEnd(ev) {
    if (this.disabled) return; // no action if disabled
    let a = this.eventPosition(ev);
    this.calcAngleDegrees(a[0], a[1]);
    this.onChange.emit(this.props.targetTemperature);
  };

  private dragMove(ev) {
    if (this.disabled) return; // no action if disabled
    ev.preventDefault();
    let a = this.eventPosition(ev);
    this.calcAngleDegrees(a[0], a[1]);
  }

  // workaround to compute size of text box before DOM rendering
  getTextSize(element) {
    const clonedElement = element.cloneNode(true)
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.appendChild(clonedElement);
    document.body.appendChild(svg);
    const { x, y, width, height } = clonedElement.getBBox();
    document.body.removeChild(svg);
    return { x, y, width, height };
  }

}
