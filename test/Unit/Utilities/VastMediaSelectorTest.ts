import { assert } from 'chai';
import 'mocha';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { getOptimizedVideoUrl } from 'VAST/Utilities/VastMediaSelector';

describe('VastMediaSelectorTest for getOptimizedVideoUrl', () => {
    let vastMediaFiles: VastMediaFile[];

    describe('selecting one file from media files with proper sizes', () => {
        beforeEach(() => {
            vastMediaFiles = [];

            const vastMedia1 = new VastMediaFile('https://vast_media_url_30mb', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '', 30973125);
            const vastMedia2 = new VastMediaFile('https://vast_media_url_570kb', 'progressive', '', 'video/mp4', 304, 0, 0, 640, 360, '', 570000);
            const vastMedia3 = new VastMediaFile('https://vast_media_url_3.2mb', 'progressive', '', 'video/mp4', 1745, 0, 0, 1920, 1080, '', 3271875);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
        });

        it('should return wifi range media url in wifi connection', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'wifi'), 'https://vast_media_url_3.2mb');
        });

        it('should return celluar range media url in cellular connection', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'cellular'), 'https://vast_media_url_570kb');
        });

        it('should return celluar range media url if connection info is missing', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles), 'https://vast_media_url_570kb');
        });
    });

    describe('selecting one file from media files where file sizes are 0', () => {
        beforeEach(() => {
            vastMediaFiles = [];

            const vastMedia1 = new VastMediaFile('https://vast_media_url_1', 'progressive', '', 'video/mp4', 0, 0, 0, 1920, 1080, '', 0);
            const vastMedia2 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 0, 0, 0, 640, 360, '', 0);
            const vastMedia3 = new VastMediaFile('https://vast_media_url_3', 'progressive', '', 'video/mp4', 1745, 0, 0, 1920, 1080, '', 3271875);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
        });

        it('should return wifi range media url in wifi connection', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'wifi'), 'https://vast_media_url_3');
        });

        it('should return default/first media url if none is found for cellular connection', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'cellular'), 'https://vast_media_url_1');
        });

        it('should return default/first media url if connection info is missing', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles), 'https://vast_media_url_1');
        });
    });

    describe('returning null where file sizes are too large', () => {
        beforeEach(() => {
            vastMediaFiles = [];

            // 30MB, 22MB, 40MB
            const vastMedia1 = new VastMediaFile('https://vast_media_url_1', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '', 30973125);
            const vastMedia2 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 16519, 0, 0, 1280, 720, '', 22020096);
            const vastMedia3 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '', 41943040);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
        });

        it('should return null if file sizes are too large in wifi', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'wifi'), null);
        });

        it('should return null if file sizes are too large for cellular connection', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles, 'cellular'), null);
        });

        it('should return null if file sizes are too large when connection info is missing', () => {
            assert.equal(getOptimizedVideoUrl(vastMediaFiles), null);
        });
    });
});
