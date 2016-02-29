import { TestApi } from './TestApi';

export class Sdk extends TestApi {

    public loadComplete(): any[] {
        return ['OK', 12345, true, '2.0.0-alpha1', '2.0.0-alpha1', 'android', true, 'https://example.net/config.json', 'https://example.net/webview.html', '12345678'];
    }

    public initComplete(): any[] {
        return ['OK'];
    }

}