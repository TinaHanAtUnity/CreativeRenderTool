import { BackendApi } from 'Backend/BackendApi';

export class Intent extends BackendApi {

    public launch(intentData: { [key: string]: unknown }) {
        if ('uri' in intentData) {
            window.open(<string>intentData.uri);
        }
    }

}
