import { Component } from "@angular/core";
import { IVideoConfig } from "ngx-video-list-player";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
    config: IVideoConfig = {
        isVideoLoader: false,
        isAutoPlay: false,
        isFirstVideoAutoPlay: false,
        subtitleOffText: "",
        subtitleText: "",
        volumeCookieName: "NgxVideoListPlayerVolume",
        videoIndexCookieName: "NgxVideoListPlayerIndex",
        sources: [{
            src: "./assets/videos/Panic! At The Disco - High Hopes.mp4",
            videoName: "Panic! At The Disco - High Hopes",
            artist: "Panic! At The Disco",
            subtitles: [
                {
                    name: "English",
                    src: "./assets/subtitles/en.vtt",
                    default: false
                },
                {
                    name: "Deutsche",
                    src: "./assets/subtitles/de.vtt",
                    default: false
                }
            ]
        },
        {
            src: "./assets/videos/Martin Garrix feat. Bonn - High On Life.mp4",
            videoName: "Martin Garrix feat. Bonn - High On Life",
            artist: "Martin Garrix"
        }]          
    };

    constructor() {       

    }
}
