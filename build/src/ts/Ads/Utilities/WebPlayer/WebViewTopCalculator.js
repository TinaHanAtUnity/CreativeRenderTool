import { Platform } from 'Core/Constants/Platform';
export class WebViewTopCalculator {
    constructor(deviceInfo, platform) {
        this._deviceInfo = deviceInfo;
        this._platform = platform;
    }
    getTopPosition(width, height) {
        let value = 0;
        if (width > height) {
            if (this._platform === Platform.IOS) {
                value = this.calculateIPhoneTopViewLandscape(height);
            }
            else {
                value = this.calculateAndroidTopViewLandscape(height);
            }
        }
        else {
            if (this._platform === Platform.IOS) {
                value = this.calculateIPhoneTopViewPortrait(height);
            }
            else {
                value = this.calculateAndroidTopViewPortrait(height);
            }
        }
        return value;
    }
    calculateAndroidTopViewPortrait(height) {
        const topWebViewAreaMinHeight = height / 40;
        return Math.floor(this.getAndroidViewSize(topWebViewAreaMinHeight, this.getScreenDensity()));
    }
    calculateAndroidTopViewLandscape(height) {
        const topWebViewAreaMinHeight = height / 25;
        return Math.floor(this.getAndroidViewSize(topWebViewAreaMinHeight, this.getScreenDensity()));
    }
    calculateIPhoneTopViewPortrait(height) {
        if (this.isIPhoneX(height)) {
            return height * 0.11;
        }
        else {
            return height * 0.06;
        }
    }
    calculateIPhoneTopViewLandscape(height) {
        return height * 0.11;
    }
    getAndroidViewSize(size, density) {
        return size * (density / 160);
    }
    getScreenDensity() {
        return this._deviceInfo.getScreenDensity();
    }
    isIPhoneX(height) {
        let isIPhonex = false;
        switch (height) {
            case 812:
                // X and Xs pixel-ratio -> 3
                isIPhonex = true;
                break;
            case 896:
                // XsMax    pixel-ratio -> 3
                // Xr       pixel-ratio -> 2
                isIPhonex = true;
                break;
            default:
        }
        return isIPhonex;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2ViVmlld1RvcENhbGN1bGF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9XZWJQbGF5ZXIvV2ViVmlld1RvcENhbGN1bGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBR25ELE1BQU0sT0FBTyxvQkFBb0I7SUFLN0IsWUFBWSxVQUFzQixFQUFFLFFBQWtCO1FBQ2xELElBQUksQ0FBQyxXQUFXLEdBQUcsVUFBVSxDQUFDO1FBQzlCLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0lBQzlCLENBQUM7SUFFTSxjQUFjLENBQUMsS0FBYSxFQUFFLE1BQWM7UUFDL0MsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsSUFBSSxLQUFLLEdBQUcsTUFBTSxFQUFFO1lBQ2hCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxLQUFLLEdBQUcsSUFBSSxDQUFDLCtCQUErQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3hEO2lCQUFNO2dCQUNILEtBQUssR0FBRyxJQUFJLENBQUMsZ0NBQWdDLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDekQ7U0FDSjthQUFNO1lBQ0gsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2pDLEtBQUssR0FBRyxJQUFJLENBQUMsOEJBQThCLENBQUMsTUFBTSxDQUFDLENBQUM7YUFDdkQ7aUJBQU07Z0JBQ0gsS0FBSyxHQUFHLElBQUksQ0FBQywrQkFBK0IsQ0FBQyxNQUFNLENBQUMsQ0FBQzthQUN4RDtTQUNKO1FBRUQsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVPLCtCQUErQixDQUFDLE1BQWM7UUFDbEQsTUFBTSx1QkFBdUIsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7SUFFTyxnQ0FBZ0MsQ0FBQyxNQUFjO1FBQ25ELE1BQU0sdUJBQXVCLEdBQUcsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUM1QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLHVCQUF1QixFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0lBRU8sOEJBQThCLENBQUMsTUFBYztRQUNqRCxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDeEIsT0FBTyxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ3hCO2FBQU07WUFDSCxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUM7U0FDeEI7SUFDTCxDQUFDO0lBRU8sK0JBQStCLENBQUMsTUFBYztRQUNsRCxPQUFPLE1BQU0sR0FBRyxJQUFJLENBQUM7SUFDekIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLElBQVksRUFBRSxPQUFlO1FBQ3BELE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTyxnQkFBZ0I7UUFDcEIsT0FBNEIsSUFBSSxDQUFDLFdBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQ3JFLENBQUM7SUFFTyxTQUFTLENBQUMsTUFBYztRQUM1QixJQUFJLFNBQVMsR0FBRyxLQUFLLENBQUM7UUFDdEIsUUFBUSxNQUFNLEVBQUU7WUFDWixLQUFLLEdBQUc7Z0JBQ0osNEJBQTRCO2dCQUM1QixTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixNQUFNO1lBQ1YsS0FBSyxHQUFHO2dCQUNKLDRCQUE0QjtnQkFDNUIsNEJBQTRCO2dCQUM1QixTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixNQUFNO1lBQ1YsUUFBUTtTQUNYO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDckIsQ0FBQztDQUNKIn0=