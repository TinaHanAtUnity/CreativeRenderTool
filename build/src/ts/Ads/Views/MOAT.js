import { Platform } from 'Core/Constants/Platform';
import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { Template } from 'Core/Utilities/Template';
import { View } from 'Core/Views/View';
import MOATTemplate from 'html/MOAT.html';
import MOATContainer from 'html/moat/container.html';
export var MoatState;
(function (MoatState) {
    MoatState[MoatState["PLAYING"] = 0] = "PLAYING";
    MoatState[MoatState["PAUSED"] = 1] = "PAUSED";
    MoatState[MoatState["COMPLETED"] = 2] = "COMPLETED";
    MoatState[MoatState["STOPPED"] = 3] = "STOPPED";
})(MoatState || (MoatState = {}));
export class MOAT extends View {
    constructor(platform, core, muteVideo) {
        super(platform, 'moat');
        this._didInitMoat = false;
        this._state = MoatState.STOPPED;
        this._template = new Template(MOATTemplate);
        this._core = core;
        this._bindings = [];
        this._messageListener = (e) => this.onMessage(e);
        this._playerVolume = muteVideo ? 0 : 1;
    }
    setPlayerVolume(playerVolume) {
        this._playerVolume = playerVolume;
    }
    render() {
        super.render();
        const iframe = this._iframe = this._container.querySelector('#moat-iframe');
        iframe.srcdoc = MOATContainer;
    }
    play(volume) {
        if (this.getState() === MoatState.STOPPED || this.getState() === MoatState.PAUSED) {
            this.setState(MoatState.PLAYING);
            this.triggerVideoEvent('AdPlaying', volume);
            this.triggerViewabilityEvent('exposure', true);
        }
    }
    pause(volume) {
        if (this.getState() === MoatState.PLAYING && this._iframe.contentWindow) {
            this.setState(MoatState.PAUSED);
            this.triggerVideoEvent('AdPaused', volume);
            this.triggerViewabilityEvent('exposure', false);
        }
    }
    stop(volume) {
        if (this.getState() === MoatState.PLAYING || this.getState() === MoatState.PAUSED) {
            this.setState(MoatState.STOPPED);
            this.triggerVideoEvent('AdStopped', volume);
        }
    }
    completed(volume) {
        if (this.getState() !== MoatState.COMPLETED) {
            this.setState(MoatState.COMPLETED);
            this.triggerVideoEvent('AdVideoComplete', volume);
        }
    }
    volumeChange(volume) {
        if (this.getState() !== MoatState.COMPLETED) {
            this.triggerVideoEvent('AdVolumeChange', volume);
            this.triggerViewabilityEvent('volume', volume * 100);
        }
    }
    init(ids, duration, url, moatData, volume) {
        if (!this._didInitMoat) {
            this._didInitMoat = true;
            this._resizeDelayer = (event) => {
                this._resizeTimeout = window.setTimeout(() => {
                    this._resizeHandler(event);
                }, 200);
            };
            this._resizeHandler = (event) => {
                if (this._iframe.contentWindow) {
                    this._iframe.contentWindow.postMessage({
                        type: 'resize',
                        width: window.innerWidth,
                        height: window.innerHeight
                    }, '*');
                }
            };
            if (this._platform === Platform.IOS) {
                window.addEventListener('resize', this._resizeDelayer, false);
            }
            else {
                window.addEventListener('resize', this._resizeHandler, false);
            }
            this._core.Sdk.logDebug('Calling MOAT init with: ' + JSON.stringify(ids) + ' duration: ' + duration + ' url: ' + url);
            this._iframe.contentWindow.postMessage({
                type: 'init',
                data: {
                    ids,
                    duration,
                    url,
                    moatData
                }
            }, '*');
            this._iframe.contentWindow.postMessage({
                type: 'resize',
                width: window.innerWidth,
                height: window.innerHeight
            }, '*');
        }
        else {
            if (this._platform === Platform.ANDROID) {
                this.play(volume);
            }
        }
    }
    addMessageListener() {
        window.addEventListener('message', this._messageListener);
    }
    removeMessageListener() {
        window.removeEventListener('message', this._messageListener);
    }
    triggerVideoEvent(type, volume) {
        this._core.Sdk.logDebug('Calling MOAT video event "' + type + '" with volume: ' + volume);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: 'videoEvent',
                data: {
                    type: type,
                    adVolume: this._playerVolume,
                    volume: volume
                }
            }, '*');
        }
    }
    triggerViewabilityEvent(type, payload) {
        this._core.Sdk.logDebug('Calling MOAT viewability event "' + type + '" with payload: ' + payload);
        if (this._iframe.contentWindow) {
            this._iframe.contentWindow.postMessage({
                type: type,
                payload: payload
            }, '*');
        }
    }
    getState() {
        return this._state;
    }
    setState(state) {
        this._state = state;
    }
    onMessage(e) {
        if (e && e.data && e.data.type) {
            switch (e.data.type) {
                case 'MOATVideoError':
                    Diagnostics.trigger('moat_video_error', e.data.error);
                    break;
                case 'loaded':
                    // do nothing
                    break;
                default:
                    this._core.Sdk.logWarning(`MOAT Unknown message type ${e.data.type}`);
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTU9BVC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVmlld3MvTU9BVC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3pELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDdkMsT0FBTyxZQUFZLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUMsT0FBTyxhQUFhLE1BQU0sMEJBQTBCLENBQUM7QUFHckQsTUFBTSxDQUFOLElBQVksU0FLWDtBQUxELFdBQVksU0FBUztJQUNqQiwrQ0FBTyxDQUFBO0lBQ1AsNkNBQU0sQ0FBQTtJQUNOLG1EQUFTLENBQUE7SUFDVCwrQ0FBTyxDQUFBO0FBQ1gsQ0FBQyxFQUxXLFNBQVMsS0FBVCxTQUFTLFFBS3BCO0FBRUQsTUFBTSxPQUFPLElBQUssU0FBUSxJQUFrQjtJQVl4QyxZQUFZLFFBQWtCLEVBQUUsSUFBYyxFQUFFLFNBQWtCO1FBQzlELEtBQUssQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFOcEIsaUJBQVksR0FBRyxLQUFLLENBQUM7UUFFckIsV0FBTSxHQUFjLFNBQVMsQ0FBQyxPQUFPLENBQUM7UUFLMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUM1QyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztRQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFlLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0QsSUFB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