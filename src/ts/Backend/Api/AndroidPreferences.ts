import { BackendApi } from 'Backend/BackendApi';

export class AndroidPreferences extends BackendApi {
    public getString(name: string, key: string): Promise<string> {
        return Promise.reject(['COULDNT_GET_VALUE', name, key]);
    }
}
