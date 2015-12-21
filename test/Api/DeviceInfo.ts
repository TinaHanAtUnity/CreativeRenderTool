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

    public getSoftwareVersion(): any[] {
        return ['OK', '23'];
    }

    public getHardwareVersion(): any[] {
        return ['OK', 'LGE Nexus 5'];
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

    public isWifi(): any[] {
        return ['OK', true];
    }

    public getUniqueEventId(): any[] {
        let asd: any[] = ['OK', this.generateRandomUUID()];
        console.dir(asd);
        return asd;
    }

    private generateRandomUUID(): string {
        let s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

}