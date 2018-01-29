import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { NativeBridge } from 'Native/NativeBridge';
import { MOAT } from 'Views/MOAT';
import { MoatViewabilityService, IMoatData, IMoatIds } from 'Utilities/MoatViewabilityService';
import { Campaign } from 'Models/Campaign';
import { TestFixtures } from '../TestHelpers/TestFixtures';
import { Platform } from 'Constants/Platform';
import MOATContainer from 'html/moat/container.html';

describe('MOAT View', () => {

    let nativeBridge: NativeBridge;
    let moat: MOAT;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        moat = new MOAT(nativeBridge);
    });

    describe('render', () => {

        beforeEach(() => {
            moat.render();
            document.body.appendChild(moat.container());
        });

        it ('should include moat container in the moat iframe', () => {
            const iframe = moat.container().querySelector('iframe')!;
            const srcdoc = iframe.getAttribute('srcdoc');

            assert.isNotNull(srcdoc);
            assert.isNotNull(moat.container().innerHTML);
            assert.isTrue(srcdoc!.indexOf(moat.container().querySelector('iframe')!.innerHTML) !== -1);
        });
    });

    describe('init', () => {
        let iframe: HTMLIFrameElement;
        let fakeMoatIds: IMoatIds;
        let fakeMoatData: IMoatData;

        beforeEach(() => {
            moat.render();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());

            fakeMoatIds = {
                level1: 1,
                level2: 'test',
                level3: 'test',
                level4: 'test',
                slicer1: 'test',
                slicer2: 'test',
                slicer3: 'test'
            };

            fakeMoatData = {
                SDK: 'test',
                Version: 'test',
                SDKVersion: 'test',
                IFA: 'test',
                LimitAdTracking: false,
                COPPA: true,
                bundle: 'test'
            };
            moat.init(fakeMoatIds, 1, 'https://test.com', fakeMoatData, 1);
        });

        afterEach(() => {
            document.body.removeChild(moat.container());
            moat.hide();
        });

        it ('should send the init message', () => {
            const promise = new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (e: MessageEvent) => {
                    try {
                        assert.isTrue(e.data.type === 'init');
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            });
            return promise;
        });
    });

    describe('triggering video event', () => {
        let iframe: HTMLIFrameElement;

        beforeEach(() => {
            moat.render();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
        });

        it ('should fire the video message', () => {
            const promise = new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (e: MessageEvent) => {
                    try {
                        assert.isTrue(e.data.type === 'videoEvent');
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            });
            moat.triggerVideoEvent('test', 1);
            return promise;
        });
    });

    describe('triggering viewability event', () => {
        let iframe: HTMLIFrameElement;

        beforeEach(() => {
            moat.render();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
        });

        it ('should fire the viewability message of the specified type', () => {
            const promise = new Promise((resolve, reject) => {
                iframe.contentWindow.addEventListener('message', (e: MessageEvent) => {
                    try {
                        assert.isTrue(e.data.type === 'testViewabilityEvent');
                        resolve();
                    } catch(e) {
                        reject(e);
                    }
                });
            });
            moat.triggerViewabilityEvent('testViewabilityEvent', 'test');
            return promise;
        });
    });
});
