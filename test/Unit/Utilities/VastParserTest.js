System.register(["mocha", "sinon", "chai", "../TestHelpers/TestFixtures", "Utilities/Request", "Managers/WakeUpManager", "Utilities/Observable", "Constants/Platform", "Managers/FocusManager", "xml/VastRaw.xml", "xml/RootVastClean.xml", "xml/WrappedVast.xml", "xml/RootVastDirty.xml", "xml/VastWithSpaces.xml", "xml/VastCompanionAd.xml", "xml/VastCompanionAdWithoutImages.xml", "xml/VastCompanionAdWithoutClickThrough.xml"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, TestFixtures_1, Request_1, WakeUpManager_1, Observable_1, Platform_1, FocusManager_1, VastRaw_xml_1, RootVastClean_xml_1, WrappedVast_xml_1, RootVastDirty_xml_1, VastWithSpaces_xml_1, VastCompanionAd_xml_1, VastCompanionAdWithoutImages_xml_1, VastCompanionAdWithoutClickThrough_xml_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (VastRaw_xml_1_1) {
                VastRaw_xml_1 = VastRaw_xml_1_1;
            },
            function (RootVastClean_xml_1_1) {
                RootVastClean_xml_1 = RootVastClean_xml_1_1;
            },
            function (WrappedVast_xml_1_1) {
                WrappedVast_xml_1 = WrappedVast_xml_1_1;
            },
            function (RootVastDirty_xml_1_1) {
                RootVastDirty_xml_1 = RootVastDirty_xml_1_1;
            },
            function (VastWithSpaces_xml_1_1) {
                VastWithSpaces_xml_1 = VastWithSpaces_xml_1_1;
            },
            function (VastCompanionAd_xml_1_1) {
                VastCompanionAd_xml_1 = VastCompanionAd_xml_1_1;
            },
            function (VastCompanionAdWithoutImages_xml_1_1) {
                VastCompanionAdWithoutImages_xml_1 = VastCompanionAdWithoutImages_xml_1_1;
            },
            function (VastCompanionAdWithoutClickThrough_xml_1_1) {
                VastCompanionAdWithoutClickThrough_xml_1 = VastCompanionAdWithoutClickThrough_xml_1_1;
            }
        ],
        execute: function () {
            describe('VastParser', function () {
                var request;
                var nativeBridge;
                var vastRaw = VastRaw_xml_1.default;
                it('should throw when given null', function () {
                    chai_1.assert.throws(function () {
                        TestFixtures_1.TestFixtures.getVastParser().parseVast(null);
                    });
                });
                it('should throw when given an object with no data', function () {
                    chai_1.assert.throws(function () {
                        TestFixtures_1.TestFixtures.getVastParser().parseVast('');
                    });
                });
                it('should throw when given a vast string with invalid document element', function () {
                    chai_1.assert.throws(function () {
                        chai_1.assert.isNull(TestFixtures_1.TestFixtures.getVastParser().parseVast('<?xml version="1.0" encoding="UTF-8" standalone="no"?><foo></foo>'));
                    });
                });
                it('should have correct data given url encoded data string and additional tracking events', function () {
                    var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(vastRaw);
                    chai_1.assert.equal(1, vast.getAds().length);
                    chai_1.assert.deepEqual(vast.getImpressionUrls(), [
                        'http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672',
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881',
                        'http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP',
                        'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('start'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('complete'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('mute'), [
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('unmute'), [
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                    chai_1.assert.equal(vast.getDuration(), 15);
                    chai_1.assert.deepEqual(vast.getErrorURLTemplates(), [
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ]);
                });
                it('should have correct click trough url', function () {
                    var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(vastRaw);
                    chai_1.assert.equal(vast.getVideoClickThroughURL(), 'www.tremorvideo.com');
                });
                it('should have correct video click trough tracking url', function () {
                    var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(vastRaw);
                    chai_1.assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
                });
                it('should throw when given vast has no Ad element', function () {
                    var vastNoAdRaw = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><VAST version="2.0"></VAST>';
                    try {
                        var vastPromise = TestFixtures_1.TestFixtures.getVastParser().retrieveVast(vastNoAdRaw, nativeBridge, request);
                        vastPromise.then(function () {
                            chai_1.assert.fail('Should fail when parsing invalid VAST');
                        });
                    }
                    catch (e) {
                        // tslint:disable:no-string-literal
                        chai_1.assert.deepEqual(e.diagnostic['vast'], vastNoAdRaw);
                        chai_1.assert.equal(e.diagnostic['wrapperDepth'], 0);
                        // tslint:enable:no-string-literal
                    }
                });
                it('should throw an error with appropriate information when there is a problem with parsing a wrapped VAST', function () {
                    var mockRequest = sinon.mock(request);
                    var rootVast = RootVastClean_xml_1.default;
                    var wrappedVAST = WrappedVast_xml_1.default;
                    for (var i = 0; i < 6; i++) {
                        mockRequest.expects('get').returns(Promise.resolve({
                            response: wrappedVAST
                        }));
                    }
                    mockRequest.expects('get').returns(Promise.resolve({
                        response: 'invalid vast'
                    }));
                    var vastPromise = TestFixtures_1.TestFixtures.getVastParser().retrieveVast(rootVast, nativeBridge, request);
                    vastPromise.then(function () {
                        chai_1.assert.fail('Should fail when parsing invalid VAST');
                    }).catch(function (e) {
                        // tslint:disable:no-string-literal
                        chai_1.assert.deepEqual(e.diagnostic['vast'], 'invalid vast');
                        chai_1.assert.equal(e.diagnostic['rootWrapperVast'], rootVast);
                        chai_1.assert.equal(e.diagnostic['wrapperDepth'], 7);
                        // tslint:enable:no-string-literal
                    });
                });
                it('should trim spaces around VASTAdTagURI', function () {
                    var rootVast = RootVastDirty_xml_1.default;
                    var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(rootVast);
                    chai_1.assert.equal(vast.getWrapperURL(), 'http://demo.tremormedia.com/proddev/vast/vast_wrapper_linear_1.xml');
                });
                it('should have all extra spaces in urls trimmed', function () {
                    var vastWithSpaces = VastWithSpaces_xml_1.default;
                    var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(vastWithSpaces);
                    chai_1.assert.deepEqual(vast.getImpressionUrls(), [
                        'http://dt.videohub2.tv/ssframework/tvuid?a=set&UI=ef20e47b94a670839943ad4d9f933016&ss_rand=1848887672',
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=3&RC=3&AmN=1&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&RvN=1&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&SfF=true&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1479160881',
                        'http://dt.videohub.tv/v1/usync/brx?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/tr?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://dt.videohub.tv/v1/usync/bs?userId=ef20e47b94a670839943ad4d9f933016',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=IMP',
                        'http://b.scorecardresearch.com/b?C1=1&C2=6000001&C3=&C4=&C5=010000&rnd=-607430630152917772'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('start'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=0&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1413711906',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=start&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=25&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=830833129',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=firstQuartile&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=50&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=2023345290',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=midpoint&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=75&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=1253990772',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=thirdQuartile&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('complete'), [
                        'http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&vastrequest=true&EC=7&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&EiN=1&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&RcpF=1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&Eipct=100&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=671283626',
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=complete&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('mute'), [
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=mute&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.deepEqual(vast.getTrackingEventUrls('unmute'), [
                        'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=unmute&vastcrtype=linear&crid=7286756'
                    ]);
                    chai_1.assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
                    chai_1.assert.equal(vast.getDuration(), 15);
                    chai_1.assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
                    chai_1.assert.equal(vast.getVideoClickThroughURL(), 'www.tremorvideo.com');
                    chai_1.assert.deepEqual(vast.getErrorURLTemplates(), [
                        'http://events.tremorhub.com/diag?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&rtype=VAST_ERR&vastError=[ERRORCODE]&sec=false&adcode=80zxm-1018032&seatId=60632&pbid=1358&brid=3056&sid=7997&sdom=demo.app.com&asid=4187&nid=15&lid=33&adom=tremorvideo.com&crid=7286756&aid=10973&rseat=1031'
                    ]);
                    chai_1.assert.deepEqual(vast.getVideoClickTrackingURLs(), ['http://l0.videohub.tv/ssframework/log/log.png?a=logitemaction&ssPD=app.com&AFC=PR_VIDEO&EC=2&RC=3&VI=cf0a3a96deaa32ab3baae57ae79aaadb&admode=preroll&PRI=4finj1hf9j13no1mt2ako8l&dspPrice=3.0&PBI=2704636&rtb=2&UI=ef20e47b94a670839943ad4d9f933016&AVI=419254&Uctry=N%2FA&Ust=N%2FA&AC=4&NI=1031&ADI=7286756&CbC=1&CbF=true&SmC=2&CbM=b4%2F1&Uzip=N%2FA&ssBI=4&RprC=0&sspId=TREMORVIDEO&VcaI=12300&RrC=0&VgI=cf0a3a96deaa32ab3baae57ae79aaadb&CI=2704646&PI=442224&CC=7&Udma=N%2FA&VmC=0&PcI=247281&VscaI=12300&VclF=true&PC=1&ssRnd=624905135', 'http://events.tremorhub.com/evt?rid=5beaaaa404184c0eb68c2bf3b3e6cfaf&pbid=1358&seatid=60632&aid=10973&asid=4187&lid=33&evt=click&vastcrtype=linear&crid=7286756']);
                });
                describe('Companion Ad', function () {
                    it('should have correct companion landscape url', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAd_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://unity.com/landscape.jpg');
                    });
                    it('should have correct companion portrait url', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAd_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://unity.com/portrait.jpg');
                    });
                    it('should have correct companion clickthrough url', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAd_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionClickThroughUrl(), 'https://test.com/companionClickThrough');
                    });
                    it('should return null if the companion does not have a static resource tag for landscape image', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAdWithoutImages_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), null);
                    });
                    it('should return null if the companion does not have a static resource tag for portrait image', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAdWithoutImages_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), null);
                    });
                    it('should have correct companion landscape url when no clickthrough url is present', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAdWithoutClickThrough_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionLandscapeUrl(), 'http://unity.com/landscape.jpg');
                    });
                    it('should have correct companion portrait url when no clickthrough url is present', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAdWithoutClickThrough_xml_1.default);
                        chai_1.assert.equal(vast.getCompanionPortraitUrl(), 'http://unity.com/portrait.jpg');
                    });
                    it('should have the correct companion tracking urls', function () {
                        var vast = TestFixtures_1.TestFixtures.getVastParser().parseVast(VastCompanionAd_xml_1.default);
                        chai_1.assert.deepEqual(vast.getCompanionCreativeViewTrackingUrls(), ['https://test.com/clicktracking', 'https://pixel.mathtag.com/video/img?cb=8541700239826312192&mt_uuid=83d5ca41-447b-4650-a4a1-745fa218e1e1&mt_cmid=1&mt_aid=123&event=companionImpression&mt_id=3203937&mt_exid=brx&mt_adid=152931&mt_stid=111666111']);
                    });
                });
                beforeEach(function () {
                    nativeBridge = {
                        Request: {
                            onComplete: {
                                subscribe: sinon.spy()
                            },
                            onFailed: {
                                subscribe: sinon.spy()
                            }
                        },
                        Sdk: {
                            logInfo: sinon.spy(),
                            logDebug: sinon.spy()
                        },
                        Connectivity: {
                            onConnected: new Observable_1.Observable2()
                        },
                        Broadcast: {
                            onBroadcastAction: new Observable_1.Observable4()
                        },
                        Notification: {
                            onNotification: new Observable_1.Observable2()
                        },
                        Lifecycle: {
                            onActivityResumed: new Observable_1.Observable1(),
                            onActivityPaused: new Observable_1.Observable1(),
                            onActivityDestroyed: new Observable_1.Observable1()
                        },
                        getPlatform: function () {
                            return Platform_1.Platform.TEST;
                        }
                    };
                    var focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJWYXN0UGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBcUJBLFFBQVEsQ0FBQyxZQUFZLEVBQUU7Z0JBQ25CLElBQUksT0FBZ0IsQ0FBQztnQkFDckIsSUFBSSxZQUEwQixDQUFDO2dCQUUvQixJQUFNLE9BQU8sR0FBRyxxQkFBTyxDQUFDO2dCQUV4QixFQUFFLENBQUMsOEJBQThCLEVBQUU7b0JBQy9CLGFBQU0sQ0FBQyxNQUFNLENBQUM7d0JBQ1YsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ2pELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxnREFBZ0QsRUFBRTtvQkFDakQsYUFBTSxDQUFDLE1BQU0sQ0FBQzt3QkFDViwyQkFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDL0MsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLHFFQUFxRSxFQUFFO29CQUN0RSxhQUFNLENBQUMsTUFBTSxDQUFDO3dCQUNWLGFBQU0sQ0FBQyxNQUFNLENBQUMsMkJBQVksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxTQUFTLENBQ2hELG1FQUFtRSxDQUN0RSxDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLHVGQUF1RixFQUFFO29CQUN4RixJQUFNLElBQUksR0FBRywyQkFBWSxDQUFDLGFBQWEsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDN0QsYUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFD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