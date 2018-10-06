import { assert } from 'chai';
import 'mocha';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastAd } from 'VAST/Models/VastAd';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';
import { Vast } from 'VAST/Models/Vast';

describe('VastMediaSelectorTest', () => {
    let vast: Vast;
    let vastAd: VastAd;
    let vastCreative: VastCreativeLinear;
    const vastMediaFiles: VastMediaFile[] = [];

    beforeEach(() => {
        const vastMedia1 = new VastMediaFile('https://vast_media_url_30mb', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '' , 30973125);
        const vastMedia2 = new VastMediaFile('https://vast_media_url_570kb', 'progressive', '', 'video/mp4', 304, 0, 0, 640, 360, '', 570000);
        const vastMedia3 = new VastMediaFile('https://vast_media_url_3.2mb', 'progressive', '', 'video/mp4', 1745, 0, 0, 1920, 1080, '', 3271875);

        vastMediaFiles.push(vastMedia1);
        vastMediaFiles.push(vastMedia2);
        vastMediaFiles.push(vastMedia3);

        vastAd = new VastAd();
        vastCreative = new VastCreativeLinear(15, 0, vastMediaFiles, '', [], [], '');
        vastAd.addCreative(vastCreative);
        vast = new Vast([vastAd], []);
    });

    it('should return wifi range media url in wifi connection', () => {
        const vastMediaSelector = new VastMediaSelector(vast, 'wifi');

        assert.equal(vastMediaSelector.getOptimizedVideoUrl(), 'https://vast_media_url_3.2mb');
    });

    it('should return celluar range media url otherwise', () => {
        const vastMediaSelector = new VastMediaSelector(vast, 'cellular');

        assert.equal(vastMediaSelector.getOptimizedVideoUrl(), 'https://vast_media_url_570kb');
    });

    it('should return celluar range media url if fileSize and bitrate info are missing', () => {
        const vastMediaSelector = new VastMediaSelector(vast);

        assert.equal(vastMediaSelector.getOptimizedVideoUrl(), 'https://vast_media_url_570kb');
    });
});
