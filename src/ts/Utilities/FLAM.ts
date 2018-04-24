import { Diagnostics } from 'Utilities/Diagnostics';
import { NativeBridge } from 'Native/NativeBridge';
import { StorageType } from 'Native/Api/Storage';

import Base64Data from 'Utilities/Base64data';

interface IFLAMTest {
    name: string;
    type: string;
    base64data: string;
}

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
            Diagnostics.trigger('flam_measure_test_error', {
                error: new Error('Error: Singleton class, use exposed functions directly'),
                device: window.navigator.userAgent
            });
        }
        FLAMSingleton._instance = this;
    }

    public measure(testNameArr: string[], nativeBridge: NativeBridge) {
        testNameArr.map((testName) => {
            const ft = this._getFLAMTestByName(testName);
            if (typeof ft !== 'undefined') {
                FLAMSingleton.getStoredData(ft.name, nativeBridge).then((pass: boolean) => {
                    nativeBridge.Sdk.logDebug(`FLAM test for ${ft.name}: ${pass ? 'PASSED' : 'FAILED'}`);
                }).catch(() => {
                    /* No data about test is written into device's memory => run test */
                    this._processFLAMTest(ft).then((pass: boolean) => {
                        this._storeData(ft, pass, nativeBridge);
                    });
                });
            } else {
                Diagnostics.trigger('flam_measure_test_error', {
                    error: new Error(`No test named: ${testName}`),
                    device: window.navigator.userAgent
                });
            }
        });
    }

    private _processFLAMTest(ft: IFLAMTest): Promise<boolean> {
        console.log('Running', ft.name);
        return new Promise((resolve) => {
            if (ft.type === 'video') {
                const el = <HTMLVideoElement>document.createElement('video');
                const MIMEType = ft.base64data.substring('data:video/'.length, ft.base64data.indexOf(';base64'));
                const canPlayType = el.canPlayType(`video/${MIMEType}`);

                el.onloadeddata = el.onerror = () => {
                    const isLoaded = el.readyState === 4 && el.videoHeight > 0 && el.videoWidth > 0;

                    /* Let's test how much we can rely on canPlayType API */
                    if ((canPlayType === '' && isLoaded) || ((canPlayType === 'maybe') || (canPlayType === 'probably') && !isLoaded)) {
                        Diagnostics.trigger('flam_measure_test_warning', {
                            message: 'canPlayType and FLAM test do not match',
                            device: window.navigator.userAgent,
                            testName: ft.name,
                            canPlayType,
                            isLoaded
                        });
                    }

                    resolve(isLoaded);
                };

                el.src = ft.base64data;
                document.body.appendChild(el);
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
            other: `FLAM test for ${test.name}: ${pass ? 'PASSED' : 'FAILED'}`,
            ts: new Date()
        };

        console.log(data.other);

        Diagnostics.trigger('flam_measure_test', data);
        nativeBridge.Storage.set(StorageType.PRIVATE, `flam.${test.name}`, pass);
        nativeBridge.Storage.write(StorageType.PRIVATE);
    }
}

export const FLAM = new FLAMSingleton();
