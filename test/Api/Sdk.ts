export class Sdk {

    public loadComplete(): any[] {
        return ['OK', 12345, true];
    }

    public initComplete(): any[] {
        return ['OK'];
    }

    public getSdkVersion(): any[] {
        return ['OK', '2.0.0-alpha1'];
    }

}