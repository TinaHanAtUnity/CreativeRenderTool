import { BackendApi } from '../BackendApi';

export class UrlScheme extends BackendApi {

    public open(url: string) {
        window.open(url);
    }

}
