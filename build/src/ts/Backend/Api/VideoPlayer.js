import { BackendApi } from 'Backend/BackendApi';
export class VideoPlayer extends BackendApi {
    setProgressEventInterval(milliseconds) {
        return;
    }
    prepare(rawUrl) {
        let url = rawUrl;
        if (url.indexOf('file://http') !== -1) {
            url = rawUrl.replace('file://', '');
        }
        if ('exec' in window) {
            this._duration = 30000;
            this._width = 480;
            this._height = 360;
            this._url = url;
            this._backend.sendEvent('VIDEOPLAYER', 'PREPARED', url, this._duration, this._width, this._height);
        }
        else {
            let videoView = this._videoView = window.parent.document.getElementById('videoView');
            if (!videoView) {
                videoView = this._videoView = document.createElement('video');
            }
            videoView.addEventListener('canplay', () => {
                this._url = url;
                const duration = this._duration = Math.round(videoView.duration * 1000);
                const width = this._width = videoView.videoWidth;
                const height = this._height = videoView.videoHeight;
                this._backend.sendEvent('VIDEOPLAYER', 'PREPARED', url, duration, width, height);
            }, false);
            videoView.src = url;
        }
    }
    setVolume(volume) {
        let videoView = window.parent.document.getElementById('videoView');
        if (!videoView) {
            videoView = this._videoView;
        }
        if (videoView) {
            videoView.volume = volume;
        }
    }
    play() {
        if (this._videoView) {
            const videoView = this._videoView;
            videoView.addEventListener('play', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'PLAY', this._url);
            }, false);
            videoView.addEventListener('timeupdate', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', Math.round(videoView.currentTime * 1000));
            }, false);
            videoView.addEventListener('ended', () => {
                this._backend.sendEvent('VIDEOPLAYER', 'COMPLETED', this._url);
            }, false);
            videoView.play();
        }
        else {
            let currentTime = 0;
            this._backend.sendEvent('VIDEOPLAYER', 'PLAY');
            this._progressTimer = window.setInterval(() => {
                currentTime += 250;
                if (this._duration && currentTime >= this._duration) {
                    this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', this._duration);
                    setTimeout(() => {
                        this._backend.sendEvent('VIDEOPLAYER', 'COMPLETED', this._url);
                    }, 0);
                    clearInterval(this._progressTimer);
                }
                else {
                    this._backend.sendEvent('VIDEOPLAYER', 'PROGRESS', currentTime);
                }
            }, 10);
        }
    }
    pause() {
        let videoView = window.parent.document.getElementById('videoView');
        if (!videoView) {
            videoView = this._videoView;
        }
        if (videoView) {
            videoView.pause();
        }
        setTimeout(() => {
            this._backend.sendEvent('VIDEOPLAYER', 'PAUSE', this._url);
            this._backend.sendEvent('VIDEOPLAYER', 'STOP', this._url);
        }, 0);
    }
    setAutomaticallyWaitsToMinimizeStalling(value) {
        return;
    }
    getVideoViewRectangle() {
        let videoView = window.parent.document.getElementById('videoView');
        if (!videoView) {
            videoView = this._videoView;
        }
        return [this._videoView.getBoundingClientRect().left, this._videoView.getBoundingClientRect().top, this._videoView.width, this._videoView.height];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlkZW9QbGF5ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFja2VuZC9BcGkvVmlkZW9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRWhELE1BQU0sT0FBTyxXQUFZLFNBQVEsVUFBVTtJQUVoQyx3QkFBd0IsQ0FBQyxZQUFvQjtRQUNoRCxPQUFPO0lBQ1gsQ0FBQztJQUVNLE9BQU8sQ0FBQyxNQUFjO1FBQ3pCLElBQUksR0FBRyxHQUFHLE1BQU0sQ0FBQztRQUNqQixJQUFJLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDbkMsR0FBRyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO1FBRUQsSUFBSSxNQUFNLElBQUksTUFBTSxFQUFFO1lBQ2xCLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO1lBQ3ZCLElBQUksQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ25CLElBQUksQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO1lBQ2hCLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDdEc7YUFBTTtZQUNILElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLEdBQXFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN2RyxJQUFJLENBQUMsU0FBUyxFQUFFO2dCQUNaLFNBQVMsR0FBRyxJQUFJLENBQUMs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QUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ25FLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztvQkFDTixhQUFhLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO2lCQUN0QztxQkFBTTtvQkFDSCxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsVUFBVSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2lCQUNuRTtZQUNMLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNWO0lBQ0wsQ0FBQztJQUVNLEtBQUs7UUFDUixJQUFJLFNBQVMsR0FBcUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3JGLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDWixTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztTQUMvQjtRQUNELElBQUksU0FBUyxFQUFFO1lBQ1gsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDO1NBQ3JCO1FBQ0QsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxPQUFPLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNELElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNWLENBQUM7SUFFTSx1Q0FBdUMsQ0FBQyxLQUFjO1FBQ3pELE9BQU87SUFDWCxDQUFDO0lBRU0scUJBQXFCO1FBQ3hCLElBQUksU0FBUyxHQUFxQixNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDckYsSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNaLFNBQVMsR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDO1NBQy9CO1FBRUQsT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3RKLENBQUM7Q0FVSiJ9