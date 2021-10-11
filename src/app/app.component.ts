import { Component } from "@angular/core";
import { IVideoConfig } from "ngx-video-list-player";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
    config: IVideoConfig = {
        isVideoLoader: true,
        isAutoPlay: false,
        isFirstVideoAutoPlay: false,
        subtitleOffText: "",
        subtitleText: "",
        volumeCookieName: "NgxVideoListPlayerVolume",
        videoIndexCookieName: "NgxVideoListPlayerIndex",
        sources: [{
            src: "https://drive.google.com/uc?export=download&id=1xFTmNv2SUYdJDMVAaLuyglgvg1aFRkxc",
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
            src: "o_1aF54DO60",
            isYoutubeVideo: true,
            videoName: "(Youtube) Young and Beautiful",
            artist: "Lana Del Rey"
        },
        {
            src: "https://drive.google.com/uc?export=download&id=1pef_q-vfGKA4Z5XnrxscC1L8KHAngth9",
            videoName: "Martin Garrix feat. Bonn - High On Life",
            artist: "Martin Garrix"
        }]          
    };

    onTimeUpdate() {
        console.log("Event: onTimeUpdate");
    }

    onCanPlay() {
        console.log("Event: onCanPlay")
    }

    onLoadedMetadata() {
        console.log("Event: onLoadedMetadata")
    }

    constructor() {       

    }
}
