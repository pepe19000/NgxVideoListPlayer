export {}

declare global {
    interface Document {
        msExitFullscreen?: () => Promise<void>;
        mozCancelFullScreen?: () => Promise<void>;
        webkitExitFullscreen?: () => Promise<void>;
        // pictureInPictureEnabled: boolean;
        // exitPictureInPicture?: () => Promise<void>;        
    }
  
    interface HTMLElement {
        msRequestFullscreen?: () => Promise<void>;
        mozRequestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => Promise<void>;
    }

    interface HTMLVideoElement {
        // requestPictureInPicture?: () => Promise<void>;
        webkitEnterFullscreen?: () => Promise<void>;
        webkitSupportsFullscreen?: boolean;
        // onenterpictureinpicture: ((this: GlobalEventHandlers, ev: Event) => any) | null;
        // onleavepictureinpicture: ((this: GlobalEventHandlers, ev: Event) => any) | null;
    }
}