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
    isLoaded?: boolean;
}

/*
* Basic class to measure webview capabilities of device
* */
class FLAMSingleton {

    public static getStoredData(testName: string, nativeBridge: NativeBridge): Promise<boolean> {
        return nativeBridge.Storage.get(StorageType.PRIVATE, `flam.${testName}`);
    }

    private static _instance: FLAMSingleton;
    private _FLAMTests: IFLAMTest[] = [
        {name: 'webp', type: 'img', base64data: Base64Data.images.webp},
        {name: 'hevc', type: 'video', base64data: Base64Data.video.hevc},
        {name: 'vp9', type: 'video', base64data: Base64Data.video.vp9}
    ];

    constructor() {
        if (FLAMSingleton._instance) {
            throw new Error('Error: Singleton class; Use exposed functions directly');
        }

        FLAMSingleton._instance = this;
    }

    public measure(testNameArr: string[], nativeBridge: NativeBridge) {
        /*
        * Let's wrap this function due to experimental nature of this class.
        * Even though it should not cause any major issues. Random errors on
        * some specific devices could be expected.
        * */
        try {
            this._measure.apply(this, arguments);
        } catch (error) {
            this._sendDiagnosticsError('FLAM runtime error', {
                test: String(testNameArr),
                errorName: error.name,
                errorMessage: error.message
            });
        }
    }

    private _measure(testNameArr: string[], nativeBridge: NativeBridge) {
        testNameArr.map((name) => {
            const ft = this._getFLAMTestByName(name);
            if (typeof ft !== 'undefined') {
                FLAMSingleton.getStoredData(ft.name, nativeBridge).then((pass: boolean) => {
                    if (typeof pass === 'boolean') {
                        nativeBridge.Sdk.logDebug(`FLAM test for ${ft.name}: ${pass ? 'PASSED' : 'FAILED'}`);
                    } else {
                        nativeBridge.Storage.delete(StorageType.PRIVATE, `flam.${ft.name}`);
                        nativeBridge.Storage.write(StorageType.PRIVATE);

                        this._sendDiagnosticsError(`Saved value is not a boolean`, {test: ft.name});
                    }
                }).catch(() => {
                    /* No data about test has been written into device's memory => run test */
                    this._processFLAMTest(ft).then((pass: boolean) => {
                        this._storeData(ft, pass, nativeBridge);
                    });
                });
            } else {
                this._sendDiagnosticsError(`Test not found`, {test: name});
            }
        });
    }

    private _processFLAMTest(ft: IFLAMTest): Promise<boolean> {
        return new Promise((resolve) => {
            if (ft.type === 'video') {
                const el = <HTMLVideoElement>document.createElement('video');
                const MIMEType = ft.base64data.substring('data:video/'.length, ft.base64data.indexOf(';base64'));
                const canPlayType = el.canPlayType(`video/${MIMEType}`);

                el.onloadeddata = el.onerror = () => {
                    const isLoaded = el.readyState === 4 && el.videoHeight > 0 && el.videoWidth > 0;

                    /* Let's test how much we can rely on canPlayType API */
                    if ((canPlayType === '' && isLoaded) || (canPlayType === 'probably' && !isLoaded)) {
                        this._sendDiagnosticsError('canPlayType and FLAM test do not match', {
                            test: ft.name,
                            canPlayType,
                            isLoaded
                        });
                    }

                    resolve(isLoaded);
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

    private _getFLAMTestByName(name: string): IFLAMTest | undefined {
        return this._FLAMTests.find((ft) => ft.name === name);
    }

    private _storeData(test: IFLAMTest, pass: boolean, nativeBridge: NativeBridge) {
        const data = {
            test: test.name,
            result: pass ? 'PASSED' : 'FAILED'
        };

        Diagnostics.trigger('flam_measure_test', data);
        nativeBridge.Storage.set(StorageType.PRIVATE, `flam.${test.name}`, pass);
        nativeBridge.Storage.write(StorageType.PRIVATE);
    }

    private _sendDiagnosticsError(message: string, data: IFLAMErrorData) {
        Diagnostics.trigger('flam_measure_test_error', {
            message,
            ...data
        });
    }
}

export const FLAM = new FLAMSingleton();
