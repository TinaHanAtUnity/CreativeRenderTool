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
            return new OpenMeasurementAdViewBuilder(campaign, deviceInfo, platform);
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
                return new AdmobOpenMeasurementController(platform, core, clientInformation, admobcampaign, placement, deviceInfo, request, adViewBuilder);
            };

            it('should output obstructed adview', () => {
                const reason = ObstructionReasons.OBSTRUCTED;

                const omController = initAdMobOMManager();
                const omAdViewBuilder = initOMAdViewBuilder(new AdMobCampaign(TestFixtures.getAdmobCampaignBaseParams()));
                const admobVideoView = OpenMeasurementUtilities.createRectangle(0, 0, 300, 300);
                sinon.stub(omController, 'getAdmobVideoElementBounds').returns(admobVideoView);

                const rect = OpenMeasurementUtilities.createRectangle(0, 0, 200, 200);
                const testAdView: IAdView = {
                    percentageInView: platform === Platform.ANDROID ? 49.8888888888889 : 55.55555555555556,
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
                        obstructions: [{x: 0, y: 0, width: 200, height: 200}]
                    },
                    measuringElement: true,
                    reasons: [ObstructionReasons.OBSTRUCTED],
                    containerGeometry: {
                        x: 0,
                        y: 0,
                        width: platform === Platform.ANDROID ? 283 : 567,
                        height: platform === Platform.ANDROID ? 617 : 1234
                    },
                    onScreenContainerGeometry: {
                        x: 0,
                        y: 0,
                        width: platform === Platform.ANDROID ? 283 : 567,
                        height: platform === Platform.ANDROID ? 617 : 1234,
                        obstructions: [{x: 0, y: 0, width: 200, height: 200}]
                    }
                };
                return omAdViewBuilder.buildAdmobAdView([reason], omController, rect).then((adview) => {
                    assert.equal(JSON.stringify(adview), JSON.stringify(testAdView));
                });
            });
        });
        xdescribe('VastCampaign building vast ad view', () => {
            const omAdViewBuilder = initOMAdViewBuilder(TestFixtures.getCompanionStaticVastCampaign());
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getScreenWidth').returns('1080');
                sinon.stub(deviceInfo, 'getScreenHeight').returns('1920');
            });

            const testAdView: IAdView = {
                percentageInView: platform === Platform.ANDROID ? 49.8888888888889 : 55.55555555555556,
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
                    obstructions: [{x: 0, y: 0, width: 200, height: 200}]
                },
                measuringElement: true,
                reasons: [ObstructionReasons.OBSTRUCTED],
                containerGeometry: {
                    x: 0,
                    y: 0,
                    width: platform === Platform.ANDROID ? 283 : 567,
                    height: platform === Platform.ANDROID ? 617 : 1234
                },
                onScreenContainerGeometry: {
                    x: 0,
                    y: 0,
                    width: platform === Platform.ANDROID ? 283 : 567,
                    height: platform === Platform.ANDROID ? 617 : 1234,
                    obstructions: [{x: 0, y: 0, width: 200, height: 200}]
                }
            };

            describe('backgrounded adview', () => {
                if (platform === Platform.ANDROID) {
                    it ('should return a backgrounded adview with backgrounded reason', () => {
                        omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                        const vastadunit = sinon.createStubInstance(VastAdUnit);
                        omAdViewBuilder.buildVastAdView([ObstructionReasons.BACKGROUNDED], vastadunit).then((adview) => {
                            assert.equal(JSON.stringify(adview), JSON.stringify(testAdView));
                        });
                    });
                }
                if (platform === Platform.IOS) {
                    it ('should return a backgrounded adview with backgrounded reason', () => {
                        omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                        const vastadunit = sinon.createStubInstance(VastAdUnit);
                        omAdViewBuilder.buildVastAdView([ObstructionReasons.BACKGROUNDED], vastadunit).then((adview) => {
                            assert.equal(JSON.stringify(adview), JSON.stringify(testAdView));
                        });
                    });
                }
            });
            describe('foregrounded adview', () => {
                if (platform === Platform.ANDROID) {
                    it ('should return a backgrounded adview with backgrounded reason', () => {
                        omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                        const vastadunit = sinon.createStubInstance(VastAdUnit);
                        sinon.stub(vastadunit, 'getVideoViewRectangle').returns([1, 1, 200, 200]);
                        omAdViewBuilder.buildVastAdView([], vastadunit).then((adview) => {
                            assert.equal(JSON.stringify(adview), JSON.stringify(testAdView));
                        });
                    });
                }
                if (platform === Platform.IOS) {
                    it ('should return a backgrounded adview with backgrounded reason', () => {
                        omAdViewBuilder.setVideoView(OpenMeasurementUtilities.createRectangle(0, 200, 300, 300));
                        const vastadunit = sinon.createStubInstance(VastAdUnit);
                        sinon.stub(vastadunit, 'getVideoViewRectangle').returns([1, 1, 200, 200]);
                        omAdViewBuilder.buildVastAdView([], vastadunit).then((adview) => {
                            assert.equal(JSON.stringify(adview), JSON.stringify(testAdView));
                        });
                    });
                }
            });
        });
    });
});
