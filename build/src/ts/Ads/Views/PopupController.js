export class PopupController {
    constructor(privacySettings) {
        this._privacySettings = privacySettings;
        this._showingPrivacy = false;
        this._handlers = [];
    }
    addEventHandler(handler) {
        this._handlers.push(handler);
        return handler;
    }
    removeEventHandler(handler) {
        if (this._handlers.length) {
            if (typeof handler !== 'undefined') {
                this._handlers = this._handlers.filter(storedHandler => storedHandler !== handler);
            }
            else {
                this._handlers = [];
            }
        }
    }
    show() {
        if (!this._privacySettings.container() || !this._privacySettings.container().parentElement) {
            this._privacySettings.render();
            this._privacySettings.hide();
            document.body.appendChild(this._privacySettings.container());
            this._privacySettings.addEventHandler(this);
        }
        this._showingPrivacy = true;
        this._handlers.forEach(handler => handler.onPopupShow());
        this._privacySettings.show();
        this._handlers.forEach(handler => handler.onPopupVisible());
    }
    hideAndRemovePopups() {
        this._showingPrivacy = false;
        if (this._privacySettings) {
            this._privacySettings.removeEventHandler(this);
            this._privacySettings.hide();
            const container = this._privacySettings.container();
            if (container && container.parentElement) {
                container.parentElement.removeChild(container);
            }
        }
    }
    isShowing() {
        return this._showingPrivacy;
    }
    onPrivacyClose() {
        this._privacySettings.hide();
        this._showingPrivacy = false;
        this._handlers.forEach(handler => handler.onPopupClosed());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUG9wdXBDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9Qb3B1cENvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBUUEsTUFBTSxPQUFPLGVBQWU7SUFPeEIsWUFBWSxlQUFnQztRQUN4QyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBQzdCLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxlQUFlLENBQUMsT0FBMkI7UUFDOUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0IsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUVNLGtCQUFrQixDQUFDLE9BQTJCO1FBQ2pELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUU7WUFDdkIsSUFBSSxPQUFPLE9BQU8sS0FBSyxXQUFXLEVBQUU7Z0JBQ2hDLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEtBQUssT0FBTyxDQUFDLENBQUM7YUFDdEY7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7YUFDdkI7U0FDSjtJQUNMLENBQUM7SUFFTSxJQUFJO1FBQ1AsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxhQUFhLEVBQUU7WUFDeEYsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxDQUFDO1lBQy9CLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUM3QixRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztZQUM3RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQy9DO1FBRUQsSUFBSSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7UUFDNUIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUV6RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRU0sbUJBQW1CO1FBQ3RCLElBQUksQ0FBQyxlQUFlLEdBQUcsS0FBSyxDQUFDO1FBRTdCLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1lBQ3ZCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMvQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDN0IsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ3BELElBQUksU0FBUyxJQUFJLFNBQVMsQ0FBQyxhQUFhLEVBQUU7Z0JBQ3RDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ2xEO1NBQ0o7SUFDTCxDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUNoQyxDQUFDO0lBRU0sY0FBYztRQUNqQixJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDN0IsSUFBSSxDQUFDLGVBQWUsR0FBRyxLQUFLLENBQUM7UUFDN0IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0oifQ==