import { Platform } from 'Core/Constants/Platform';
import { IAdView, ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import * as sinon from 'sinon';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('OpenMeasurementAdViewBuilder', () => {
        let deviceInfo: DeviceInfo;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

        const initOMAdViewBuilder = (campaign: AdMobCampaign | VastCampaign) => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);

            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            return new OpenMeasurementAdViewBuilder(campaign);
        };

        describe('Vast Campaign', () => {
            describe('Calculate vast adview', () => {
                let omAdViewBuilder: OpenMeasurementAdViewBuilder;
                beforeEach(() => {
                    omAdViewBuilder = initOMAdViewBuilder(TestFixtures.getCompanionStaticVastCampaign());
                });

                it('should return the adview in landscape', () => {
                    const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 200, 100);
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
                    const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 100, 200);
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

                    const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(50, [ObstructionReasons.OBSTRUCTED], false, [obstructionRectangle], 200, 100);
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
                    const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], true, [], 200, 100);
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
                        reasons: []
                    };
                    assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                });

                it('should return the adview based on videoViewRectangle', () => {
                    omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                    const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 200, 100);
                    if (platform === Platform.ANDROID) {
                        const testAdView: IAdView = {
                            percentageInView: 100,
                            geometry: {
                                x: 0,
                                y: 200,
                                width: 300,
                                height: 300
                            },
                            onScreenGeometry: {
                                x: 0,
                                y: 200,
                                width: 300,
                                height: 300,
                                obstructions: []
                            },
                            measuringElement: false,
                            reasons: []
                        };
                        assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                    } else {
                        const testAdView: IAdView = {
                            percentageInView: 100,
                            geometry: {
                                x: 0,
                                y: 200,
                                width: 300,
                                height: 300
                            },
                            onScreenGeometry: {
                                x: 0,
                                y: 200,
                                width: 300,
                                height: 300,
                                obstructions: []
                            },
                            measuringElement: false,
                            reasons: []
                        };
                        assert.equal(JSON.stringify(calculatedAdView), JSON.stringify(testAdView));
                    }
                });
            });
        });

        describe('Admob Campaign', () => {
            const initAdMobOMManager = () => {
                const placement = TestFixtures.getPlacement();
                const clientInformation = TestFixtures.getClientInfo(platform);
                const admobcampaign = sinon.createStubInstance(AdMobCampaign);
                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                } else {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                }
                const request = sinon.createStubInstance(RequestManager);
                const adViewBuilder = sinon.createStubInstance(AdmobOpenMeasurementController);
                const thirdParty = sinon.createStubInstance(ThirdPartyEventManager);

                // TODO: Remove the open measurement controller as a dependency for the adview builder - future refactor
                return new AdmobOpenMeasurementController(platform, core, clientInformation, admobcampaign, placement, deviceInfo, request, adViewBuilder, thirdParty);
            };

            it('should output obstructed adview', () => {
                const reason = ObstructionReasons.OBSTRUCTED;

                const omController = initAdMobOMManager();
                const omAdViewBuilder = initOMAdViewBuilder(new AdMobCampaign(TestFixtures.getAdmobCampaignBaseParams()));
                const admobVideoView = OpenMeasurementUtilities.createRectangle(0, 0, 300, 300);
                sinon.stub(omController, 'getAdmobVideoElementBounds').returns(admobVideoView);

                const rect = OpenMeasurementUtilities.createRectangle(0, 0, 200, 200);
                const testAdView: IAdView = {
                    percentageInView: 55,
                    geometry: {
                        x: 0,
                        y: 0,
                        width: 300,
                        height: 300
                    },
                    onScreenGeometry: {
                        x: 0,
                        y: 0,
                        width: 300,
                        height: 300,
                        obstructions: [{ x: 0, y: 0, width: 200, height: 200 }]
                    },
                    measuringElement: true,
                    reasons: [ObstructionReasons.OBSTRUCTED],
                    containerGeometry: {
                        x: 0,
                        y: 0,
                        width: screen.width,
                        height: screen.height
                    },
                    onScreenContainerGeometry: {
                        x: 0,
                        y: 0,
                        width: screen.width,
                        height: screen.height,
                        obstructions: [{ x: 0, y: 0, width: 200, height: 200 }]
                    }
                };
                const adView = omAdViewBuilder.buildAdmobAdView([reason], omController, rect);
                assert.equal(JSON.stringify(adView), JSON.stringify(testAdView));
            });
        });
        describe('VastCampaign building vast ad view', () => {
            const omAdViewBuilder = initOMAdViewBuilder(TestFixtures.getCompanionStaticVastCampaign());

            beforeEach(() => {
                sinon.stub(deviceInfo, 'getScreenWidth').returns('1080');
                sinon.stub(deviceInfo, 'getScreenHeight').returns('1920');
            });

            describe('backgrounded adview', () => {
                it ('should return a backgrounded adview with backgrounded reason', () => {
                    const testAdView: IAdView = {
                        percentageInView: 0,
                        geometry: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 0,
                            width: 0,
                            height: 0,
                            obstructions: [{ x: 0, y: 0, width: screen.width, height: screen.height }]
                        },
                        measuringElement: true,
                        reasons: [ObstructionReasons.BACKGROUNDED]
                    };

                    const vastadunit = sinon.createStubInstance(VastAdUnit);
                    const adView = omAdViewBuilder.buildVastAdView([ObstructionReasons.BACKGROUNDED]);
                    assert.equal(JSON.stringify(adView), JSON.stringify(testAdView));
                });
            });

            describe('foregrounded adview', () => {
                it ('should return a 100% foregrounded adview', () => {
                    const testAdView: IAdView = {
                        percentageInView: 100,
                        geometry: {
                            x: 0,
                            y: 200,
                            width: 300,
                            height: 300
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 200,
                            width: 300,
                            height: 300,
                            obstructions: []
                        },
                        measuringElement: true,
                        reasons: []
                    };
                    const vastadunit = sinon.createStubInstance(VastAdUnit);
                    omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                    const adView = omAdViewBuilder.buildVastAdView([]);
                    assert.equal(JSON.stringify(adView), JSON.stringify(testAdView));
                });

                it ('should return an obstructred foregrounded adview', () => {
                    const testAdView: IAdView = {
                        percentageInView: 62,
                        geometry: {
                            x: 0,
                            y: 200,
                            width: 600,
                            height: 400
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 200,
                            width: 600,
                            height: 400,
                            obstructions: [{ x: 0, y: 200, width: 300, height: 300 }]
                        },
                        measuringElement: true,
                        reasons: [ObstructionReasons.OBSTRUCTED]
                    };
                    const vastadunit = sinon.createStubInstance(VastAdUnit);
                    const obstructionRect = OpenMeasurementUtilities.createRectangle(0, 200, 300, 300);
                    omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 600, 400));
                    const adView = omAdViewBuilder.buildVastAdView([ObstructionReasons.OBSTRUCTED], obstructionRect);
                    assert.equal(JSON.stringify(adView), JSON.stringify(testAdView));
                });
            });
        });
    });
});
