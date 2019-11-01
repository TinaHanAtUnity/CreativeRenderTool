import { BackendApi } from 'Backend/BackendApi';

export class ClassDetection extends BackendApi {

    private _classesArePresent: boolean = false;
    public setClassesArePresent(present: boolean) {
        this._classesArePresent = present;
    }

    public areClassesPresent(className: string[]) {
        if (this._classesArePresent) {
            return [true, true, true, true, true, true];
        }
        return [false, false, false, false, false, false];
    }
}
