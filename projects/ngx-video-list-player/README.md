# NgxVideoListPlayer

This is an Angular module. It helps to integrate a video player with a video list. The video's base controls are disable and it uses custom controls for control video events.

*!!No support for IE*

*Mobile browsers got different designe for an easier handling*

[![npm downloads](https://img.shields.io/npm/dm/ngx-video-list-player.svg)](http://npm-stat.com/charts.html?package=ngx-video-list-player)

Check out [the demo](https://pepe19000.github.io/Demo/menu/NgxVideoListPlayer)!

*Note: v11.0.5 is out and supports Angular 11!*

## Install

1) Install by running `npm install ngx-video-list-player`

2) Add `NgxVideoListPlayerModule` to your `app.module.ts` imports:

```ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgxVideoListPlayerModule } from 'ngx-video-list-player';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgxVideoListPlayerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```

*Important: This module uses custom SVGs, so import of these are REQUIRED!!*

3) Next step is to import these:

`angular.json`

```json

"assets": [              
              {
                "glob": "**/*",
                "input": "./node_modules/ngx-video-list-player/assets",
                "output": "/assets/"
              }            
          ],

```

*Important: folder contents of `./node_modules/ngx-video-list-player/assets` always have to be in `assets` folder under root*

## Basics

### Usage

You can use this module easily after imports. Just use `ngx-video-list-player` tag in your html and give a config for it like an `@Input()`.
For example:

`app.component.html`

```html
<ngx-video-list-player [config]="config">

</ngx-video-list-player>
```

`app.component.ts`

```ts
import { IVideoConfig } from "ngx-video-list-player";

...

export class AppComponent {
    config: IVideoConfig = {
        sources: [
        {
            src: "{video1_src}",
            videoName: "{video1_name}",
            artist: "{video1_artist}"
        },
        {
            src: "{video2_src}",
            videoName: "{video2_name}",
            artist: "{video2_artist}"
        }]          
    };
...
}

```

## Config properties

### IVideoConfig


| Property | Type | Description
| --- | --- | --- |
| `sources` | IVideoSource[] | Video sources comes here |
| `isVideoLoader` | boolean? | In case of slow source load you can use loader animation while waiting for first load. Default is `true` |
| `isAutoPlay` | boolean? | If you set more than one source, afterwhen the video is over it plays the next video automatically. Default is `false`  |
| `isFirstVideoAutoPlay` | boolean? | The first video plays automatically when site is loaded. According to the browser's rules, the video will start in muted status in this case. Default is `false` |
| `videoListDisplayMode` | string?: `inline`, `block`, `none` | You can override the video list responsive display logic for a fix display setting. *!!This is not dynamic property* |
| `volumeCookieName` | string? | If you fill it, browser saves current volume as a cookie. The cookie's name depends on what you set |
| `videoIndexCookieName` | string? | If you fill it, browser save current video index as a cookie. The cookie's name depends on what you set. *Recommended to use unique cookie name in each tag* |
| `subtitleText` | string? | Dynamic property for subtitle container's header text. Default is `Subtitles` |
| `subtitleOffText` | string? | Dynamic property for subtitle's turn off text. Default is `Off` |


### IVideoSource


| Property | Type | Description
| --- | --- | --- |
| `src` | string | Video source path |
| `videoName` | string? | Video name. Appear on top of the video and in the video list |
| `type` | string? | Video type |
| `artist` | string? | Video artist. Appear in the video list |
| `subtitles` | IVideoSubtitle[]? | Video subtitles come here |


### IVideoSubtitle

| Property | Type | Description
| --- | --- | --- |
| `src` | string | Subtitle source path |
| `name` | string | Subtitle name. Appear on the subtitle list |
| `default` | boolean? | Use the video player by default |