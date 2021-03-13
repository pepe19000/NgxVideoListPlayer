import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Input, OnInit, Output, QueryList, Renderer2, ViewChild, ViewChildren } from '@angular/core';
import { VideoEventTypes } from '../Models/video-event-types.model';
import { } from '../Models/global.model';
import { IVideoConfig } from '../Models/ngx-video-list-player.config';
import { IExtendedVideoSubtitle } from '../Models/custom.config';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { EventEmitter } from '@angular/core';

@Component({
  selector: 'ngx-video-list-player',
  templateUrl: 'ngx-video-list-player.component.html',
  styleUrls: ['ngx-video-list-player.component.scss']
})
export class NgxVideoListPlayerComponent implements AfterViewInit, OnInit {

    videoElement: HTMLVideoElement;
    private mediaControlElement: HTMLElement;

    @ViewChild('mediaVideo') video: ElementRef;
    @ViewChild('mediaVideoSource') videoSource: ElementRef;
    @ViewChild("progressContainer") progressContainer: ElementRef;
    @ViewChild("progressContainerHover") progressContainerHover: ElementRef;
    @ViewChildren("from_pause_to_play") fromPauseToPlay: QueryList<ElementRef>;
    @ViewChildren("from_play_to_pause") fromPlayToPause: QueryList<ElementRef>;
    @ViewChild("mediaPlayer") mediaPlayer: ElementRef;
    @ViewChild("mediaControlContainer") mediaControlContainer: ElementRef;
    @ViewChild("meter") meterContainer: ElementRef;
    @ViewChild("progressSlider") progressSlider: ElementRef;
    @ViewChild("videoTitleContainer") videoTitleContainer: ElementRef;
    @ViewChild("dropUpContent") dropUpContent: ElementRef;
    @ViewChild("videoListContainer") videoListContainer: ElementRef;
    @ViewChildren("videoListElement") videoListElements: QueryList<ElementRef>;
    @ViewChild("mobileDeviceMainPprContainer") mobileDeviceMainPprContainer: ElementRef;
    @ViewChild("subtitleModal") subtitleModal: ElementRef;

    @Input() config: IVideoConfig;
    @Output() onTimeUpdate = new EventEmitter();
    @Output() onCanPlay = new EventEmitter();
    @Output() onLoadedMetadata = new EventEmitter();
    
    private visibleMobileDeviceMainPprContainer: boolean = false;
    private disableControlHide: boolean = false;
    private displayControlsTimeout: NodeJS.Timeout;
    private countDownCircleTimeout: NodeJS.Timeout;
    private mediaPlayerIsFocused: boolean = false;
    private actualVideoIndex: number = 0;
    private firstSourceLoad: boolean = false;
    private firstVideoLoad: boolean = true;
    private pauseKeyboardCodes: string[] = ["Space"];

    subtitles: IExtendedVideoSubtitle[];
    videoName: string;
    currentTime: string = "0:00";
    duration: string = "0:00";
    isFullScreen: boolean = false;
    volumePercent: number = 100;
    muted: boolean = false;
    progressSliderMaxValue: number = 100000;
    progressSliderValue: number = 0;
    pipIsActive: boolean = false;
    supportPictureInPicture = 'pictureInPictureEnabled' in document && document.pictureInPictureEnabled;
    supportFullScreen = 'fullscreenEnabled' in document && document.fullscreenEnabled;
    canPlay?: boolean;
    videoType: string;
    actualSubtitleId: string;
    isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    //Safari does not trigger CanPlay event
    isSafariBrowser: boolean = navigator.userAgent.toLowerCase().indexOf("safari") != -1 && navigator.userAgent.toLowerCase().indexOf("chrome") == -1;

    constructor(private renderer: Renderer2, 
        private breakpointObserver: BreakpointObserver,
        private changeDetectorRef: ChangeDetectorRef) {
              
    }

