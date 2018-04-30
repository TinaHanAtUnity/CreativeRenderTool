import { Diagnostics } from 'Utilities/Diagnostics';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

import Base64Data from 'Utilities/Base64data';

interface IFLAMTest {
    name: string;
    type: string;
    base64data: string;
}

interface IFLAMErrorData {
    test: string;
    errorName?: string;
    errorMessage?: string;
    canPlayType?: string;
    pass?: boolean;
}

/*
* Basic class to measure webview capabilities of device
* */
class FLAMSingleton {

    public static getStoredData(testName: string, nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PRIVATE, `flam.${testName}`);
    }

    private static _instance: FLAMSingleton;
    private _FLAMTestResult: { [key: string]: boolean } = {};
    private _FLAMTests: { [key: string]: IFLAMTest } = {
        webp: {name: 'webp', type: 'img', base64data: Base64Data.images.webp},
        hevc: {name: 'hevc', type: 'video', base64data: Base64Data.video.hevc},
        vp9: {name: 'vp9', type: 'video', base64data: Base64Data.video.vp9}
    };

    constructor() {
        if (FLAMSingleton._instance) {
            throw new Error('Error: Singleton class; Use exposed functions directly');
        }

        FLAMSingleton._instance = this;
    }

    public measure(testsNames: string[], nativeBridge: NativeBridge) {
        /*
        * Let's wrap this function due to experimental nature of this class.
        * Even though it should not cause any major issues. Random errors on
        * some specific devices could be expected.
        * */
        try {
            this.runTests.apply(this, arguments);
        } catch (error) {
            this.sendDiagnosticsError('FLAM runtime error', {
                test: String(testsNames),
                errorName: error.name,
                errorMessage: error.message
            });
        }
    }

    private runTests(testsNames: string[], nativeBridge: NativeBridge) {
        const testsFinishedPromises = testsNames.map((name: string) => {
            return new Promise((resolve) => {
                const ft = this.getFLAMTestByName(name);
                if (typeof ft !== 'undefined') {
                    FLAMSingleton.getStoredData(name, nativeBridge).then((pass: boolean) => {
                        if (typeof pass !== 'boolean') {
                            /* TODO: Let's see if there will be eny cases like this. */
                            this.sendDiagnosticsError(`Saved value is not a boolean`, {test: name});
                            nativeBridge.Storage.delete(StorageType.PRIVATE, `flam.${name}`);
                            nativeBridge.Storage.write(StorageType.PRIVATE);
                        }
                        nativeBridge.Sdk.logInfo(`FLAM: Data already exists for ${name}: ${this.translateTestResult(pass)}`);
                        resolve();
                    }).catch(() => {
                        /* No data about test has been written into device's memory => run test */
                        nativeBridge.Sdk.logInfo(`FLAM: No data for ${name} exists`);
                        this.processFLAMTest(ft).then((pass) => {
                            this._FLAMTestResult[name] = pass;
                            resolve();
                        });
                    });
                } else {
                    this.sendDiagnosticsError(`Test not found`, {test: name});
                    resolve();
                }
            });
        });

        /* TODO: Allow some of them to fail, but still write successful results */
        Promise.all(testsFinishedPromises).then(() => {
            this.storeData(nativeBridge);
        });
    }

    private processFLAMTest(ft: IFLAMTest): Promise<boolean> {
        return new Promise((resolve) => {

            /* Forcefully resolve promise in 60 sec */
            setTimeout(() => {
                this.sendDiagnosticsError('Test has been forcefully resolved', {
                    test: ft.name
                });
                resolve(false);
            }, 60 * 1000);

            if (ft.type === 'video') {
                const el = <HTMLVideoElement>document.createElement('video');
                const MIMEType = ft.base64data.substring('data:video/'.length, ft.base64data.indexOf(';base64'));
                const canPlayType = el.canPlayType(`video/${MIMEType}`);

                el.onloadeddata = el.onprogress = el.onloadedmetadata = el.onerror = () => {
                    /* readyState >= 1 = metadata is loaded AND not an error */
                    const pass = el.readyState >= 1 && el.videoHeight > 0 && el.videoWidth > 0;

                    /* Let's test how much we can rely on canPlayType API */
                    if ((canPlayType === '' && pass) || (canPlayType === 'probably' && !pass)) {
                        this.sendDiagnosticsError('canPlayType and FLAM test do not match', {
                            test: ft.name,
                            canPlayType,
                            pass
                        });
                    }

                    resolve(pass);
                };

                el.src = ft.base64data;
            }

            if (ft.type === 'img') {
                const el = <HTMLImageElement>document.createElement('img');
                el.onload = el.onerror = () => {
                    resolve(el.complete && el.height > 0 && el.width > 0);
                };

                el.src = ft.base64data;
            }
        });
    }

    private getFLAMTestByName(name: string): IFLAMTest | undefined {
        return this._FLAMTests[name];
    }

    private storeData(nativeBridge: NativeBridge) {
        Diagnostics.trigger('flam_measure_test', this._FLAMTestResult);

        for (const name in this._FLAMTestResult) {
            if (this._FLAMTestResult.hasOwnProperty(name)) {
                const pass = this._FLAMTestResult[name];
                nativeBridge.Sdk.logInfo(`FLAM: Test for ${name}: ${this.translateTestResult(pass)}`);
                nativeBridge.Storage.set(StorageType.PRIVATE, `flam.${name}`, pass);
            }
        }

        nativeBridge.Storage.write(StorageType.PRIVATE);

        this._FLAMTestResult = {};
    }

    private sendDiagnosticsError(message: string, data: IFLAMErrorData) {
        Diagnostics.trigger('flam_measure_test_error', {
            message,
            ...data
        });
    }

    private translateTestResult(pass: boolean | undefined): string {
        if (typeof pass === 'boolean') {
            return pass ? 'PASSED' : 'FAILED';
        } else {
            return 'N/A';
        }
    }
}

export const FLAM = new FLAMSingleton();
