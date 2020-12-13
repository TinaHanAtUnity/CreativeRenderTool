import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import 'mocha';
import * as sinon from 'sinon';
import RootVastClean from 'xml/RootVastClean.xml';
import RootVastDirty from 'xml/RootVastDirty.xml';
import VastCompanionAdXml from 'xml/VastCompanionAd.xml';
import VastCompanionAdSmallXml from 'xml/VastCompanionAdSmall.xml';
import VastCompanionAdWithoutLandscapeImageXml from 'xml/VastCompanionAdWithoutLandscapeImage.xml';
import VastCompanionAdWithoutPortraitImageXml from 'xml/VastCompanionAdWithoutPortraitImage.xml';
import VastCompanionAdWithRelativeUrlsXml from 'xml/VastCompanionAdWithRelativeUrls.xml';
import VastCompanionAdIFrameXml from 'xml/VastCompanionAdIFrame.xml';
import VastCompanionAdHTMLXml from 'xml/VastCompanionAdHTML.xml';
import VastStaticResourceWithTypeInsteadOfCreativeTypeXml from 'xml/VastStaticResourceWithTypeInsteadOfCreativeType.xml';
import VastRaw from 'xml/VastRaw.xml';
import VastWithSpaces from 'xml/VastWithSpaces.xml';
import WrappedVast from 'xml/WrappedVast.xml';
import WrappedVastIAS from 'xml/WrappedVastIAS.xml';
import WrappedVASTUrlEncoded from 'xml/WrappedVASTUrlEncoded.xml';
import EventTestVast from 'xml/EventTestVast.xml';
import VastAboutBlank from 'xml/VastAboutBlank.xml';
import VastAdVerificationAsExtension from 'xml/VastWithExtensionAdVerification.xml';
import VastAdVerificationAsStandAlone from 'xml/VastWithAdVerification4_1.xml';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { TrackingEvent } from 'Ads/Managers/ThirdPartyEventManager';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('VastParserStrict', () => {
    describe('retrieveVast', () => {
        let request;
        let platform;
        let backend;
        let nativeBridge;
        let core;
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            const wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        });
        it('should throw when given vast has no Ad element', () => {
            const vastNoAdRaw = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><VAST version="2.0"></VAST>';
            try {
                const vastPromise = TestFixtures.getVastParserStrict().retrieveVast(vastNoAdRaw, core, request);
                vastPromise.then(() => {
                    assert.fail('Should fail when parsing invalid VAST');
                });
            }
            catch (e) {
                // tslint:disable:no-string-literal
                assert.deepEqual(e.errorData['vast'], vastNoAdRaw);
                assert.equal(e.errorData['wrapperDepth'], 0);
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
        it('should decode encoded IAS urls', () => {
            const wrappedVAST = WrappedVASTUrlEncoded;
            const getStub = sinon.stub(request, 'get').resolves();
            TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request);
            const newUrl = 'https://vastpixel3.adsafeprotected.com/ddm/pfadx/N755990.157757SKYITALIAS.R.L._GM/B22442959.242394195;sz=0x0;ord=123;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;dcmt=text/xml;dc_sdk_apis=123;dc_omid_p=123';
            const theUrl = getStub.getCall(0).args[0];
            assert.equal(newUrl, theUrl);
        });
        it('should no-op already decoded urls', () => {
            const wrappedVAST = WrappedVast;
            sinon.stub(request, 'get').resolves();
            TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request);
            const newUrl = 'http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_2.xml';
            sinon.assert.calledWith(request.get, newUrl, [], { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false });
        });
        context('for IAS', () => {
            it('should replace adsafeprotected urls with vastpixel3, OMIDP macro and include correct header for IAS', () => {
                const wrappedVAST = WrappedVastIAS;
                sinon.stub(request, 'get').resolves();
                const headers = [['X-Device-Type', 'unity'], ['User-Agent', navigator.userAgent]];
                const newUrl = 'https://vastpixel3.adsafeprotected.com/vast/fwjsvid/st/291274/36617114/skeleton.xml?scoot=doot;omid_p=Unity3d/1.2.10';
                TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request);
                sinon.assert.calledWith(request.get, newUrl, headers, { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false });
            });
            it('should splice bundleID as first url query param', () => {
                const wrappedVAST = WrappedVastIAS;
                sinon.stub(request, 'get').resolves();
                const headers = [['X-Device-Type', 'unity'], ['User-Agent', navigator.userAgent]];
                const newUrl = 'https://vastpixel3.adsafeprotected.com/vast/fwjsvid/st/291274/36617114/skeleton.xml?bundleId=booyah&scoot=doot;omid_p=Unity3d/1.2.10';
                TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request, 'booyah');
                sinon.assert.calledWith(request.get, newUrl, headers, { retries: 2, retryDelay: 10000, followRedirects: true, retryWithConnectionEvents: false });
            });
            it('should create a Vast tag that is Publica when Publica check is true', () => {
                const wrappedVAST = WrappedVastIAS;
                sinon.stub(request, 'get').returns(Promise.resolve({
                    response: VastCompanionAdXml
                }));
                const isPublica = true;
                return TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request, 'booyah', isPublica).then((vast) => {
                    assert.equal(vast.isPublicaTag(), true);
                });
            });
            it('should create a Vast tag that includes all AdVerification tags including those from nested vast tags', () => {
                const wrappedVAST = WrappedVastIAS;
                sinon.stub(request, 'get').returns(Promise.resolve({
                    response: VastAdVerificationAsStandAlone
                }));
                const isPublica = true;
                return TestFixtures.getVastParserStrict().retrieveVast(wrappedVAST, core, request, 'booyah', isPublica).then((vast) => {
                    const verifications = vast.getAdVerifications();
                    assert.equal(verifications.length, 2);
                    assert.equal(verifications[0].getVerificationVendor(), 'doubleverify.com-omid');
                    assert.equal(verifications[1].getVerificationVendor(), 'IAS');
                });
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
                it('should ignore about:blank', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastAboutBlank);
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
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.START), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.START), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event firstQuartile', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.FIRST_QUARTILE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event midpoint', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MIDPOINT), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MIDPOINT), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event thirdQuartile', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.THIRD_QUARTILE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event complete', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.COMPLETE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.COMPLETE), [
                            'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event mute', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MUTE), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.MUTE), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                });
                describe('event unmute', () => {
                    it('sanity check', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastRaw);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.UNMUTE), [
                            'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
                        ]);
                    });
                    it('should have spaces trimmed', () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                        assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.UNMUTE), [
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
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=%5BERRORCODE%5D&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ], `Got ${JSON.stringify(vast.getErrorURLTemplates())}`);
                });
                it('should have spaces trimmed', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastWithSpaces);
                    assert.deepEqual(vast.getErrorURLTemplates(), [
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=%5BERRORCODE%5D&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ], `Got ${JSON.stringify(vast.getErrorURLTemplates())}`);
                });
            });
            describe('getCompanionClickThroughUrl', () => {
                it('should have correct companion clickthrough url', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastCompanionAdXml);
                    assert.equal(vast.getCompanionClickThroughUrl(), 'https://test.com/companionClickThrough');
                });
            });
            describe('getCompanionClickTrackingUrls', () => {
                it('should have correct companion clickTracking url', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastCompanionAdXml);
                    assert.deepEqual(vast.getCompanionClickTrackingUrls(), ['https://test.com/companionClickTracking']);
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
            describe('getStaticCompanionPortraitUrl', () => {
                const tests = [
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
                    },
                    {
                        message: 'should have companion portrait url with https when using relative path in static resource',
                        inputXml: VastCompanionAdWithRelativeUrlsXml,
                        expectedValue: 'https://unity.com/portrait.jpg'
                    }
                ];
                tests.forEach((test) => {
                    it(test.message, () => {
                        const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                        assert.equal(vast.getStaticCompanionPortraitUrl(), test.expectedValue);
                    });
                });
            });
            describe('Decoding', () => {
                it('should leave encoded urls alone except for encoded protocols should be decoded', () => {
                    const vast = TestFixtures.getVastParserStrict().parseVast(VastCompanionAdXml);
                    assert.deepEqual(vast.getTrackingEventUrls(TrackingEvent.START), [
                        'https://pixel.mathtag.com/video/img?cb=8541700239826312192&mt_aid=123&event=vst&mt_id=3203937&mt_exid=brx&mt_adid=152931&mt_stid=111666111',
                        'https://nym1-ib.adnxs.com/it?referrer=play.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.episodeinteractive.android.catalog&e=wqT_3QK2CaC2BAAAAwDWAAUBCKLuy98FEPur583z1P7wFBj2lqKwnafJ5VcqNgkAAAECCDBAEQEHNAAAMEAZAAAAwMxMMEAhERIAKREJADERCagw6uHrBTi5OUC5OUgCUNjKszpYr6NPYABo2KtzeKm_BIABAYoBA1VTRJIBAQbwb5gBAaABAagBAbABALgBA8ABBMgBAtABCdgBAOABAPABAIoCWnVmKCdhJywgMjkzMzE2NywgMTU0MjY0OTYzNCk7dWYoJ3InLCAxMjI0Nzk5NjAsIDE1NDI2NDk2MzQpO3VmKCdjJywgMjU0MDA5Njk2PQDwjZICjQIhSVRmamFRaUpyWTRNRU5qS3N6b1lBQ0N2bzA4d0FEZ0FRQVJJdVRsUTZ1SHJCVmdBWUk0RGFBQndPSGlNR1lBQk9JZ0JqQm1RQVFHWUFRR2dBUUdvQVFPd0FRQzVBU21MaUlNQUFEQkF3UUVwaTRpREFBQXdRTWtCU2dJVzdqVGJ6al9aQVFBQUEBAyRQQV80QUVBOVFFAQ6QQWdBSUFpQUtXdkFhSUFwZThCcEFDQXBnQ0FLQUNBS2dDQUxVQwUpCEwwQwUI8EhNQUNBTWdDQU9BQ0FPZ0NBUGdDQUlBREFaQURBSmdEQWFnRGlhMk9ETG9EQ1U1WlRUSTZNell5TnVBRDFRRS6aAmEheWd5dVJnNhABJHI2TlBJQVFvQUQJmABBAcRQRG9KVGxsTk1qb3pOakkyUU5VQlNRARsEQUEByABVEQwMQUFBVx0M9JoB2AK0rQHgAv3gOeoCTHBsYXkuZ29vZ2xlLmNvbS9zdG9yZS9hcHBzL2RldGFpbHM_aWQ9Y29tLmVwaXNvZGVpbnRlcmFjdGl2ZS5hbmRyb2lkLmNhdGFsb2eAAwCIAwGQAwCYAxSgAwGqAwDAA-CoAcgDANIDKAgAEiQ1MmYyZDcwNS03MWU3LTQ0NTItOThhMS1kYjE5MWVjY2M2ZTXSAywIAhIoNWQ1NGJkNWVkOTllMzMyMmVlYjNiZTRlMGI0MWQzMGNlNWFmN2ZjNdIDJAgEEiAxMzQwNDM1MmFhYzVkMGFhMmVmMWE3ZDBlYmI3OGEwZtIDKAgKEiQ4M2M5NDZmMi0wNmQ1LTRlM2QtYTBlMC1mNmI2NmNhMjA1NTfYA8G8V-ADAOgDAvgDAIAEAJIECS9vcGVucnRiMpgEAKIEDjk5LjIwMy4xMjguMTExqASBiA6yBA4IARAAGNAFIIAKMAA4ArgEAMAEAMgEANIEDjczNTMjTllNMjozNjI22gQCCADgBADwBNjKszr6BBIJAAAAIIc2RUARYeAY989UwIIFJpZzASCIBQGYBQCgBf8RAXwBqgUWRHEyOHlqeHpXa05MbTY1UHgwNnppdsAFAMkFAAUBEPA_0gUJAXYFAZzYBQHgBQHwBdz4J_oFBAgAEACQBgGYBgC4BgDBBgAAAAAAAPA_yAYA&s=e36f70042d51515729e9a8355f5ef410e93be582',
                        'http://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz',
                        'https://ad.doubleclick.net%2Fddm%2Fpfadx%2FN7088.284566THETRADEDESK%2FB21520108.235840185%3Bsz'
                    ]);
                });
            });
            describe('StaticResource Companion Ad', () => {
                describe('getStaticCompanionLandscapeUrl from StaticResource type CompanionAd', () => {
                    const tests = [
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
                        },
                        {
                            message: 'should have companion landscape url with https when using relative path in static resource',
                            inputXml: VastCompanionAdWithRelativeUrlsXml,
                            expectedValue: 'https://unity.com/landscape.jpg'
                        }
                    ];
                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                            assert.equal(vast.getStaticCompanionLandscapeUrl(), test.expectedValue);
                        });
                    });
                });
                describe('vast test xml', () => {
                    const tests = [
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
                        },
                        {
                            message: 'Should successfully parse Vast StaticResource with "type" attribute instead of "CreativeType"',
                            inputVast: VastStaticResourceWithTypeInsteadOfCreativeTypeXml
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
            // enable these tests if vast iframe abgroup is enabled
            xdescribe('IFrameResource Companion Ad', () => {
                describe('getIframeResourceURL from IFrameResource type CompanionAd', () => {
                    const tests = [
                        {
                            message: 'should have correct iframeResourceURL',
                            inputXml: VastCompanionAdIFrameXml,
                            expectedValue: 'https://search.spotxchange.com/banner?=iframe'
                        },
                        {
                            message: 'should return null if the companion does not have a valid iframeResource Url',
                            inputXml: VastCompanionAdXml,
                            expectedValue: null
                        }
                    ];
                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                            assert.equal(vast.getIframeCompanionResourceUrl(), test.expectedValue);
                        });
                    });
                });
            });
            // enable these tests if vast html abgroup is enabled
            xdescribe('HTMLResource Companion Ad', () => {
                describe('getHtmlCompanionResourceContent from HTMLResource type CompanionAd', () => {
                    const tests = [
                        {
                            message: 'should have correct html companion content',
                            inputXml: VastCompanionAdHTMLXml,
                            expectedValue: '<a href="https://search.spotxchange.com/click?_a=235398" border="0" target="_blank" title="MOBILE Segment Bundle"><img style="border:0; width:300px; height:250px;" src="https://search.spotxchange.com/banner" alt="MOBILE Segment Bundle" /></a>'
                        },
                        {
                            message: 'should return null if the companion does not have a valid htmlResource content',
                            inputXml: VastCompanionAdXml,
                            expectedValue: null
                        }
                    ];
                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                            assert.equal(vast.getHtmlCompanionResourceContent(), test.expectedValue);
                        });
                    });
                });
            });
            // enable these tests if vast endcard abgroup is enabled
            xdescribe('Unsupported Companion Ad', () => {
                describe('add into unsupported companion ads list for unsupported companion ads', () => {
                    const tests = [
                        {
                            message: 'should have not added into unsupported companion ads for valid companion ads',
                            inputXml: VastCompanionAdXml,
                            expectedVal: 0
                        },
                        {
                            message: 'should have not added into unsupported companion ads for iframeResource',
                            inputXml: VastCompanionAdIFrameXml,
                            expectedVal: 0
                        },
                        {
                            message: 'should have not added into unsupported companion ads for iframeResource and htmlResource',
                            inputXml: VastCompanionAdHTMLXml,
                            expectedVal: 0
                        },
                        {
                            message: 'should have added into unsupported companion ads for static end card not meeting minimum size requirement',
                            inputXml: VastCompanionAdSmallXml,
                            expectedVal: 1
                        }
                    ];
                    tests.forEach((test) => {
                        it(test.message, () => {
                            const vast = TestFixtures.getVastParserStrict().parseVast(test.inputXml);
                            assert.equal(vast.getAd().getUnsupportedCompanionAds().length, test.expectedVal);
                        });
                    });
                });
            });
            describe('AdVerification', () => {
                let vast;
                let vastAdVerifications;
                let vastAdVerification;
                describe('ad verification as standalone for VAST 4.1', () => {
                    beforeEach(() => {
                        vast = TestFixtures.getVastParserStrict().parseVast(VastAdVerificationAsStandAlone);
                        vastAdVerifications = vast.getAdVerifications();
                        vastAdVerification = vastAdVerifications[0];
                    });
                    it('Should have one AdVerification element grabbed from stand alone AdVerification tag', () => {
                        assert.equal(vastAdVerifications.length, 1);
                    });
                    it('Should parse verificaiton vendor attribute', () => {
                        assert.equal(vastAdVerification.getVerificationVendor(), 'doubleverify.com-omid');
                    });
                    it('Should match expected verification parameters', () => {
                        assert.equal(vastAdVerification.getVerificationParameters(), 'tagtype=video&dvtagver=6.1.src&ctx=10733345&cmp=69189&amp;sid=2928&amp;plc=1229669&amp;adsrv=118&amp;dup=1lte9o1553552890042');
                    });
                    it('Should match verification tracking url', () => {
                        assert.equal(vastAdVerification.getVerificationTrackingEvent(), 'https://tps.doubleverify.com/visit.jpg?ctx=818052&cmp=DV064005&sid=123&plc=verificationRejection&advid=818053&adsrv=118&tagtype=video&dvtagver=6.1.img&verr=%5BREASON%5D&dup=1lte9o1553552890042');
                    });
                    it('Should have java script resource url', () => {
                        const javaResource = vastAdVerification.getVerficationResources()[0];
                        assert.equal(javaResource.getResourceUrl(), 'https://cdn.doubleverify.com/dvtp_src.js');
                    });
                });
                describe('ad verification as extension for VAST 3.x and under as Extension', () => {
                    beforeEach(() => {
                        vast = TestFixtures.getVastParserStrict().parseVast(VastAdVerificationAsExtension);
                        vastAdVerifications = vast.getAdVerifications();
                        vastAdVerification = vastAdVerifications[0];
                    });
                    it('Should have one AdVerification element grabbed from stand alone AdVerification tag', () => {
                        assert.equal(vastAdVerifications.length, 1);
                    });
                    it('Should parse verificaiton vendor attribute', () => {
                        assert.equal(vastAdVerification.getVerificationVendor(), 'doubleclickbygoogle.com-dsp');
                    });
                    it('Should match expected verification parameters', () => {
                        assert.equal(vastAdVerification.getVerificationParameters(), '{"tracking_events":{"complete":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210005;"],"firstquartile":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210002;"],"fullscreen":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210009;"],"fully_viewable_audible_half_duration_impression":["https://pagead2.googlesyndication.com/pcs/activeview?xai=AKAOjsuXk0QTK2y8ob8J76waywIhg3Z5ZrhC3C1XAiINoaGF11aC2jM_OurJFYm16jg4M0WfD-HYMzEYaI8ARe20&sig=Cg0ArKJSzJHmkZ_iMsAhEAE&id=lidarv&acvw=[VIEWABILITY]&gv=[GOOGLE_VIEWABILITY]","https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=200102;"],"measurable_impression":["https://pagead2.googlesyndication.com/pcs/activeview?xai=AKAOjsuXk0QTK2y8ob8J76waywIhg3Z5ZrhC3C1XAiINoaGF11aC2jM_OurJFYm16jg4M0WfD-HYMzEYaI8ARe20&sig=Cg0ArKJSzJHmkZ_iMsAhEAE&id=lidarv&acvw=[VIEWABILITY]&gv=[GOOGLE_VIEWABILITY]&avm=1","https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=200101;"],"midpoint":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210003;"],"mute":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210006;"],"pause":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210008;"],"start":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];dc_rfl=[URL_SIGNALS];ecn1=1;etm1=0;eid1=210001;"],"thirdquartile":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210004;"],"unmute":["https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=210007;"],"viewable_impression":["https://pagead2.googlesyndication.com/pcs/activeview?xai=AKAOjsuXk0QTK2y8ob8J76waywIhg3Z5ZrhC3C1XAiINoaGF11aC2jM_OurJFYm16jg4M0WfD-HYMzEYaI8ARe20&sig=Cg0ArKJSzJHmkZ_iMsAhEAE&id=lidarv&acvw=[VIEWABILITY]&gv=[GOOGLE_VIEWABILITY]","https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;acvw=[VIEWABILITY];gv=[GOOGLE_VIEWABILITY];ecn1=1;etm1=0;eid1=200000;"]}}');
                    });
                    it('Should match verification tracking url', () => {
                        assert.equal(vastAdVerification.getVerificationTrackingEvent(), 'https://ade.googlesyndication.com/ddm/activity/dc_oe=ChMI_fCpv9fh4AIVxYRiCh0PFAIcEAAYACDsur8c;met=1;ecn1=1;etm1=0;eid1=210014;errorcode=%5BREASON%5D');
                    });
                    it('Should have java script resource url', () => {
                        const javaResource = vastAdVerification.getVerficationResources()[0];
                        assert.equal(javaResource.getResourceUrl(), 'https://www.googletagservices.com/activeview/js/current/lidar_video_dsp.js');
                    });
                });
            });
        });
        describe('fail', () => {
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
                    assert.isNull(TestFixtures.getVastParserStrict().parseVast('<?xml version="1.0" encoding="UTF-8" standalone="no"?><foo></foo>'));
                }, VastErrorInfo.errorMap[VastErrorCode.XML_PARSER_ERROR]);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFBhcnNlclN0cmljdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0UGFyc2VyU3RyaWN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRTVELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxhQUFhLE1BQU0sdUJBQXVCLENBQUM7QUFDbEQsT0FBTyxrQkFBa0IsTUFBTSx5QkFBeUIsQ0FBQztBQUN6RCxPQUFPLHVCQUF1QixNQUFNLDhCQUE4QixDQUFDO0FBQ25FLE9BQU8sdUNBQXVDLE1BQU0sOENBQThDLENBQUM7QUFDbkcsT0FBTyxzQ0FBc0MsTUFBTSw2Q0FBNkMsQ0FBQztBQUNqRyxPQUFPLGtDQUFrQyxNQUFNLHlDQUF5QyxDQUFDO0FBQ3pGLE9BQU8sd0JBQXdCLE1BQU0sK0JBQStCLENBQUM7QUFDckUsT0FBTyxzQkFBc0IsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLGtEQUFrRCxNQUFNLHlEQUF5RCxDQUFDO0FBQ3pILE9BQU8sT0FBTyxNQUFNLGlCQUFpQixDQUFDO0FBQ3RDLE9BQU8sY0FBYyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8sV0FBVyxNQUFNLHFCQUFxQixDQUFDO0FBQzlDLE9BQU8sY0FBYyxNQUFNLHdCQUF3QixDQUFDO0FBQ3BELE9BQU8scUJBQXFCLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxh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