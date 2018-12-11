import 'mocha';
import { assert } from 'chai';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastLinearCreativeValidator } from 'VAST/Validators/VastLinearCreativeValidator';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastAd } from 'VAST/Models/VastAd';
import { VastAdValidator } from 'VAST/Validators/VastAdValidator';

describe('VastAdValidatorTest', () => {
    describe('getErrors', () => {
        it('Should not give any errors when valid VastAd is given', () => {
            const creative1 = new VastCreativeLinear(
                30,
                10,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)],
                'http://google.com/clickThrough',
                ['http://reddit.com/click', 'https://reddit.com/thridparty/click'],
                ['http://google.com/custom/click'],
                'test');
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const vastAd = new VastAd(
                'vastAdId',
                [creative1, creative1],
                ['http://reddit.com/error', 'https://google.com/error/report?someQuery=test&other=no'],
                ['https://reddit.com/impression', 'https://google.com/impression/report?someQuery=test&other=no'],
                ['https://reddit.com/wrapper/1234?someQuery=test&other=no'],
                [companionAd, companionAd]
            );
            const errors = new VastAdValidator(vastAd).getErrors();
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should give errors when invalid VastAd is given', () => {
            const creative1 = new VastCreativeLinear(
                -1,
                -1,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)],
                'com/clickThrough?someQuery=test&other=no',
                ['htt', 'https://reddit.com/thridparty/click?someQuery=test&other=no'],
                [''],
                'test');
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const vastAd = new VastAd(
                'vastAdId',
                [creative1, creative1],
                ['reddit.com/error', 'omeQuery=test&other=no'],
                ['', 'https://google.com/impression/report?someQuery=test&other=no'],
                [''],
                [companionAd, companionAd]
            );
            const errors = new VastAdValidator(vastAd).getErrors();
            assert.lengthOf(errors, 22, JSON.stringify(errors));
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST VastAd errorURLTemplates contains invalid url("reddit.com/error")\n    VAST VastAd errorURLTemplates contains invalid url("omeQuery=test&other=no")\n    VAST VastAd impressionURLTemplates contains invalid url("")\n    VAST VastAd wrapperURLs contains invalid url("")');
        });
    });
});
