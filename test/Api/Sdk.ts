export class Sdk {

    public loadComplete(): any[] {
        return ['OK', 12345, true, '2.0.0-alpha1', '2.0.0-alpha1', 'android'];
    }

    public initComplete(): any[] {
        return ['OK'];
    }

}