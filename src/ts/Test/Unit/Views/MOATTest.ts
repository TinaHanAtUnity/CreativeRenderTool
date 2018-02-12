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

// disable all because failing hybrid tests for android devices that dont support html5
xdescribe('MOAT View', () => {

    let nativeBridge: NativeBridge;
    let moat: MOAT;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        moat = new MOAT(nativeBridge);
    });

    // disabled because failing hybrid tests for android devices that dont support html5
    xdescribe('render', () => {

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
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow.addEventListener('message', messageListener);

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

        it('should send the init message', () => {
            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'init', 'Passed in event was not "init"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            return promise;
        });
    });

    describe('triggering video event', () => {
        let iframe: HTMLIFrameElement;
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow.addEventListener('message', messageListener);
            moat.triggerVideoEvent('test', 1);
        });

        it ('should fire the video message', () => {
            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'videoEvent', 'Passed in event was not "videoEvent"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            return promise;
        });
    });

    describe('triggering viewability event', () => {
        let iframe: HTMLIFrameElement;
        let messageListener: sinon.SinonSpy;

        beforeEach(() => {
            moat.render();
            messageListener = sinon.spy();
            iframe = <HTMLIFrameElement>moat.container().querySelector('iframe');
            document.body.appendChild(moat.container());
            iframe.contentWindow.addEventListener('message', messageListener);
            moat.triggerViewabilityEvent('testViewabilityEvent', 'test');
        });

        it ('should fire the viewability message of the specified type', () => {
            const promise = new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        sinon.assert.called(messageListener);
                        const e = messageListener.getCall(0).args[0];
                        assert.equal(e.data.type, 'testViewabilityEvent', 'Passed in event was not "testViewabilityEvent"');
                        resolve();
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            return promise;
        });
    });
});
