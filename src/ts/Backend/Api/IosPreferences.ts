import { BackendApi } from 'Backend/BackendApi';

export class IosPreferences extends BackendApi {
    public getString(key: string): Promise<string> {
        return Promise.reject(['COULDNT_GET_VALUE', key]);
    }
}
