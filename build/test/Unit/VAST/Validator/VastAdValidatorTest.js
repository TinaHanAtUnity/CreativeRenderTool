import 'mocha';
import { assert } from 'chai';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastAd } from 'VAST/Models/VastAd';
import { VastAdValidator } from 'VAST/Validators/VastAdValidator';
describe('VastAdValidatorTest', () => {
    describe('getErrors', () => {
        it('Should not give any errors when valid VastAd is given', () => {
            const creative1 = new VastCreativeLinear(30, 10, [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)], 'http://google.com/clickThrough', ['http://reddit.com/click', 'https://reddit.com/thridparty/click'], ['http://google.com/custom/click'], 'test');
            const companionAd = new VastCompanionAdStaticResource('testId', 480, 320, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', [], {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const vastAd = new VastAd('vastAdId', [creative1, creative1], ['http://reddit.com/error', 'https://google.com/error/report?someQuery=test&other=no'], ['https://reddit.com/impression', 'https://google.com/impression/report?someQuery=test&other=no'], ['https://reddit.com/wrapper/1234?someQuery=test&other=no'], [companionAd, companionAd], [], []);
            const errors = new VastAdValidator(vastAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });
        it('Should give errors when invalid VastAd is given', () => {
            const creative1 = new VastCreativeLinear(-1, -1, [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)], 'com/clickThrough?someQuery=test&other=no', ['htt', 'https://reddit.com/thridparty/click?someQuery=test&other=no'], [''], 'test');
            const companionAd = new VastCompanionAdStaticResource('testId', 480, 320, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', [], {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const vastAd = new VastAd('vastAdId', [creative1, creative1], ['reddit.com/error', 'omeQuery=test&other=no'], ['', 'https://google.com/impression/report?someQuery=test&other=no'], [''], [companionAd, companionAd], [], []);
            const errors = new VastAdValidator(vastAd).getErrors();
            assert.lengthOf(errors, 22, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST VastAd errorURLTemplates contains invalid url("reddit.com/error")\n    VAST VastAd errorURLTemplates contains invalid url("omeQuery=test&other=no")\n    VAST VastAd impressionURLTemplates contains invalid url("")\n    VAST VastAd wrapperURLs contains invalid url("")');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEFkVmFsaWRhdG9yVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9WQVNUL1ZhbGlkYXRvci9WYXN0QWRWYWxpZGF0b3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSx5Q0FBeUMsQ0FBQztBQUNsRixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzVDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUVsRSxRQUFRLENBQUMscUJBQXFCLEVBQUUsR0FBRyxFQUFFO0lBQ2pDLFFBQVEsQ0FBQyxXQUFXLEVBQUUsR0FBRyxFQUFFO1FBQ3ZCLEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7WUFDN0QsTUFBTSxTQUFTLEdBQUcsSUFBSSxrQkFBa0IsQ0FDcEMsRUFBRSxFQUNGLEVBQUUsRUFDRixDQUFDLElBQUksYUFBYSxDQUFDLHdCQUF3QixFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQ3JILGdDQUFnQyxFQUNoQyxDQUFDLHlCQUF5QixFQUFFLHFDQUFxQyxDQUFDLEVBQ2xFLENBQUMsZ0NBQWdDLENBQUMsRUFDbEMsTUFBTSxDQUFDLENBQUM7WUFDWixNQUFNLFdBQVcs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