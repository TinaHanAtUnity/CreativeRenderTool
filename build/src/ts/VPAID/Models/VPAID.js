export class VPAID {
    constructor(mediaFile, vast) {
        this.vast = vast;
        this.mediaFile = mediaFile;
    }
    getCompanionClickThroughURL() {
        const companion = this.getCompanion();
        if (companion) {
            return companion.getCompanionClickThroughURLTemplate();
        }
        return null;
    }
    hasEndScreen() {
        return !!this.getCompanionLandscapeUrl() || !!this.getCompanionPortraitUrl();
    }
    hasCompanionAd() {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getStaticCompanionAds();
            return companions.length !== 0;
        }
        return false;
    }
    getCompanion() {
        const ad = this.vast.getAd();
        if (ad) {
            const companions = ad.getStaticCompanionAds();
            if (companions.length) {
                return companions[0];
            }
        }
        return null;
    }
    getCompanionPortraitUrl() {
        return this.vast.getStaticCompanionPortraitUrl();
    }
    getCompanionLandscapeUrl() {
        return this.vast.getStaticCompanionLandscapeUrl();
    }
    getScriptUrl() {
        return this.mediaFile.getFileURL();
    }
    getCreativeParameters() {
        const ad = this.vast.getAd();
        if (ad) {
            const creative = ad.getCreative();
            if (creative) {
                return creative.getAdParameters() || {};
            }
        }
        return {};
    }
    getVideoClickTrackingURLs() {
        return this.vast.getVideoClickTrackingURLs() || [];
    }
    getTrackingEventUrls(eventName) {
        return this.vast.getTrackingEventUrls(eventName);
    }
    getImpressionUrls() {
        return this.vast.getImpressionUrls();
    }
    addTrackingEventUrl(eventName, url) {
        this.vast.addTrackingEventUrl(eventName, url);
    }
    getVideoClickThroughURL() {
        const url = this.vast.getVideoClickThroughURL();
        if (this.isValidURL(url)) {
            return url;
        }
        else {
            return null;
        }
    }
    isValidURL(url) {
        const reg = new RegExp('^(https?)://.+$');
        return !!url && reg.test(url);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSUQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVlBBSUQvTW9kZWxzL1ZQQUlELnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE1BQU0sT0FBTyxLQUFLO0lBSWQsWUFBWSxTQUF3QixFQUFFLElBQVU7UUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7SUFDL0IsQ0FBQztJQUVNLDJCQUEyQjtRQUM5QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFDdEMsSUFBSSxTQUFTLEVBQUU7WUFDWCxPQUFPLFNBQVMsQ0FBQyxtQ0FBbUMsRUFBRSxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7SUFDakYsQ0FBQztJQUVNLGNBQWM7UUFDakIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUM3QixJQUFJLEVBQUUsRUFBRTtZQUNKLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQzlDLE9BQU8sVUFBVSxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7U0FDbEM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU0sWUFBWTtRQUNmLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDN0IsSUFBSSxFQUFFLEVBQUU7WUFDSixNQUFNLFVBQVUsR0FBRyxFQUFFLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUM5QyxJQUFJLFVBQVUsQ0FBQyxNQUFNLEVBQUU7Z0JBQ25CLE9BQU8sVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hCO1NBQ0o7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRU0sdUJBQXVCO1FBQzFCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO0lBQ3JELENBQUM7SUFDTSx3QkFBd0I7UUFDM0IsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFLENBQUM7SUFDdEQsQ0FBQztJQUVNLFlBQVk7UUFDZixPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFHLENBQUM7SUFDeEMsQ0FBQztJQUVNLHFCQUFxQjtRQUN4QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzdCLElBQUksRUFBRSxFQUFFO1lBQ0osTUFBTSxRQUFRLEdBQXVCLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUN0RCxJQUFJLFFBQVEsRUFBRTtnQkFDVixPQUFPLFFBQVEsQ0FBQyxlQUFlLEVBQUUsSUFBSSxFQUFFLENBQUM7YUFDM0M7U0FDSjtRQUNELE9BQU8sRUFBRSxDQUFDO0lBQ2QsQ0FBQztJQUVNLHlCQUF5QjtRQUM1QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsSUFBSSxFQUFFLENBQUM7SUFDdkQsQ0FBQztJQUVNLG9CQUFvQixDQUFDLFNBQXdCO1FBQ2hELE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyRCxDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3pDLENBQUM7SUFFTSxtQkFBbUIsQ0FBQyxTQUFpQixFQUFFLEdBQVc7UUFDckQsSUFBSSxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLHVCQUF1QjtRQUMxQixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLHVCQUF1QixFQUFFLENBQUM7UUFDaEQsSUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sR0FBRyxDQUFDO1NBQ2Q7YUFBTTtZQUNILE9BQU8sSUFBSSxDQUFDO1NBQ2Y7SUFDTCxDQUFDO0lBRU8sVUFBVSxDQUFDLEdBQWtCO1FBQ2pDLE1BQU0sR0FBRyxHQUFHLElBQUksTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFDMUMsT0FBTyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbEMsQ0FBQztDQUNKIn0=