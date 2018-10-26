import { BackendApi } from 'Backend/BackendApi';

export class Intent extends BackendApi {

    public launch(intentData: any) {
        if('uri' in intentData) {
            window.open(intentData.uri);
        }
    }

}
