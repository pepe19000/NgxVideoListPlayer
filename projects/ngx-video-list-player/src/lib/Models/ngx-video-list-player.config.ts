export interface IVideoSubtitle {
    src: string;
    name: string;
    default?: boolean;    
}

export interface IVideoSource {
    src: string;
    videoName?: string;
    type?: string;
    artist?: string;
    subtitles?: IVideoSubtitle[];
    isYoutubeVideo?: boolean;
}

export interface IVideoConfig {
    sources: IVideoSource[];
    isVideoLoader?: boolean;
    isAutoPlay?: boolean;
    isFirstVideoAutoPlay?: boolean;
    videoListDisplayMode?: "inline" | "block" | "none";
    volumeCookieName?: string;
    videoIndexCookieName?: string;
    subtitleText?: string;
    subtitleOffText?: string;
}