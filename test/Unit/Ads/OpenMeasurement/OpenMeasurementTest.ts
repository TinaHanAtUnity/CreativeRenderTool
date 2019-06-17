import * as sinon from 'sinon';
import { assert } from 'chai';
import { OpenMeasurement } from 'Ads/Views/OpenMeasurement';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { Placement } from 'Ads/Models/Placement';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { RequestManager } from 'Core/Managers/RequestManager';
import { IAdView, ObstructionReasons } from 'Ads/Views/OMIDEventBridge';
import OMID3p from 'html/omid/omid3p.html';
import { VastAdVerification } from 'VAST/Models/VastAdVerification';
import { VastVerificationResource } from 'VAST/Models/VastVerificationResource';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe(`${platform} OpenMeasurement`, () => {
        const sandbox = sinon.createSandbox();
        let om: OpenMeasurement;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;
        let clientInformation: ClientInfo;
        let campaign: VastCampaign;
        let placement: Placement;
        let deviceInfo: DeviceInfo;
        let request: RequestManager;
        let clock: sinon.SinonFakeTimers;

        describe('For VAST creatives', () => {

            const initWithVastVerifications = (verifications?: VastAdVerification[]) => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);
                clientInformation = TestFixtures.getClientInfo(platform);
                campaign = TestFixtures.getAdVerificationsVastCampaign();
                placement = TestFixtures.getPlacement();
                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                } else {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                }

                request = sinon.createStubInstance(RequestManager);
                if (verifications) {
                    return new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, request, verifications);
                } else {
                    const verification = campaign.getVast().getAd()!.getAdVerifications();
                    return new OpenMeasurement(platform, core, clientInformation, campaign, placement, deviceInfo, request, verification);
                }
            };

            afterEach(() => {
                sandbox.restore();
            });

            describe('rendering', () => {
                beforeEach(() => {
                    om = initWithVastVerifications();
                });

                it('should populate the omid-iframe with omid3p container code', () => {
                    om.render();
                    assert.equal((<HTMLIFrameElement>om.container().querySelector('#omid-iframe')).srcdoc, OMID3p);
                });

                afterEach(() => {
                    om.removeMessageListener();
                });
            });

            describe('injecting dom resources', () => {
                describe('on success', () => {
                    const resource1 = new VastVerificationResource('http://url1.js', 'test1');
                    const resource2 = new VastVerificationResource('http://url2.js', 'test2');
                    const vastAdVerification1 = new VastAdVerification('vendorkey1', [resource1], '', '');
                    const vastAdVerification2 = new VastAdVerification('vendorkey2', [resource2], '', '');
                    const vastAdVerifications = [vastAdVerification1, vastAdVerification2];

                    beforeEach(() => {
                        om = initWithVastVerifications(vastAdVerifications);
                        om.render();
                        om.addMessageListener();
                        sinon.stub(om, 'populateVendorKey');
                        sinon.stub(om, 'injectAsString');
                        return om.injectAdVerifications();
                    });

                    afterEach(() => {
                        om.removeMessageListener();
                    });

                    it('should populate script to dom with multiple passed resources', () => {
                        // need a more reliable way to check the dom
                        sinon.assert.calledTwice(<sinon.SinonStub>om.injectAsString);
                        sinon.assert.calledTwice(<sinon.SinonStub>om.populateVendorKey);
                    });
                });

                describe('on failure', () => {
                    describe('VERIFICATION_NOT_SUPPORTED', () => {
                        const resource1 = new VastVerificationResource('http://url1.html', 'test1');
                        const verificationResources = [resource1];
                        const vastAdVerification = new VastAdVerification('vendorkey1', verificationResources, '', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D');
                        const vastAdVerifications = [vastAdVerification];

                        beforeEach(() => {
                            om = initWithVastVerifications(vastAdVerifications);
                            om.render();
                            om.addMessageListener();
                            om.injectAdVerifications();
                        });

                        afterEach(() => {
                            om.removeMessageListener();
                        });

                        it('should error with VERIFICATION_NOT_SUPPORTED when resource is not a js file', () => {
                            sinon.assert.calledWith(<sinon.SinonSpy>request.get, 'https://ade.googlesyndication.com/errorcode=2');
                        });
                    });

                    describe('ERROR_RESOURCE_LOADING', () => {
                        const resource1 = new VastVerificationResource('htt://url1.js', 'test1');
                        const verificationResources = [resource1];
                        const vastAdVerification = new VastAdVerification('vendorkey1', verificationResources,  '', 'https://ade.googlesyndication.com/errorcode=%5BREASON%5D');
                        const vastAdVerifications = [vastAdVerification];

                        beforeEach(() => {
                            om = initWithVastVerifications(vastAdVerifications);
                            om.render();
                            om.addMessageListener();
                            om.injectAdVerifications();
                        });

                        afterEach(() => {
                            om.removeMessageListener();
                        });

                        it('should error with ERROR_RESOURCE_LOADING when resource is invalid url', () => {
                            sinon.assert.calledWith(<sinon.SinonSpy>request.get, 'https://ade.googlesyndication.com/errorcode=3');
                        });
                    });
                });
            });

            describe('SessionEvents not on OMBridge', () => {
                describe('onEventProcessed', () => {
                    context('sessionStart', () => {
                        beforeEach(() => {
                            sinon.stub(om, 'loaded');
                        });

                        it('should call session begin ad events', () => {
                            om.onEventProcessed('sessionStart');

                            sinon.assert.called(<sinon.SinonSpy>om.loaded);
                        });
                    });

                    context('sessionFinish', () => {
                        beforeEach(() => {
                            sinon.stub(om, 'removeFromViewHieararchy');
                            clock = sinon.useFakeTimers();
                        });
                        it('should remove OM from dom on sessionFinish', () => {

                            om.onEventProcessed('sessionFinish');
                            clock.tick(1000);
                            clock.restore();
                            sinon.assert.called(<sinon.SinonSpy>om.removeFromViewHieararchy);
                        });
                    });
                });
            });

            describe('Calculating Vast AdView', () => {
                it('should return the adview in landscape', () => {
                    const calculatedAdView: IAdView = om.calculateVastAdView(100, [], 200, 100, false, []);
                    const testAdView: IAdView = {
                        percentageInView: 100,
                        geometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100,
                            obstructions: []
                        },
                        measuringElement: false,
                        reasons: []
                    };

                    assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                });

                it('should return the adview in portrait', () => {
                    const calculatedAdView: IAdView = om.calculateVastAdView(100, [], 100, 200, false, []);
                    const testAdView: IAdView = {
                        percentageInView: 100,
                        geometry: {
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 200
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 0,
                            width: 100,
                            height: 200,
                            obstructions: []
                        },
                        measuringElement: false,
                        reasons: []
                    };

                    assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                });

                it('should return new adview with an obstruction', () => {
                    const obstructionRectangle = {
                        x: 0,
                        y: 0,
                        width: 50,
                        height: 50
                    };

                    const calculatedAdView: IAdView = om.calculateVastAdView(50, [ObstructionReasons.OBSTRUCTED], 200, 100, false, [obstructionRectangle]);
                    const testAdView: IAdView = {
                        percentageInView: 50,
                        geometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100,
                            obstructions: [obstructionRectangle]
                        },
                        measuringElement: false,
                        reasons: [ObstructionReasons.OBSTRUCTED]
                    };
                    assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                });

                it('should return the adview with measuringElementAvailable', () => {
                    const calculatedAdView: IAdView = om.calculateVastAdView(100, [], 200, 100, true, []);
                    const testAdView: IAdView = {
                        percentageInView: 100,
                        geometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100,
                            obstructions: []
                        },
                        measuringElement: true,
                        reasons: [],
                        containerGeometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100
                        },
                        onScreenContainerGeometry: {
                            x: 0,
                            y: 0,
                            width: 200,
                            height: 100,
                            obstructions: []
                        }
                    };
                    assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                });
            });
        });
    });
});
