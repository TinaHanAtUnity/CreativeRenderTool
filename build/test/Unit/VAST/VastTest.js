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
    let vastCreative;
    let vastMediaFile;
    let vastAd;
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
            assert.equal(vast.getStaticCompanionLandscapeUrl(), 'http://url.com/landscape.png');
        });
        it('should return url for portrait endcard image', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id3', 700, 800, 'image/png', 'http://image.com', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getStaticCompanionPortraitUrl(), 'http://url.com/portrait.png');
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
            assert.equal(vast.getStaticCompanionLandscapeUrl(), 'http://url.com/landscape.jpeg');
            assert.equal(vast.getStaticCompanionPortraitUrl(), 'http://url.com/portrait.jpg');
        });
        it('should return image urls when image mime type is png', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/png', 'http://url.com/landscape.png', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/png', 'http://url.com/portrait.png', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getStaticCompanionLandscapeUrl(), 'http://url.com/landscape.png');
            assert.equal(vast.getStaticCompanionPortraitUrl(), 'http://url.com/portrait.png');
        });
        it('should return image urls when image mime type is gif', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/gif', 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'image/gif', 'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getStaticCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getStaticCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });
        it('should return image urls when image mime type is in caps', () => {
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id1', 320, 480, 'image/GIF', 'http://url.com/landscape.gif', 'https://url.com/click'));
            vastAd.addStaticCompanionAd(new VastCompanionAdStaticResource('id2', 480, 320, 'IMAGE/Gif', 'http://url.com/portrait.gif', 'https://url.com/click'));
            const vast = new Vast([vastAd], []);
            assert.equal(vast.getStaticCompanionLandscapeUrl(), 'http://url.com/landscape.gif');
            assert.equal(vast.getStaticCompanionPortraitUrl(), 'http://url.com/portrait.gif');
        });
        it('should return iframe url when it has iframe companion ad', () => {
            const vast = new Vast([vastAd], []);
            vastAd.addIframeCompanionAd(new VastCompanionAdIframeResource('id1', 320, 480, 'http://url.com/iframe.html'));
            assert.equal(vast.getIframeCompanionResourceUrl(), 'http://url.com/iframe.html');
        });
        it('should return null when iframe companion ad link is null', () => {
            const vast = new Vast([vastAd], []);
            vastAd.addIframeCompanionAd(new VastCompanionAdIframeResource('id2', 320, 480));
            assert.equal(vast.getIframeCompanionResourceUrl(), null);
        });
        it('should return first url when multiple iframe resources exist', () => {
            const vast = new Vast([vastAd], []);
            vastAd.addIframeCompanionAd(new VastCompanionAdIframeResource('id1', 320, 480, 'http://url.com/iframe.html'));
            vastAd.addIframeCompanionAd(new VastCompanionAdIframeResource('id2', 320, 480, 'http://url.com/iframe2.html'));
            assert.equal(vast.getIframeCompanionResourceUrl(), 'http://url.com/iframe.html');
        });
        it('should return html content when it has html companion ad', () => {
            const vast = new Vast([vastAd], []);
            vastAd.addHtmlCompanionAd(new VastCompanionAdHTMLResource('id1', 320, 480, '<div>hello click me</div>'));
            assert.equal(vast.getHtmlCompanionResourceContent(), '<div>hello click me</div>');
            const vastAdTwo = new VastAd();
            const vastTwo = new Vast([vastAdTwo], []);
            vastAdTwo.addHtmlCompanionAd(new VastCompanionAdHTMLResource('id2', 320, 480));
            assert.equal(vastTwo.getHtmlCompanionResourceContent(), null);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9WYXN0VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFFL0IsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ3hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM1QyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsTUFBTSwyQ0FBMkMsQ0FBQztBQUMxRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUNwRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLDZCQUE2QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDMUYsT0FBTyxFQUFFLDJCQUEyQixFQUFFLE1BQU0seUNBQXlDLENBQUM7QUFFdEYsUUFBUSxDQUFDLFVBQVUsRUFBRSxHQUFHLEVBQUU7SUFDdEIsSUFBSSxZQUFnQyxDQUFDO0lBQ3JDLElBQUksYUFBNEIsQ0FBQztJQUNqQyxJQUFJLE1BQWMsQ0FBQztJQUVuQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osWUFBWSxHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztRQUN4QyxhQUFhLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUNwQyxNQUFNLEdBQUcsSUFBSSxNQUFNLEVBQUUsQ0FBQztRQUN0QixNQUFNLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDJFQUEyRSxFQUFFLEdBQUcsRUFBRTtRQUNqRixNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FB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