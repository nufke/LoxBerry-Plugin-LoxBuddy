import { Directive, ElementRef, EventEmitter, Output } from "@angular/core";
import { Gesture, GestureController } from "@ionic/angular";

@Directive({
  selector: "[long-press]"
})
export class LongPressDirective {
  private nativeElement: HTMLElement;
  private pressGesture: Gesture;

  @Output()
  onStart = new EventEmitter();

  @Output()
  onEnd = new EventEmitter();

  action: any; //not stacking actions

  private delay;
  private endDelay;

  constructor(private gestureCtrl: GestureController, elementRef: ElementRef) {
    this.nativeElement = elementRef.nativeElement;
  }

  public ngOnInit(): void {
    this.pressGesture = this.gestureCtrl.create({
      gestureName: "long-press",
      el: this.nativeElement,
      threshold: 0,
      onStart: ev => {
        this.delay = 700;
        this.endDelay = 700;
        this.onStartTimer();
        this.onStart.emit(ev.event);
      },
      onEnd: ev => {
        /* minimal time between start and end should be 700 ms */
        this.onEndTimer(ev.event);
      }
    });
    this.pressGesture.enable();
  }

  private onStartTimer() {
    setTimeout(() => {
      this.endDelay = 0;
    }, this.delay);
  }

  private onEndTimer(event) {
    setTimeout(() => {
      this.onEnd.emit(event);
    }, this.endDelay);
  }

}
