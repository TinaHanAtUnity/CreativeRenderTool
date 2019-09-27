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

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('OpenMeasurementAdViewBuilder', () => {
        let omAdViewBuilder: OpenMeasurementAdViewBuilder;
        let campaign: AdMobCampaign | VastCampaign;
        let deviceInfo: DeviceInfo;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

        describe('Vast Campaign', () => {
            beforeEach(() => {
                backend = TestFixtures.getBackend(platform);
                nativeBridge = TestFixtures.getNativeBridge(platform, backend);
                core = TestFixtures.getCoreApi(nativeBridge);

                if (platform === Platform.ANDROID) {
                    deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
                } else {
                    deviceInfo = TestFixtures.getIosDeviceInfo(core);
                }
                campaign = TestFixtures.getCompanionStaticVastCampaign();
                omAdViewBuilder = new OpenMeasurementAdViewBuilder(campaign, deviceInfo, platform);
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
                            y: 100,
                            width: 150,
                            height: 150
                        },
                        onScreenGeometry: {
                            x: 0,
                            y: 100,
                            width: 150,
                            height: 150,
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

        describe('Admob Campaign', () => {
            //
        });
    });
});
