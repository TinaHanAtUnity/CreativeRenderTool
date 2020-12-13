import { Platform } from 'Core/Constants/Platform';
import { ObstructionReasons } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { OpenMeasurementAdViewBuilder } from 'Ads/Views/OpenMeasurement/OpenMeasurementAdViewBuilder';
import { assert } from 'chai';
import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { AdmobOpenMeasurementController } from 'Ads/Views/OpenMeasurement/AdmobOpenMeasurementController';
import * as sinon from 'sinon';
import { RequestManager } from 'Core/Managers/RequestManager';
import { VastAdUnit } from 'VAST/AdUnits/VastAdUnit';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('OpenMeasurementAdViewBuilder', () => {
        let deviceInfo;
        let backend;
        let nativeBridge;
        let core;
        const initOMAdViewBuilder = (campaign) => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            if (platform === Platform.ANDROID) {
                deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            }
            else {
                deviceInfo = TestFixtures.getIosDeviceInfo(core);
            }
            return new OpenMeasurementAdViewBuilder(campaign);
        };
        describe('Vast Campaign', () => {
            describe('Calculate vast adview', () => {
                let omAdViewBuilder;
                beforeEach(() => {
                    omAdViewBuilder = initOMAdViewBuilder(TestFixtures.getCompanionStaticVastCampaign());
                });
                it('should return the adview in landscape', () => {
                    const calculatedAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 200, 100);
                    const testAdView = {
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
                    const calculatedAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 100, 200);
                    const testAdView = {
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
                    const calculatedAdView = omAdViewBuilder.calculateVastAdView(50, [ObstructionReasons.OBSTRUCTED], false, [obstructionRectangle], 200, 100);
                    const testAdView = {
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
                    const calculatedAdView = omAdViewBuilder.calculateVastAdView(100, [], true, [], 200, 100);
                    const testAdView = {
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
                    const calculatedAdView = omAdViewBuilder.calculateVastAdView(100, [], false, [], 200, 100);
                    if (platform === Platform.ANDROID) {
                        const testAdView = {
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
                    else {
                        const testAdView = {
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
                }
                else {
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
                const testAdView = {
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
                it('should return a backgrounded adview with backgrounded reason', () => {
                    const testAdView = {
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
                it('should return a 100% foregrounded adview', () => {
                    const testAdView = {
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
                it('should return an obstructred foregrounded adview', () => {
                    const testAdView = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50QWRWaWV3QnVpbGRlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQWRzL09wZW5NZWFzdXJlbWVudC9PcGVuTWVhc3VyZW1lbnRBZFZpZXdCdWlsZGVyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFXLGtCQUFrQixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFDakcsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLHdEQUF3RCxDQUFDO0FBS3RHLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTNELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQzlGLE9BQU8sRUFBRSw4QkFBOEIsRUFBRSxNQUFNLDBEQUEwRCxDQUFDO0FBQzFHLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFDO0FBQy9CLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM5RCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDckQsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFN0UsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtRQUMxQyxJQUFJLFVBQXNCLENBQUM7UUFDM0IsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJ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