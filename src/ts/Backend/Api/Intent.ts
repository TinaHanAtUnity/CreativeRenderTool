import { BackendApi } from 'Backend/BackendApi';

export class Intent extends BackendApi {

    public launch(intentData: unknown) {
        if('uri' in intentData) {
            window.open(intentData.uri);
        }
    }

}
