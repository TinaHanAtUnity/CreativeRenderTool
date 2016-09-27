import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Vast } from 'Models/Vast/Vast';
import { VastAd } from 'Models/Vast/VastAd';
import { VastCreativeLinear } from 'Models/Vast/VastCreativeLinear';
import { VastMediaFile } from 'Models/Vast/VastMediaFile';

describe('Vast', () => {
    let vastCreative: VastCreativeLinear;
    let vastMediaFile: VastMediaFile;
    let vastAd: VastAd;

    beforeEach(() => {
        vastCreative = new VastCreativeLinear();
        vastMediaFile = new VastMediaFile();
        vastAd = new VastAd();
        vastAd.addCreative(vastCreative);
    });

    it('should return url for a playable video given multiple media files in VAST', () => {
        let vast = new Vast([vastAd], []);
        let unsupportedVastMediaFile = new VastMediaFile();

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
        sinon.stub(unsupportedVastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/blah.3gpp');
        sinon.stub(unsupportedVastMediaFile, 'getMIMEType').returns('video/3gpp');

        sinon.stub(vastCreative, 'getMediaFiles').returns([unsupportedVastMediaFile, vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should return url for a playable video', () => {
        let vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should be case insensitive to mime type string', () => {
        let vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('Video/Mp4');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should not return url for unplayable video', () => {
        let vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/not-supported.3gpp');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/3gpp');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.equal(vast.getVideoUrl(), null);
    });
});
