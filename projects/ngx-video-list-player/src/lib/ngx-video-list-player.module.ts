import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxVideoListPlayerComponent } from './Components/ngx-video-list-player.component';
import { StopPropagationDirective } from './Directives/stop-propagation.directive';



@NgModule({
  declarations: [
      NgxVideoListPlayerComponent,
      StopPropagationDirective
  ],
  imports: [
      BrowserModule,
      CommonModule
  ],
  exports: [
      NgxVideoListPlayerComponent
  ]
})
export class NgxVideoListPlayerModule { }
