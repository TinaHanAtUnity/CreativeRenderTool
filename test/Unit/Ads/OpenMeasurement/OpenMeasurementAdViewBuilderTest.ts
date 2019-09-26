import { Platform } from 'Core/Constants/Platform';
import { assert } from 'chai';
import { IAdView, ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { Campaign } from 'Ads/Models/Campaign';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { Backend } from 'Backend/Backend';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    xdescribe('OpenMeasurementAdViewBuilder', () => {
        let omAdViewBuilder: OpenMeasurementAdViewBuilder;
        let campaign: Campaign;
        let deviceInfo: DeviceInfo;
        let backend: Backend;
        let nativeBridge: NativeBridge;
        let core: ICoreApi;

        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);

            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            } else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }

            omAdViewBuilder = new OpenMeasurementAdViewBuilder(campaign, deviceInfo, platform);
        });

        xdescribe('Calculating Vast AdView for sdk 3.2 and lower', () => {
            beforeEach(() => {
                // om.VideoViewRectangle = undefined;
            });
            afterEach(() => {
                // om.VideoViewRectangle = undefined;
            });

            it('should return the adview in landscape', () => {
                const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], 200, 100, false, [], TestFixtures.getCompanionStaticVastCampaign());
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
                const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], 100, 200, false, [], TestFixtures.getCompanionStaticVastCampaign());
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

                const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(50, [ObstructionReasons.OBSTRUCTED], 200, 100, false, [obstructionRectangle], TestFixtures.getCompanionStaticVastCampaign());
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
                const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], 200, 100, true, [], TestFixtures.getCompanionStaticVastCampaign());
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
                omAdViewBuilder.VideoViewRectangle = omAdViewBuilder.createRectangle(0, 200, 300, 300);
                const calculatedAdView: IAdView = omAdViewBuilder.calculateVastAdView(100, [], 200, 100, false, [], TestFixtures.getCompanionStaticVastCampaign());

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
            });
        });
    });
});
