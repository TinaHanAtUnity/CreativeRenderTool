import { View } from 'Core/Views/View';
export class AbstractVideoOverlay extends View {
    constructor(platform, containerId, muted, attachTap) {
        super(platform, containerId, attachTap);
        this._fadeEnabled = true;
        this._isPrivacyShowing = false;
        this._muted = muted;
    }
    static setAutoSkip(value) {
        AbstractVideoOverlay.AutoSkip = value;
    }
    setSkipDuration(value) {
        this._skipDuration = this._skipRemaining = value * 1000;
    }
    setVideoDuration(value) {
        this._videoDuration = value;
    }
    isMuted() {
        return this._muted;
    }
    setFadeEnabled(value) {
        if (this._fadeEnabled !== value) {
            this._fadeEnabled = value;
        }
    }
    isPrivacyShowing() {
        return this._isPrivacyShowing;
    }
}
AbstractVideoOverlay.AutoSkip = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWJzdHJhY3RWaWRlb092ZXJsYXkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1ZpZXdzL0Fic3RyYWN0VmlkZW9PdmVybGF5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQWN2QyxNQUFNLE9BQWdCLG9CQUFxQixTQUFRLElBQXFCO0lBa0JwRSxZQUFZLFFBQWtCLEVBQUUsV0FBbUIsRUFBRSxLQUFjLEVBQUUsU0FBK0I7UUFDaEcsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFKbEMsaUJBQVksR0FBWSxJQUFJLENBQUM7UUFDN0Isc0JBQWlCLEdBQVksS0FBSyxDQUFDO1FBSXpDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ3hCLENBQUM7SUFuQk0sTUFBTSxDQUFDLFdBQVcsQ0FBQyxLQUFjO1FBQ3BDLG9CQUFvQixDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDMUMsQ0FBQztJQW1CTSxlQUFlLENBQUMsS0FBYTtRQUNoQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxjQUFjLEdBQUcsS0FBSyxHQUFHLElBQUksQ0FBQztJQUM1RCxDQUFDO0lBRU0sZ0JBQWdCLENBQUMsS0FBYTtRQUNqQyxJQUFJLENBQUMsY0FBYyxHQUFHLEtBQUssQ0FBQztJQUNoQyxDQUFDO0lBRU0sT0FBTztRQUNWLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUN2QixDQUFDO0lBRU0sY0FBYyxDQUFDLEtBQWM7UUFDaEMsSUFBSSxJQUFJLENBQUMsWUFBWSxLQUFLLEtBQUssRUFBRTtZQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztTQUM3QjtJQUNMLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsaUJBQWlCLENBQUM7SUFDbEMsQ0FBQzs7QUFyQ2dCLDZCQUFRLEdBQVksS0FBSyxDQUFDIn0=