    ngOnInit():void {
        if(!this.config.isAutoPlay)
            this.config.isAutoPlay = false;

        if(!this.config.isFirstVideoAutoPlay)
            this.config.isFirstVideoAutoPlay = false;

        if(this.config.volumeCookieName) {
            const volumeCookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${this.config.volumeCookieName}=`));

            if(volumeCookieValue) {
                this.volumePercent = parseInt(volumeCookieValue.split('=')[1]);
                if(this.volumePercent < 0)
                    this.volumePercent = 0;
                else if(this.volumePercent > 100)
                    this.volumePercent = 100;
            }
        }

        if(this.config.videoIndexCookieName) {
            const videoIndexCookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${this.config.videoIndexCookieName}=`));
                
            if(videoIndexCookieValue)
                this.actualVideoIndex = parseInt(videoIndexCookieValue.split('=')[1]);
        }
    }

    ngAfterViewInit():void {
        this.videoElement = this.video.nativeElement as HTMLVideoElement;

        if(isNaN(this.actualVideoIndex) ||  this.actualVideoIndex > this.config.sources.length - 1 || this.actualVideoIndex < 0)
            this.actualVideoIndex = 0;
        
        this.setVideoIndexCookie();

        this.loadVideo();
        this.changeDetectorRef.detectChanges();

        this.videoElement.controls = false;
        this.videoElement.ontimeupdate = (this.videoEventHandler.bind(this));
        this.videoElement.onloadedmetadata = (this.videoEventHandler.bind(this));
        this.videoElement.onended = this.videoEventHandler.bind(this);
        this.videoElement.onleavepictureinpicture = this.videoEventHandler.bind(this);
        this.videoElement.onenterpictureinpicture = this.videoEventHandler.bind(this);
        this.videoElement.onpause = this.videoEventHandler.bind(this);
        this.videoElement.onplay = this.videoEventHandler.bind(this);
        this.videoElement.oncanplay = this.videoEventHandler.bind(this);
        this.videoElement.onerror = this.videoEventHandler.bind(this);
        (this.videoSource.nativeElement as HTMLSourceElement).onerror = this.videoEventHandler.bind(this);
        this.mediaControlElement = this.mediaPlayer.nativeElement as HTMLElement;
        this.mediaControlElement.onfullscreenchange = this.videoEventHandler.bind(this);
        this.setVolumeValue(this.volumePercent);

        this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe(result => {
            if(this.config.videoListDisplayMode) {
                switch(this.config.videoListDisplayMode) {
                    case "inline": 
                        this.renderer.addClass(this.mediaPlayer.nativeElement, "custom-col-8");
                        this.renderer.addClass(this.videoListContainer.nativeElement, "custom-col-4");
                        this.renderer.removeClass(this.mediaPlayer.nativeElement, "custom-col-12");
                        this.renderer.removeClass(this.videoListContainer.nativeElement, "custom-col-12");
                        break;
                    case "block":
                        this.renderer.addClass(this.mediaPlayer.nativeElement, "custom-col-12");
                        this.renderer.addClass(this.videoListContainer.nativeElement, "custom-col-12");
                        this.renderer.removeClass(this.mediaPlayer.nativeElement, "custom-col-8");
                        this.renderer.removeClass(this.videoListContainer.nativeElement, "custom-col-4");
                        break;
                    case "none": 
                        this.renderer.setStyle(this.videoListContainer.nativeElement, "display", "none");
                        this.renderer.removeClass(this.mediaPlayer.nativeElement, "custom-col-8");
                        this.renderer.addClass(this.mediaPlayer.nativeElement, "custom-col-12");
                        break;
                }
                return;
            }
            if (result.matches) {
                this.renderer.removeClass(this.mediaPlayer.nativeElement, "custom-col-8");
                this.renderer.removeClass(this.videoListContainer.nativeElement, "custom-col-4");
                this.renderer.addClass(this.mediaPlayer.nativeElement, "custom-col-12");
                this.renderer.addClass(this.videoListContainer.nativeElement, "custom-col-12");
            } else {
                this.renderer.addClass(this.mediaPlayer.nativeElement, "custom-col-8");
                this.renderer.addClass(this.videoListContainer.nativeElement, "custom-col-4");
                this.renderer.removeClass(this.mediaPlayer.nativeElement, "custom-col-12");
                this.renderer.removeClass(this.videoListContainer.nativeElement, "custom-col-12");
            }
            this.resizeVideoListContainer();
        })
    }

    videoEventHandler(ev: Event):void {
        switch(ev.type){
            case VideoEventTypes.TimeUpdate: 
                if(!this.videoElement.duration)
                {
                    this.onTimeUpdate.emit();
                    return;
                }
                
                const percentage = (100 / this.videoElement.duration) * this.videoElement.currentTime;
                this.renderer.setStyle(this.progressContainer.nativeElement, "width", `${percentage}%`);
                this.currentTime = `${Math.floor(this.videoElement.currentTime / 60)}:${Math.floor(this.videoElement.currentTime % 60).toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
                this.progressSliderValue = percentage * (this.progressSliderMaxValue / 100);
                this.onTimeUpdate.emit();
                break;
            case VideoEventTypes.LoadedMetadata: 
                this.duration = `${Math.floor(this.videoElement.duration / 60)}:${Math.floor(this.videoElement.duration % 60).toLocaleString("en-US", { minimumIntegerDigits: 2 })}`;
                this.firstSourceLoad = true;
                this.supportFullScreen ||= this.videoElement.webkitSupportsFullscreen;
                if(this.isSafariBrowser)
                    this.canPlayEvent();

                this.onLoadedMetadata.emit();
                break;
            case VideoEventTypes.FullScreenChange:
                this.isFullScreen = !!document.fullscreenElement;
                break;
            case VideoEventTypes.Ended: 
                this.endEvent();
                if(this.isNextVideo()) {
                    this.countDownCircleTimeout = setTimeout(() => {
                        this.next();
                    }, 5000);
                }
                break;
            case VideoEventTypes.LeavePictureInPicture:
                this.pipIsActive = false;
                this.mediaPlayerMouseLeave();
                //Not refresh pip Svg automatic after close in pause state
                this.changeDetectorRef.detectChanges();
                //setTimeout is beacuse of exitPiP pause
                setTimeout(() => {
                    if (this.videoElement.ended) {
                        this.endEvent();
                    }
                }, 1);
                break;
            case VideoEventTypes.EnterPictureInPicture: 
                this.pipIsActive = true;
                this.mediaPlayerMouseMove();
                this.clearMobileDeviceMainPprContainerStyles();
                break;
            case VideoEventTypes.Play: 
                this.playEvent();
                break;
            case VideoEventTypes.Pause: 
                this.pauseEvent();
                break;
            case VideoEventTypes.CanPlay: 
                this.canPlayEvent();
                this.onCanPlay.emit();
                break;
            case VideoEventTypes.Error: 
                this.resizeVideoListContainer();
                this.canPlay = false;
                this.firstSourceLoad = false;
                this.firstVideoLoad = false;
                if(this.isNextVideo()) {
                    this.countDownCircleTimeout = setTimeout(() => {
                        this.next();
                    }, 5000);
                }
                break;
        }
    }

    private canPlayEvent() {
        this.resizeVideoListContainer();
        this.canPlay = true;  
        if(this.firstVideoLoad && this.config.isFirstVideoAutoPlay) {
            this.mute();
            this.playPause();
        }  
        else if(!this.firstVideoLoad && this.firstSourceLoad && this.config.isAutoPlay) {
            this.playPause();
        }
        this.firstSourceLoad = false;
        this.firstVideoLoad = false;
    }

    private endEvent(): void{
        this.fromPlayToPause.forEach(element => {
            element.nativeElement.beginElement();            
        });
    }

    async pipEnter():Promise<void> {
        if(!this.canPlay)
            return;

        await this.videoElement.requestPictureInPicture();
    }

    async pipExit():Promise<void> {
        await document.exitPictureInPicture();
    }

    private playEvent():void {
        this.fromPauseToPlay.forEach(element => {
            element.nativeElement.beginElement();            
        });
        this.mediaPlayerMouseLeave();  
    }

    private pauseEvent():void {
        this.fromPlayToPause.forEach(element => {
            element.nativeElement.beginElement();            
        });
        this.mediaPlayerMouseMove();
        this.clearMobileDeviceMainPprContainerStyles();
    }
    
    private clearMobileDeviceMainPprContainerStyles() {
        if(this.mobileDeviceMainPprContainer) {
            this.visibleMobileDeviceMainPprContainer = true;
            this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "visibility");
            this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "opacity");
        }
    }

    playPause():void {       
        if(!this.canPlay)
            return;
        
        this.clearCountDownCircleTimeout();
        
        if(this.videoElement.paused || this.videoElement.ended) {
            this.videoElement.play();
        }
        else{
            this.videoElement.pause();       
        }
    }

    fullScreen():void {
        if (this.mediaControlElement.requestFullscreen) {
            this.mediaControlElement.requestFullscreen();
        } else if (this.mediaControlElement.webkitRequestFullscreen) { /* Safari */
            this.mediaControlElement.webkitRequestFullscreen();
        } else if (this.mediaControlElement.msRequestFullscreen) { /* IE11 */            
            this.mediaControlElement.msRequestFullscreen();
        } else if (this.mediaControlElement.mozRequestFullscreen) {
            this.mediaControlElement.mozRequestFullscreen();
        } else if(this.videoElement.webkitEnterFullscreen)
            this.videoElement.webkitEnterFullscreen();
    }

    exitFullScreen():void {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        }
    }

    isNextVideo(): boolean {
        return this.actualVideoIndex < this.config.sources.length - 1;
    }

    
    next(): void {
        this.actualVideoIndex += 1;
        this.loadVideo();
    }

    prev(): void {
        if(this.actualVideoIndex == 0) {
            this.clearCountDownCircleTimeout();

            this.videoElement.currentTime = 0;
            if(!this.videoElement.paused)
                this.playPause();
        }
        else {
            this.actualVideoIndex -= 1;
            this.loadVideo();
        }
    }

    private loadVideo(index?: number): void {
        if(index >= 0)
            this.actualVideoIndex = index;

        const videoElement = this.videoListElements.find((element, index) => index == this.actualVideoIndex);
        this.videoListContainer.nativeElement.scroll({
            top: videoElement.nativeElement.offsetTop - this.videoListContainer.nativeElement.offsetTop - videoElement.nativeElement.offsetHeight,
            left: 0,
            behavior: 'smooth'
        });

        this.clearCountDownCircleTimeout();

        this.setVideoIndexCookie();

        this.pauseEvent();
        
        this.canPlay = null;
        this.videoElement.currentTime = 0;
        this.progressSliderValue = 0;
        this.renderer.setStyle(this.progressContainerHover.nativeElement, "width", `0%`);
        this.renderer.setStyle(this.progressContainer.nativeElement, "width", `0%`);
        this.currentTime = "0:00"

        const actualVideo = this.config.sources[this.actualVideoIndex];
        this.videoName = actualVideo.videoName;
        this.videoElement.src = actualVideo.src;
        this.videoType = actualVideo.type;
        this.subtitles = [];

        if(actualVideo.subtitles) {
            this.subtitles = actualVideo.subtitles.map(item => ({
                src: item.src,
                name: item.name,
                default: item.default,
                id: `video_vtt_${actualVideo.subtitles.indexOf(item)}`
            }));
        }

        var defaultSubtitle = this.subtitles.find(item => item.default);
        if(defaultSubtitle)
            this.actualSubtitleId = defaultSubtitle.id;
    }

    private clearCountDownCircleTimeout():void {
        if(this.countDownCircleTimeout)
            clearTimeout(this.countDownCircleTimeout);
    }

    mute():void {
        this.videoElement.muted = !this.videoElement.muted;
        this.muted = this.videoElement.muted;

        if(this.videoElement.muted){
            this.volumePercent = 0;
        }
        else{
            this.volumePercent = this.videoElement.volume * 100;
        }
    }

    setVolume(event: Event):void {
        this.videoElement.muted = false;
        this.muted = this.videoElement.muted;
        const percentage = parseInt((event.target as HTMLInputElement).value);

        if(this.config.volumeCookieName)
            document.cookie = `${this.config.volumeCookieName}=${percentage}`;

        this.setVolumeValue(percentage);
        this.volumePercent = percentage;
    }

    private setVolumeValue(percentage):void  {
        this.videoElement.volume = percentage / 100;
    }

    private setVideoIndexCookie():void  {
        if(this.config.videoIndexCookieName)
            document.cookie = `${this.config.videoIndexCookieName}=${this.actualVideoIndex}`;
    }

    progressHelperMouseMove(event):void {
        if(!this.canPlay)
            return;

        const hoverPercent = event.offsetX / event.srcElement.offsetWidth * 100;
        this.renderer.setStyle(this.progressContainerHover.nativeElement, "width", `${hoverPercent}%`);
        this.renderer.setStyle(this.mediaControlContainer.nativeElement, "height", "50px");
        this.renderer.setStyle(this.meterContainer.nativeElement, "height", "6px");
        this.renderer.setStyle(this.progressSlider.nativeElement, "display", "inline-block");
    }

    mediaPlayerMouseMove():void {
        if(!this.canPlay)
            return;

        if(this.videoTitleContainer)
            this.renderer.removeStyle(this.videoTitleContainer.nativeElement, "opacity")

        this.renderer.removeStyle(this.mediaControlContainer.nativeElement, "opacity")
        this.renderer.removeStyle(this.mediaControlContainer.nativeElement, "visibility")
        this.renderer.removeStyle(this.meterContainer.nativeElement, "opacity")
        this.renderer.removeStyle(this.mediaPlayer.nativeElement, "cursor")        
        if(this.mobileDeviceMainPprContainer) {
            this.visibleMobileDeviceMainPprContainer = true;
            this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "visibility");
            this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "opacity");
        }

        if(!this.videoElement.paused && !this.videoElement.ended && !this.disableControlHide && !this.pipIsActive) {
            if(this.displayControlsTimeout) {
                clearTimeout(this.displayControlsTimeout);
            }
            this.displayControlsTimeout = setTimeout(() =>{ this.mediaPlayerMouseLeave() }, 3000);
        }
    }

    mediaPlayerMouseLeave():void {
        if(!this.videoElement.paused && !this.videoElement.ended && !this.disableControlHide && !this.pipIsActive) {
            if(!this.isMobileDevice)
                this.openSubtitles(true);

            this.renderer.setStyle(this.mediaPlayer.nativeElement, "cursor", `none`)
            this.renderer.setStyle(this.mediaControlContainer.nativeElement, "opacity", `0`)
            this.renderer.setStyle(this.mediaControlContainer.nativeElement, "visibility", "hidden");
            this.renderer.setStyle(this.meterContainer.nativeElement, "opacity", `0`)
            
            if(this.videoTitleContainer)
                this.renderer.setStyle(this.videoTitleContainer.nativeElement, "opacity", "0")

            if(this.mobileDeviceMainPprContainer) {
                this.visibleMobileDeviceMainPprContainer = false;
                this.renderer.setStyle(this.mobileDeviceMainPprContainer.nativeElement, "visibility", "hidden");
                this.renderer.setStyle(this.mobileDeviceMainPprContainer.nativeElement, "opacity", "0");
            }
        }
    }

    mediaPlayerFocus():void {
        this.mediaPlayerIsFocused = true;
    }

    mediaPlayerFocusOut():void {
        this.mediaPlayerIsFocused = false;        
    }

    @HostListener('document:keypress', ['$event'])
    handleDocumentKeyboardEvent(event: KeyboardEvent):void { 
        if(this.pauseKeyboardCodes.find(item => item == event.code) && this.mediaPlayerIsFocused)
            this.playPause();
    }

    @HostListener('document:click', ['$event'])
    handleDocumentClickEvent(event: MouseEvent):void { 
        this.openSubtitles(true);
    }

    @HostListener('window:resize', ['$event'])
    handleDocumentResizeEvent(event: MouseEvent):void { 
        this.resizeVideoListContainer();
    }

    private resizeVideoListContainer() {
        const mediaPlayerHeight = this.mediaPlayer.nativeElement.offsetHeight;
        this.renderer.setStyle(this.videoListContainer.nativeElement, "height", `${mediaPlayerHeight}px`)
    }

    mediaControlContainerMouseEnter():void {
        if(this.isMobileDevice)
            return;

        this.disableControlHide = true;
    }

    mediaControlContainerMouseLeave():void {
        if(this.isMobileDevice)
            return;

        this.disableControlHide = false;
    }

    //Value range [0..this.progressSliderMaxValue]
    setProgressSlider(value):void {
        this.videoElement.currentTime = this.videoElement.duration * value / this.progressSliderMaxValue;
        this.clearCountDownCircleTimeout();
    }

    progressThumbMouseMove(event: MouseEvent):void {
        if(!this.canPlay)
            return;

        this.renderer.setStyle(this.mediaControlContainer.nativeElement, "height", "50px");
        this.renderer.setStyle(this.meterContainer.nativeElement, "height", "6px");
        const percentage = (event.offsetX / (event.target as HTMLInputElement).clientWidth) * 100;
        if(percentage >= 0 && percentage <= 100)
            this.renderer.setStyle(this.progressContainerHover.nativeElement, "width", `${percentage}%`);
    }

    progressThumbMouseLeave():void {
        this.renderer.removeStyle(this.mediaControlContainer.nativeElement, "height");
        this.renderer.removeStyle(this.meterContainer.nativeElement, "height");
        this.renderer.removeStyle(this.progressContainerHover.nativeElement, "width");
        this.renderer.removeStyle(this.progressSlider.nativeElement, "display");
    }

    openSubtitles(instantHide: boolean = false):void {
        
        if(this.isMobileDevice) 
        {
            if(!this.subtitleModal)
                return;

            if(instantHide || this.subtitleModal.nativeElement.classList.contains('show'))
                this.renderer.removeClass(this.subtitleModal.nativeElement, "show");
            else
                this.renderer.addClass(this.subtitleModal.nativeElement, "show");
        }
        else 
        {
            if(!this.dropUpContent)
                return;

            if(instantHide || this.dropUpContent.nativeElement.classList.contains('show'))
                this.renderer.removeClass(this.dropUpContent.nativeElement, "show");
            else
                this.renderer.addClass(this.dropUpContent.nativeElement, "show");        
        }

    }

    setSubtitle(id: string):void {
        this.actualSubtitleId = id;

        for(var i = 0; i < this.videoElement.textTracks.length; i++) {
            this.videoElement.textTracks[i].mode = "disabled";
        }
        
        if(id) {
            this.videoElement.textTracks.getTrackById(id).mode = "showing";
        }
    }

    videoClickEvent():void {
        if(this.isMobileDevice)
        {
            if(this.visibleMobileDeviceMainPprContainer){
                this.mediaPlayerMouseLeave();
            }
            else {
                this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "visibility");
                this.renderer.removeStyle(this.mobileDeviceMainPprContainer.nativeElement, "opacity");
                this.visibleMobileDeviceMainPprContainer = true;
            }
        }
        else{
            this.playPause();
        }
    }

    emptyVoid(): void {

    }
}
