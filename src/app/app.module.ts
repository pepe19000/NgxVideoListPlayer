import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxVideoListPlayerModule } from 'ngx-video-list-player';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    NgxVideoListPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
