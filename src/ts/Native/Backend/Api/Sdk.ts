export class Sdk {

    public static loadComplete() {
        return [
            '14851',
            false,
            'com.unity3d.ads.example',
            '2.0.5',
            2005,
            '2.0.5',
            true,
            'https://config.unityads.unity3d.com/webview/master/release/config.json',
            'https://webview.unityads.unity3d.com/webview/master/release/index.html?version=14074b3e2814a1ce9b560821dc6f16f0b045413d',
            'f87a80ca1665bb5dbe2a6083fcef6008a96876e9c44f9046f33795ae3ffd663e',
            '14074b3e2814a1ce9b560821dc6f16f0b045413d'
        ];
    }

    public static initComplete() {
        return;
    }

    public static logError(message: string) {
        console.error(message);
    }

    public static logInfo(message: string) {
        // tslint:disable:no-console
        console.info(message);
        // tslint:enable:no-console
    }

}
