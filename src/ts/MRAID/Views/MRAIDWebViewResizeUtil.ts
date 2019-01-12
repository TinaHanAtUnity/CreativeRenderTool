import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';

export class MRAIDWebViewResizeUtil {

    private _deviceInfo: DeviceInfo;
    private _platform: Platform;

    constructor(deviceInfo: DeviceInfo, platform: Platform) {
        this._deviceInfo = deviceInfo;
        this._platform = platform;
    }

    public getTopAreaSize(width: number, height: number): number {
        let value = 0;

        if (width > height) {
            if (this._platform === Platform.IOS) {
                value = this.calculateIPhoneViewHeightHor(height);
            } else {
                value = this.calculateAndroidViewHeightHor(height);
            }
        } else {
            if (this._platform === Platform.IOS && this.isIPhoneXVert(height)) {
                value = this.calculateIPhoneXViewHeightVert(height);
            } else if (this._platform === Platform.IOS) {
                value = this.calculateIPhoneViewHeightVert(height);
            } else {
                value = this.calculateAndroidViewHeightVert(height);
            }
        }

        return value;
    }

    private calculateAndroidViewHeightVert(height: number): number {
        const topWebViewAreaMinHeight = height / 40;
        return Math.floor(this.getAndroidViewSize(topWebViewAreaMinHeight, this.getScreenDensity()));
    }

    private calculateAndroidViewHeightHor(height: number): number {
        const topWebViewAreaMinHeight = height / 25;
        return Math.floor(this.getAndroidViewSize(topWebViewAreaMinHeight, this.getScreenDensity()));
    }

    private calculateIPhoneViewHeightVert(height: number): number {
        return height * 0.06;
    }

    private calculateIPhoneViewHeightHor(height: number) {
        return height * 0.11;
    }

    private calculateIPhoneXViewHeightVert(height: number): number {
        return height * 0.11;
    }

    private getAndroidViewSize(size: number, density: number): number {
        return size * (density / 160);
    }

    private getScreenDensity(): number {
        return (<AndroidDeviceInfo>this._deviceInfo).getScreenDensity();
    }

    private isIPhoneXVert(height: number): boolean {
        let isIPhonex = false;
        switch(height) {
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
