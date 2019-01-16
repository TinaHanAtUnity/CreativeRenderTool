import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';

import { TestFixtures } from 'TestHelpers/TestFixtures';
import RootVastClean from 'xml/RootVastClean.xml';
import RootVastDirty from 'xml/RootVastDirty.xml';
import VastCompanionAdXml from 'xml/VastCompanionAd.xml';
import VastCompanionAdWithoutClickThrough from 'xml/VastCompanionAdWithoutClickThrough.xml';
import VastCompanionAdWithoutLandscapeImageXml from 'xml/VastCompanionAdWithoutLandscapeImage.xml';
import VastCompanionAdWithoutPortraitImageXml from 'xml/VastCompanionAdWithoutPortraitImage.xml';

import VastRaw from 'xml/VastRaw.xml';
import VastWithSpaces from 'xml/VastWithSpaces.xml';
import WrappedVast from 'xml/WrappedVast.xml';
import EventTestVast from 'xml/EventTestVast.xml';

describe('VastParserStrict', () => {

    describe('retrieveVast', () => {
        let request: RequestManager;
        let platform: Platform;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

        const vastRaw = VastRaw;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            const wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
        });

        it('should throw when given vast has no Ad element', () => {
            const vastNoAdRaw = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><VAST version="2.0"></VAST>';

            try {
                const vastPromise = TestFixtures.getVastParserStrict().retrieveVast(vastNoAdRaw, core, request);
                vastPromise.then(() => {
                    assert.fail('Should fail when parsing invalid VAST');
                });
            } catch (e) {
                // tslint:disable:no-string-literal
                assert.deepEqual(e.diagnostic['vast'], vastNoAdRaw);
                assert.equal(e.diagnostic['wrapperDepth'], 0);
                // tslint:enable:no-string-literal
            }
        });

        it('should throw an error with appropriate information when there is a problem with parsing a wrapped VAST', () => {
            const mockRequest = sinon.mock(request);

            const rootVast = RootVastClean;
            const wrappedVAST = WrappedVast;

            for (let i = 0; i < 6; i++) {
                mockRequest.expects('get').returns(Promise.resolve({
                    response: wrappedVAST
                }));
            }

            mockRequest.expects('get').returns(Promise.resolve({
                response: 'invalid vast'
            }));

            const vastPromise = TestFixtures.getVastParserStrict().retrieveVast(rootVast, core, request);

            vastPromise.then(() => {
                assert.fail('Should fail when parsing invalid VAST');
            }).catch((e) => {
                // tslint:disable:no-string-literal
                assert.deepEqual(e.diagnostic['vast'], 'invalid vast');
                assert.equal(e.diagnostic['rootWrapperVast'], rootVast);
                assert.equal(e.diagnostic['wrapperDepth'], 7);
                // tslint:enable:no-string-literal
            });
        });
    });

    describe('parseVast', () => {

        describe('success', () => {

            describe('getWrapperURL', () => {

                it('should trim spaces around VASTAdTagURI', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(RootVastDirty);
                    assert.equal(vast.getWrapperURL(), 'http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_1.xml');
                });

            });

            describe('getDuration', () => {

                it('sanity check', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.equal(vast.getDuration(), 15);
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.equal(vast.getDuration(), 15);
                });

            });

            describe('getImpressionUrls', () => {

                it('sanity check', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.deepEqual(vast.getImpressionUrls(), [
                        'http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672',
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881',
                        'http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP',
                        'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772'
                    ]);
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.deepEqual(vast.getImpressionUrls(), [
                        'http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672',
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881',
                        'http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP',
                        'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772'
                    ]);
                });

            });

            describe('getTrackingEventUrls', () => {

                describe('event start', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('start'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('start'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event firstQuartile', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event midpoint', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event thirdQuartile', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event complete', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('complete'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('complete'), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event mute', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('mute'), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('mute'), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });

                describe('event unmute', () => {

                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls('unmute'), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls('unmute'), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
                        ]);
                    });

                });
            });

            describe('getVideoUrl', () => {

                it('sanity check', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                });

            });

            describe('getErrorURLTemplates', () => {

                it('sanity check', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.deepEqual(vast.getErrorURLTemplates(), [
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ]);
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.deepEqual(vast.getErrorURLTemplates(), [
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ]);
                });

            });

            describe('getCompanionClickThroughUrl', () => {
                it('should have correct companion clickthrough url', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastCompanionAdXml);
                    assert.equal(vast.getCompanionClickThroughUrl(), 'https://test.com/companionClickThrough');
                });
            });

            describe('getCompanionCreativeViewTrackingUrls', () => {
                it('should have the correct companion tracking urls', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastCompanionAdXml);
                    assert.deepEqual(vast.getCompanionCreativeViewTrackingUrls(), ['https://test.com/clicktracking', 'https://pixel.mathtag.com/video/img?cb=8541700239826312192&mt_uuid=83d5ca41-447b-4650-a4a1-745fa218e1e1&mt_cmid=1&mt_aid=123&event=companionImpression&mt_id=3203937&mt_exid=brx&mt_adid=152931&mt_stid=111666111']);
                });
            });

            describe('getVideoClickThroughURL', () => {
                it('should have correct click through url', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.equal(vast.getVideoClickThroughURL(), 'http://www.tremorvideo.com');
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.equal(vast.getVideoClickThroughURL(), 'http://www.tremorvideo.com');
                });
            });

            describe('getVideClickTrackingURLs', () => {
                it('should have correct video click trough tracking url', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                    assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
                });

                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
                });
            });

            describe('getCompanionPortraitUrl', () => {
                const tests: {
                    message: string;
                    inputXml: string;
                    expectedValue: string | null;
                }[] = [
                        {
                            message: 'should have correct companion portrait url',
                            inputXml: VastCompanionAdXml,
                            expectedValue: 'http://unity.com/portrait.jpg'
                        },
                        {
                            message: 'should return null if the companion does not have a static resource tag for portrait image',
                            inputXml: VastCompanionAdWithoutPortraitImageXml,
                            expectedValue: null
                        },
                        {
                            message: 'should have correct companion portrait url when no clickthrough url is present',
                            inputXml: VastCompanionAdWithoutLandscapeImageXml,
                            expectedValue: 'http://unity.com/portrait.jpg'
                        }
                    ];

                tests.forEach((test) => {
                    it(test.message, () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                        assert.equal(vast.getCompanionPortraitUrl(), test.expectedValue);
                    });
                });
            });

            describe('Companion Ad', () => {
                describe('getCompanionLandscapeUrl', () => {
                    const tests: {
                        message: string;
                        inputXml: string;
                        expectedValue: string | null;
                    }[] = [
                            {
                                message: 'should have correct companion landscape url',
                                inputXml: VastCompanionAdXml,
                                expectedValue: 'http://unity.com/landscape.jpg'
                            },
                            {
                                message: 'should return null if the companion does not have a static resource tag for landscape image',
                                inputXml: VastCompanionAdWithoutLandscapeImageXml,
                                expectedValue: null
                            },
                            {
                                message: 'should have correct companion landscape url when no clickthrough url is present',
                                inputXml: VastCompanionAdWithoutPortraitImageXml,
                                expectedValue: 'http://unity.com/landscape.jpg'
                            }
                        ];

                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                            assert.equal(vast.getCompanionLandscapeUrl(), test.expectedValue);
                        });
                    });
                });

                describe('vast test xml', () => {
                    const tests: {
                        message: string;
                        inputVast: string;
                    }[] = [
                            {
                                message: 'Should successfully parse EventTestVast.xml',
                                inputVast: EventTestVast
                            },
                            {
                                message: 'Should successfully parse VastCompanionAd.xml',
                                inputVast: VastCompanionAdXml
                            },
                            {
                                message: 'Should successfully parse VastCompanionAdWithoutLandscapeImage.xml',
                                inputVast: VastCompanionAdWithoutLandscapeImageXml
                            },
                            {
                                message: 'Should successfully parse VastCompanionAdWithoutPortraitImage.xml',
                                inputVast: VastCompanionAdWithoutPortraitImageXml
                            },
                            {
                                message: 'Should successfully parse VastRaw.xml',
                                inputVast: VastRaw
                            },
                            {
                                message: 'Should successfully parse VastWithSpaces.xml',
                                inputVast: VastWithSpaces
                            },
                            {
                                message: 'Should successfully parse WrappedVast.xml',
                                inputVast: WrappedVast
                            }
                        ];
                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vastParser = TestFixtures.getVastParserStrict();
                            assert.doesNotThrow(() => {
                                vastParser.parseVast(test.inputVast);
                            });
                        });
                    });
                });
            });
        });

        describe('fail', () => {
            const tests: {
                message: string;
                inputVast: string;
            }[] = [
                    {
                        message: 'Should fail to parse VastCompanionAdWithoutClickThrough.xml',
                        inputVast: VastCompanionAdWithoutClickThrough
                    }
                ];
            tests.forEach((test) => {
                it(test.message, () => {
                    const vastParser = TestFixtures.getVastParserStrict();
                    assert.throws(() => {
                        vastParser.parseVast(test.inputVast);
                    });
                });
            });

            it('should throw when given null', () => {
                assert.throws(() => {
                    TestFixtures.getVastParserStrict().parseVast(null);
                });
            });

            it('should throw when given an object with no data', () => {
                assert.throws(() => {
                    TestFixtures.getVastParserStrict().parseVast('');
                });
            });

            it('should throw when given a vast string with invalid document element', () => {
                assert.throws(() => {
                    assert.isNull(TestFixtures.getVastParserStrict().parseVast(
                        '<?xml version="1.0" encoding="UTF-8" standalone="no"?><foo></foo>'
                    ));
                }, 'VAST xml data is missing');
            });
        });
    });
});