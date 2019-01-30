import { assert } from 'chai';
import 'mocha';
import { VastCreativeStaticResourceCompanionAd } from 'VAST/Models/VastCreativeStaticResourceCompanionAd';

describe('VastCreativeCompanionAd', () => {
    it('should have the correct data', () => {
        const vastCreativeCompanionAd = new VastCreativeStaticResourceCompanionAd('id', 700, 800, 'image/png',  'http://image.com', 'https://url.com/companionClickThroughURLTemplate', { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
        assert.equal(vastCreativeCompanionAd.getId(), 'id');
        assert.equal(vastCreativeCompanionAd.getCreativeType(), 'image/png');
        assert.equal(vastCreativeCompanionAd.getHeight(), 700);
        assert.equal(vastCreativeCompanionAd.getWidth(), 800);
        assert.equal(vastCreativeCompanionAd.getStaticResourceURL(), 'http://image.com');
        assert.equal(vastCreativeCompanionAd.getCompanionClickThroughURLTemplate(), 'https://url.com/companionClickThroughURLTemplate');
        assert.deepEqual(vastCreativeCompanionAd.getTrackingEvents(), { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
    });
});
