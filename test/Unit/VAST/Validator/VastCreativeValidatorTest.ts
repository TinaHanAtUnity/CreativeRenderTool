import 'mocha';
import { assert } from 'chai';
import { VastCreativeValidator } from 'VAST/Validators/VastCreativeValidator';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastValidationUtilities } from 'VAST/Validators/VastValidationUtilities';

describe('VastCreativeValidatorTest', () => {
    describe('getErrors', () => {
        it('should return no errors when given a valid creative', () => {
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
            creative.addTrackingEvent('impression', 'http://localhost:3500/brands/14851/unmute?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%');

            const errors = new VastCreativeValidator(creative).getErrors();
            assert.lengthOf(errors, 0);
        });

        it('should return errors when given an invalid creative', () => {
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

            const errors = new VastCreativeValidator(creative).getErrors();
            assert.lengthOf(errors, 2);
            assert.equal(VastValidationUtilities.formatErrors(errors), 'VAST creative trackingEvents contains invalid url("google.com/click")\n    VAST creative trackingEvents contains invalid url("")');
        });
    });
});
