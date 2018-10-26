import { BackendApi } from 'Backend/BackendApi';

export class UrlScheme extends BackendApi {

    public open(url: string) {
        window.open(url);
    }

}
