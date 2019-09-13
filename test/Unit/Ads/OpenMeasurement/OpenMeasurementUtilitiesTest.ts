import { Platform } from 'Core/Constants/Platform';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { IRectangle } from 'Ads/Views/OpenMeasurement/OMIDEventBridge';
import { assert } from 'chai';
import { IAdView, ObstructionReasons } from 'Ads/Views/OpenMeasurement/AdMobOmidEventBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('OMUtilities', () => {

        const om = OpenMeasurementUtilities;

        describe('Calculating PercentageInView', () => {
            const percentageInViewTests: {
                obstruction: IRectangle;
                videoView: IRectangle;
                screenRectangle: IRectangle;
                expectedPercentage: number;
                testingCase: string;
            }[] = [{
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 0, 1080, 1800),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 90.23976337448559,
                testingCase: 'should calculate video view percentage if video is full screen portrait and obstructed'
            },
            {
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 0, 1400, 400),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 43.26089285714287,
                testingCase: 'should calculate video view percentage if video width exceeds screen width and is obstructed'
            },
            {
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 0, 800, 2000),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 78.1413125,
                testingCase: 'should calculate video view percentage with view obstructed and video height larger than viewport'
            },
            {
                obstruction: om.createRectangle(0, 0, 800, 367),
                videoView: om.createRectangle(700, 0, 800, 400),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 36.03125,
                testingCase: 'should calculate video view percentage if video dimensions are smaller than screen dimensions with x offset and obstruction'
            },
            {
                obstruction: om.createRectangle(0, 1400, 800, 367),
                videoView: om.createRectangle(0, 1500, 800, 400),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 8.25,
                testingCase: 'should calculate video view percentage if video dimensions are smaller than screen dimensions with y offset and obstruction'
            },
            {
                obstruction: om.createRectangle(50, 50, 1280, 3000),
                videoView: om.createRectangle(0, 0, 1400, 1800),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 5.615079365079367,
                testingCase: 'should calculate video view percentage if video dimensions are larger than screen dimensions and obstruction is larger than screen'
            },
            {
                obstruction: om.createRectangle(1081, 1801, 1280, 3000),
                videoView: om.createRectangle(0, 0, 1400, 1800),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 77.14285714285715,
                testingCase: 'should calculate video view percentage if video dimensions are larger than screen dimensions and obstruction is not in screen view'
            },
            {
                obstruction: om.createRectangle(0, 0, 0, 0),
                videoView: om.createRectangle(0, 0, 1400, 1800),
                screenRectangle: om.createRectangle(0, 0, 1080, 1800),
                expectedPercentage: 77.14285714285715,
                testingCase: 'should calculate video view percentage if video dimensions are larger than screen dimensions and obstruction is ZeroRect'
            }];
            percentageInViewTests.forEach((t) => {
                it(t.testingCase, () => {
                    const calculatedPercentage = om.calculatePercentageInView(t.videoView, t.obstruction, t.screenRectangle);
                    assert.equal(calculatedPercentage, t.expectedPercentage);
                });
            });
        });

        describe('Calculating ObstructionOverlapPercentage', () => {

            const obstructionOverlapTests: {
                obstruction: IRectangle;
                videoView: IRectangle;
                expectedPercentage: number;
                testingCase: string;
            }[] = [{
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 0, 1280, 768),
                expectedPercentage: 19.301249186197918,
                testingCase: 'should calculate video view percentage if full screen landscape video is obstructed'
            },
            {
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 0, 768, 1280),
                expectedPercentage: 19.301249186197918, //Fix this
                testingCase: 'should calculate video view percentage if full screen portrait video is obstructed'
            },
            {
                obstruction: om.createRectangle(0, 350, 768, 500),
                videoView: om.createRectangle(0, 350, 768, 500),
                expectedPercentage: 100,
                testingCase: 'should calculate video view percentage if sized-to-fit landscape video is fully obstructed'
            },
            {
                obstruction: om.createRectangle(20, 20, 730, 900),
                videoView: om.createRectangle(0, 350, 768, 500),
                expectedPercentage: 95.05208333333334,
                testingCase: 'should calculate video view percentage if sized-to-fit portrait video is mostly obstructed'
            },
            {
                obstruction: om.createRectangle(20, 20, 517, 367),
                videoView: om.createRectangle(0, 350, 768, 500),
                expectedPercentage: 4.981510416666667,
                testingCase: 'should calculate video view percentage if sized-to-fit portrait video is obstructed'
            },
            {
                obstruction: om.createRectangle(0, 0, 517, 367),
                videoView: om.createRectangle(0, 350, 768, 500),
                expectedPercentage: 2.2888020833333336,
                testingCase: 'should calculate video view percentage if sized-to-fit portrait video is partially obstructed'
            },
            {
                obstruction: om.createRectangle(0, 0, 517, 349),
                videoView: om.createRectangle(0, 350, 768, 500),
                expectedPercentage: 0,
                testingCase: 'should calculate overlap percentage as 0 if obstruction does not pass over video view'
            }];

            obstructionOverlapTests.forEach((t) => {
                it(t.testingCase, () => {
                    const calculatedPercentage = om.calculateObstructionOverlapPercentage(t.videoView, t.obstruction);
                    assert.equal(calculatedPercentage, t.expectedPercentage);
                });
            });
        });

        describe('Calculating Vast AdView', () => {
            beforeEach(() => {
                om.VideoViewRectangle = undefined;
            });
            afterEach(() => {
                om.VideoViewRectangle = undefined;
                om.campaign = TestFixtures.getPromoCampaign();
            });

            it('should return the adview in landscape', () => {
                om.campaign = TestFixtures.getCompanionStaticVastCampaign();
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
                om.campaign = TestFixtures.getCompanionStaticVastCampaign();
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
                om.campaign = TestFixtures.getCompanionStaticVastCampaign();
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
                om.campaign = TestFixtures.getCompanionStaticVastCampaign();
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

            it('should return the adview based on videoViewRectangle', () => {
                om.VideoViewRectangle = om.createRectangle(0, 200, 300, 300);
                const calculatedAdView: IAdView = om.calculateVastAdView(100, [], 200, 100, false, []);

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
