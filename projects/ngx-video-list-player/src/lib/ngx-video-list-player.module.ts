import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxVideoListPlayerComponent } from './Components/ngx-video-list-player.component';
import { StopPropagationDirective } from './Directives/stop-propagation.directive';
import { YouTubePlayerModule } from '@angular/youtube-player';

@NgModule({
  declarations: [
      NgxVideoListPlayerComponent,
      StopPropagationDirective
  ],
  imports: [
      CommonModule,
      YouTubePlayerModule
  ],
  exports: [
      NgxVideoListPlayerComponent
  ]
})
export class NgxVideoListPlayerModule { }
