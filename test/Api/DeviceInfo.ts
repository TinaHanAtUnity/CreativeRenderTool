export class DeviceInfo {

    public getAndroidId(): any[] {
        return ['OK', '6ea99dfb2436dc8f'];
    }

    public getAdvertisingTrackingId(): any[] {
        return ['OK', '4649c6ec-09c8-4bd0-87e0-67f24c914c8e'];
    }

    public getLimitAdTrackingFlag(): any[] {
        return ['OK', false];
    }

    public getApiLevel(): any[] {
        return ['OK', 23];
    }

    public getOsVersion(): any[] {
        return ['OK', '6.0.1'];
    }

    public getManufacturer(): any[] {
        return ['OK', 'LGE'];
    }

    public getModel(): any[] {
        return ['OK', 'Nexus 5'];
    }

    public getNetworkType(): any[] {
        return ['OK', 0];
    }

    public getScreenLayout(): any[] {
        return ['OK', 268435794];
    }

    public getScreenDensity(): any[] {
        return ['OK', 480];
    }

    public getUniqueEventId(): any[] {
        return ['OK', this.generateRandomUUID()];
    }

    private generateRandomUUID(): string {
        let s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}