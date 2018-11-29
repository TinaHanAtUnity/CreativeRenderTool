import 'mocha';
import { assert } from 'chai';
import { VastValidator } from 'VAST/Utilities/VastValidator';
import { VastCreativeCompanionAd } from 'VAST/Models/VastCreativeCompanionAd';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastAd } from 'VAST/Models/VastAd';

describe('VastValidatorTest', () => {

    describe('validateCompanionAd', () => {
        it('Should not give any errors when valid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'image/jpg', 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', {
                'click': ['http://google.com', 'https://reddit.com'],
                'impression': ['http://google.com/impression?someQuery=test&other=no']
            });
            const errors = VastValidator.validateCompanionAd(companionAd);
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should not give any errors when creativeType is supported', () => {
            const test = (type: string) => {
                const companionAd = new VastCreativeCompanionAd('testId', 200, 200, type, 'http://google.com?someQuery=test&other=no', 'http://google.com?someQuery=test&other=no', {
                    'click': ['http://google.com', 'https://reddit.com'],
                    'impression': ['http://google.com/impression?someQuery=test&other=no']
                });
                const errors = VastValidator.validateCompanionAd(companionAd);
                assert.lengthOf(errors, 0, JSON.stringify(errors));
            };
            const creativeTypes: string[] = (<any>VastValidator)._supportedCreativeTypes;
            creativeTypes.map((type) => {
                test(type);
            });
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd('testId', 200, 200, 'invalid', 'http://google.com?someQuery=test&other=no', 'invalidClick', {
                'click': ['', 'abc'],
                'impression': ['abc?no=hello']
            });
            const errors = VastValidator.validateCompanionAd(companionAd);
            assert.lengthOf(errors, 5, JSON.stringify(errors));
            assert.equal(VastValidator.formatErrors(errors), 'VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported!\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")');
        });

        it('Should give errors when invalid VastCreativeCompanionAd is given', () => {
            const companionAd = new VastCreativeCompanionAd(null, null, null);
            const errors = VastValidator.validateCompanionAd(companionAd);
            assert.lengthOf(errors, 3, JSON.stringify(errors));
            assert.equal(VastValidator.formatErrors(errors), 'VAST Companion ad(null) is missing required StaticResource Element!\n    VAST Companion ad(null) "StaticResource" is missing required "creativeType" attribute!\n    VAST Companion ad(null) is missing required CompanionClickThrough Element!');
        });
    });

    describe('validateCreative', () => {
        it('Should not give any errors when valid VastCreative is given', () => {
            const creative = new VastCreativeLinear(
                30,
                10,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)],
                'http://google.com/clickThrough?someQuery=test&other=no',
                ['http://reddit.com/click', 'https://reddit.com/thridparty/click?someQuery=test&other=no'],
                ['http://google.com/custom/click?someQuery=test&other=no'],
                'test');
            creative.addTrackingEvent('click', 'http://google.com/click');
            creative.addTrackingEvent('click', 'http://google.com/click2');
            const errors = VastValidator.validateCreative(creative);
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should give errors when invalid VastCreative is given', () => {
            const creative = new VastCreativeLinear(
                30,
                10,
                [new VastMediaFile('', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)],
                '',
                ['reddit.com/click', 'click?someQuery=test&other=no'],
                [''],
                'test');
            creative.addTrackingEvent('click', 'google.com/click');
            creative.addTrackingEvent('click', '');
            creative.addTrackingEvent('impression', 'http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%');
            const errors = VastValidator.validateCreative(creative);
            assert.lengthOf(errors, 2, JSON.stringify(errors));
            assert.equal(VastValidator.formatErrors(errors), 'VAST creative trackingEvents contains invalid url("google.com/click")\n    VAST creative trackingEvents contains invalid url("")');
        });
    });

    describe('validateLinearCreative', () => {
        it('Should not give any errors when valid VastCreativeLinear is given', () => {
            const creative = new VastCreativeLinear(
                30,
                10,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20)],
                'http://google.com/clickThrough?someQuery=test&other=no',
                ['http://reddit.com/click', 'https://reddit.com/thridparty/click?someQuery=test&other=no'],
                ['http://google.com/custom/click?someQuery=test&other=no'],
                'test');
            creative.addTrackingEvent('click', 'http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%');
            const errors = VastValidator.validateLinearCreative(creative);
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should give errors when invalid VastLinearCreative is given', () => {
            const creative = new VastCreativeLinear(
                -1,
                -1,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20), new VastMediaFile()],
                'com/clickThrough?someQuery=test&other=no',
                ['htt', 'https://reddit.com/thridparty/click?someQuery=test&other=no'],
                [''],
                'test');
            const errors = VastValidator.validateLinearCreative(creative);
            assert.lengthOf(errors, 4, JSON.stringify(errors));
            assert.equal(VastValidator.formatErrors(errors), 'VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")');
        });

    });

    describe('validateVastAd', () => {
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
            const errors = VastValidator.validateVastAd(vastAd);
            assert.lengthOf(errors, 0, JSON.stringify(errors));
        });

        it('Should give errors when invalid VastAd is given', () => {
            const creative1 = new VastCreativeLinear(
                -1,
                -1,
                [new VastMediaFile('file://mycoolVideo.mp4', 'video', 'codec', 'mp4', 2000, 100, 5000, 200, 200, 'apiFramework', 20), new VastMediaFile()],
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
            const errors = VastValidator.validateVastAd(vastAd);
            assert.lengthOf(errors, 22, JSON.stringify(errors));
            assert.equal(VastValidator.formatErrors(errors), 'VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST linear creative is missing valid duration\n    VAST linear creative videoClickThroughURLTemplate contains invalid url("com/clickThrough?someQuery=test&other=no")\n    VAST linear creative videoClickTrackingURLTemplates contains invalid url("htt")\n    VAST linear creative videoCustomClickURLTemplates contains invalid url("")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported!\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST Companion ad(testId) "StaticResource" attribute "creativeType=invalid" is not supported!\n    VAST companion ad(testId) companionClickThroughURLTemplate contains invalid url("invalidClick")\n    VAST companion ad trackingEvents contains invalid url("")\n    VAST companion ad trackingEvents contains invalid url("abc")\n    VAST companion ad trackingEvents contains invalid url("abc?no=hello")\n    VAST VastAd errorURLTemplates contains invalid url("reddit.com/error")\n    VAST VastAd errorURLTemplates contains invalid url("omeQuery=test&other=no")\n    VAST VastAd impressionURLTemplates contains invalid url("")\n    VAST VastAd wrapperURLs contains invalid url("")');
        });
    });
});
