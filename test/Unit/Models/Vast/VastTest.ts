import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Vast } from 'Ads/Models/Vast/Vast';
import { VastAd } from 'Ads/Models/Vast/VastAd';
import { VastCreativeLinear } from 'Ads/Models/Vast/VastCreativeLinear';
import { VastMediaFile } from 'Ads/Models/Vast/VastMediaFile';
import { VastCreativeCompanionAd } from 'Ads/Models/Vast/VastCreativeCompanionAd';

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
        const vast = new Vast([vastAd], []);
        const unsupportedVastMediaFile = new VastMediaFile();

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
        sinon.stub(unsupportedVastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/blah.3gpp');
        sinon.stub(unsupportedVastMediaFile, 'getMIMEType').returns('video/3gpp');

        sinon.stub(vastCreative, 'getMediaFiles').returns([unsupportedVastMediaFile, vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should return url for a playable video', () => {
        const vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/mp4');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should be case insensitive to mime type string', () => {
        const vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('Video/Mp4');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.equal(vast.getVideoUrl(), 'http://static.scanscout.com/filemanager/vhs/partner364124_f00a7d93-0858-4b28-bf8e-e9af7a879f74.mp4');
    });

    it('should not return url for unplayable video', () => {
        const vast = new Vast([vastAd], []);

        sinon.stub(vastMediaFile, 'getFileURL').returns('http://static.scanscout.com/filemanager/vhs/not-supported.3gpp');
        sinon.stub(vastMediaFile, 'getMIMEType').returns('video/3gpp');
        sinon.stub(vastCreative, 'getMediaFiles').returns([vastMediaFile]);

        assert.throws(vast.getVideoUrl);
    });

    describe('when VAST has a companion ad', () => {
        it('should return url for landscape endcard image', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
        });

        it('should return url for landscape endcard image', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
        });

        it('should return url for click through url', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id3', 'image/png', 700, 800, 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionClickThroughUrl(), 'https://url.com/click');
        });

        it('should not return url for landscape endcard if dimensions are too small', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 319, 500, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 350, 479, 'http://url.com/landscape.png', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), null);
        });

        it('should not return url for portrait endcard if dimensions are too small', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 490, 319, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 479, 350, 'http://url.com/portrait.png', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionPortraitUrl(), null);
        });

        it('should not return image urls when image mime types are not supported', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'application/json', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'js', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id3', 'blah', 700, 800, 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), null);
            assert.equal(vast.getCompanionPortraitUrl(), null);
        });

        it('should not return image urls when image mime types are not supported', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'application/json', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'js', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id3', 'blah', 700, 800, 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), null);
            assert.equal(vast.getCompanionPortraitUrl(), null);
        });

        it('should return image urls when image mime type is jpeg or jpg', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/jpeg', 320, 480, 'http://url.com/landscape.jpeg', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/jpg', 480, 320, 'http://url.com/portrait.jpg', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.jpeg');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.jpg');
        });

        it('should return image urls when image mime type is png', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/png', 320, 480, 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/png', 480, 320, 'http://url.com/portrait.png', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
        });

        it('should return image urls when image mime type is gif', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/gif', 320, 480, 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'image/gif', 480, 320, 'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });

        it('should return image urls when image mime type is in caps', () => {
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id1', 'image/GIF', 320, 480, 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addCompanionAd(new VastCreativeCompanionAd('id2', 'IMAGE/Gif', 480, 320, 'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });
    });
});
