import { Platform } from 'Core/Constants/Platform';
import { OpenMeasurementUtilities } from 'Ads/Views/OpenMeasurement/OpenMeasurementUtilities';
import { assert } from 'chai';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('OMUtilities', () => {
        const om = OpenMeasurementUtilities;
        describe('Calculating PercentageInView', () => {
            const percentageInViewTests = [{
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
            const obstructionOverlapTests = [{
                    obstruction: om.createRectangle(0, 0, 517, 367),
                    videoView: om.createRectangle(0, 0, 1280, 768),
                    expectedPercentage: 19.301249186197918,
                    testingCase: 'should calculate video view percentage if full screen landscape video is obstructed'
                },
                {
                    obstruction: om.createRectangle(0, 0, 517, 367),
                    videoView: om.createRectangle(0, 0, 768, 1280),
                    expectedPercentage: 19.301249186197918,
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
        describe('getting metric tags', () => {
            it('should set ssp for ssp value', () => {
                const val = OpenMeasurementUtilities.getDcKeyMetricTag('doubleclickbygoogle.com-ssp');
                assert.equal(val, 'ssp');
            });
            it('should set dsp for ssp value', () => {
                const val = OpenMeasurementUtilities.getDcKeyMetricTag('doubleclickbygoogle.com-dsp');
                assert.equal(val, 'dsp');
            });
            it('should set neut for non-affiliated value', () => {
                const val = OpenMeasurementUtilities.getDcKeyMetricTag('doubleclickbygoogle.com');
                assert.equal(val, 'neut');
            });
            it('should set unkown if vendor string is random', () => {
                const val = OpenMeasurementUtilities.getDcKeyMetricTag('doubleclickbygoogle.com-casdfasfasfd');
                assert.equal(val, 'unknown');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50VXRpbGl0aWVzVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvT3Blbk1lYXN1cmVtZW50L09wZW5NZWFzdXJlbWVudFV0aWxpdGllc1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRTlGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFOUIsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7UUFFekIsTUFBTSxFQUFFLEdBQUcsd0JBQXdCLENBQUM7UUFFcEMsUUFBUSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtZQUMxQyxNQUFNLHFCQUFxQixHQU1yQixDQUFDO29CQUNILFdBQVcsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztvQkFDL0MsU0FBUyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDO29CQUMvQyxlQUFlLEVBQUUsRUFBRSxDQUFDLGVBQWUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7b0JBQ3JELGtCQUFrQixFQUFFLGlCQUFpQjtvQkFDckMsV0FBVyxFQUFFLHdGQUF3RjtpQkFDeEc7Z0JBQ0Q7b0JBQ0ksV0FBVyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO29C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