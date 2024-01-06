import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GestureDirective } from './gesture.directive'
import { LongPressDirective } from './long-press.directive'
import { SwipeDirective } from './swipe.directive'

@NgModule({
  declarations: [
    GestureDirective,
    LongPressDirective,
    SwipeDirective
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GestureDirective,
    LongPressDirective,
    SwipeDirective
  ]
})
export class DirectivesModule { }