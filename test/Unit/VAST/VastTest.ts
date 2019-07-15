import { assert } from 'chai';
import 'mocha';
import * as sinon from 'sinon';

import { Vast } from 'VAST/Models/Vast';
import { VastAd } from 'VAST/Models/VastAd';
import { VastCompanionAdStaticResource } from 'VAST/Models/VastCompanionAdStaticResource';
import { VastCreativeLinear } from 'VAST/Models/VastCreativeLinear';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { VastCompanionAdHTMLResource } from 'VAST/Models/VastCompanionAdHTMLResource';

describe('VastTest', () => {
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
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id3', 700, 800, 'image/png', 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
        });

        it('should return url for landscape endcard image', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id3', 700, 800, 'image/png', 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
        });

        it('should return url for click through url', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id3', 700, 800, 'image/png', 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionClickThroughUrl(), 'https://url.com/click');
        });

        it('should return urls for companion click trackings', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click', ['https://url.com/clickTracking']));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click', ['https://url.com/clickTracking']));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id3', 700, 800, 'image/png', 'http://image.com', 'https://url.com/click', ['https://url.com/clickTracking']));
            const vast = new Vast([vastAd], []);
            assert.deepEqual(vast.getCompanionClickTrackingUrls(), ['https://url.com/clickTracking']);
        });

        it('should return image urls when image mime type is jpeg or jpg', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/jpeg', 'http://url.com/landscape.jpeg', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/jpg', 'http://url.com/portrait.jpg', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.jpeg');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.jpg');
        });

        it('should return image urls when image mime type is png', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.png');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.png');
        });

        it('should return image urls when image mime type is gif', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/gif', 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/gif', 'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });

        it('should return image urls when image mime type is in caps', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/GIF', 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'IMAGE/Gif',  'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });

        it('should return iframe url when it has iframe companion ad', () => {
            const vast = new Vast([vastAd], []);

            vastAd.setIframeCompanionAd(new VastCompanionAdIframeResource('id1', 320, 480, 'http://url.com/iframe.html'));
            assert.equal(vast.getIframeCompanionResourceUrl(), 'http://url.com/iframe.html');

            vastAd.setIframeCompanionAd(new VastCompanionAdIframeResource('id2', 320, 480));
            assert.equal(vast.getIframeCompanionResourceUrl(), null);
        });

        it('should return html content when it has html companion ad', () => {
            const vast = new Vast([vastAd], []);

            vastAd.setHtmlCompanionAd(new VastCompanionAdHTMLResource('id1', 320, 480, '<div>hello click me</div>'));
            assert.equal(vast.getHtmlCompanionResourceContent(), '<div>hello click me</div>');

            vastAd.setHtmlCompanionAd(new VastCompanionAdHTMLResource('id2', 320, 480));
            assert.equal(vast.getHtmlCompanionResourceContent(), null);
        });
    });
});
