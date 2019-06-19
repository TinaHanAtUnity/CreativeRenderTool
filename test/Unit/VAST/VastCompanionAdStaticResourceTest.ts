import { assert } from 'chai';
import 'mocha';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';

describe('VastCompanionAdStaticResource', () => {
    it('should have the correct data', () => {
        const vastCreativeCompanionAd = new VastCompanionAdStaticResource('id', 700, 800, 'image/png', 'http://image.com', 'https://url.com/companionClickThroughURLTemplate', ['https://url.com/companionClickTrackingURLTemplate1', 'https://url.com/companionClickTrackingURLTemplate2'], { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
        assert.equal(vastCreativeCompanionAd.getId(), 'id');
        assert.equal(vastCreativeCompanionAd.getCreativeType(), 'image/png');
        assert.equal(vastCreativeCompanionAd.getHeight(), 700);
        assert.equal(vastCreativeCompanionAd.getWidth(), 800);
        assert.equal(vastCreativeCompanionAd.getType(), VastCompanionAdType.STATIC);
        assert.equal(vastCreativeCompanionAd.getStaticResourceURL(), 'http://image.com');
        assert.equal(vastCreativeCompanionAd.getCompanionClickThroughURLTemplate(), 'https://url.com/companionClickThroughURLTemplate');
        assert.deepEqual(vastCreativeCompanionAd.getCompanionClickTrackingURLTemplates(), ['https://url.com/companionClickTrackingURLTemplate1', 'https://url.com/companionClickTrackingURLTemplate2']);
        assert.deepEqual(vastCreativeCompanionAd.getTrackingEvents(), { 'creativeView': ['https://url.com/companionCreativeViewURLTemplate'] });
    });
});
