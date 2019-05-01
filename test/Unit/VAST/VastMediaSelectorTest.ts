import { assert } from 'chai';
import 'mocha';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';

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
            assert.deepEqual(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'wifi'
            )!.getFileURL(), 'https://vast_media_url_3.2mb');
        });

        it('should return celluar range media url in cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'cellular')!.getFileURL(), 'https://vast_media_url_570kb');
        });

        it('should return celluar range media url if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles)!.getFileURL(), 'https://vast_media_url_570kb');
        });
    });

    describe('selecting one file from media files where file sizes are 0', () => {
        let vastMedia1: VastMediaFile;
        let vastMedia2: VastMediaFile;
        let vastMedia3: VastMediaFile;

        beforeEach(() => {
            vastMediaFiles = [];

            vastMedia1 = new VastMediaFile('https://vast_media_url_1', 'progressive', '', 'video/mp4', 0, 0, 0, 1920, 1080, '', 0);
            vastMedia2 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 0, 0, 0, 640, 360, '', 0);
            vastMedia3 = new VastMediaFile('https://vast_media_url_3', 'progressive', '', 'video/mp4', 1745, 0, 0, 1920, 1080, '', 3271875);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
        });

        it('should return wifi range media url in wifi connection', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'wifi'), vastMedia3);
        });

        it('should return default/first media url if none is found for cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'cellular'), vastMedia1);
        });

        it('should return default/first media url if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles), vastMedia1);
        });
    });

    describe('selecting lowest bitrate file from media files where file sizes are 0 due to duration 00:00:00', () => {
        beforeEach(() => {
            vastMediaFiles = [];

            const vastMedia1 = new VastMediaFile('https://vast_media_url_1', 'progressive', '', 'video/mp4', 15180, 0, 0, 1920, 1080, '', 0);
            const vastMedia2 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 15180, 0, 0, 1280, 720, '', 0);
            const vastMedia3 = new VastMediaFile('https://vast_media_url_3', 'progressive', '', 'video/mp4', 11115, 0, 0, 1920, 1080, '', 0);
            const vastMedia4 = new VastMediaFile('https://vast_media_url_4', 'progressive', '', 'video/mp4', 9255, 0, 0, 1920, 1080, '', 0);
            const vastMedia5 = new VastMediaFile('https://vast_media_url_5', 'progressive', '', 'video/mp4', 6446, 0, 0, 1920, 1080, '', 0);
            const vastMedia6 = new VastMediaFile('https://vast_media_url_6', 'progressive', '', 'video/mp4', 2860, 0, 0, 1920, 1080, '', 0);
            const vastMedia7 = new VastMediaFile('https://vast_media_url_7', 'progressive', '', 'video/mp4', 2487, 0, 0, 640, 360, '', 0);
            const vastMedia8 = new VastMediaFile('https://vast_media_url_8', 'progressive', '', 'video/mp4', 2261, 0, 0, 1280, 720, '', 0);
            const vastMedia9 = new VastMediaFile('https://vast_media_url_9', 'progressive', '', 'video/mp4', 1611, 0, 0, 1920, 1080, '', 0);
            const vastMedia10 = new VastMediaFile('https://vast_media_url_10', 'progressive', '', 'video/mp4', 1588, 0, 0, 1280, 720, '', 0);
            const vastMedia11 = new VastMediaFile('https://vast_media_url_11', 'progressive', '', 'video/mp4', 1136, 0, 0, 640, 360, '', 0);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
            vastMediaFiles.push(vastMedia4);
            vastMediaFiles.push(vastMedia5);
            vastMediaFiles.push(vastMedia6);
            vastMediaFiles.push(vastMedia7);
            vastMediaFiles.push(vastMedia8);
            vastMediaFiles.push(vastMedia9);
            vastMediaFiles.push(vastMedia10);
            vastMediaFiles.push(vastMedia11);
        });

        it('should return the lowest bitrate file for wifi connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'wifi')!.getFileURL(), 'https://vast_media_url_11');
        });

        it('should return the lowest bitrate file for cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'cellular')!.getFileURL(), 'https://vast_media_url_11');
        });

        it('should return the lowest bitrate file if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles)!.getFileURL(), 'https://vast_media_url_11');
        });
    });

    describe('returning null where file sizes are too large', () => {
        let vastMedia1: VastMediaFile;
        let vastMedia2: VastMediaFile;
        let vastMedia3: VastMediaFile;

        beforeEach(() => {
            vastMediaFiles = [];

            // 30MB, 22MB, 40MB
            vastMedia1 = new VastMediaFile('https://vast_media_url_1', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '', 30973125);
            vastMedia2 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 16519, 0, 0, 1280, 720, '', 22020096);
            vastMedia3 = new VastMediaFile('https://vast_media_url_2', 'progressive', '', 'video/mp4', 16519, 0, 0, 1920, 1080, '', 41943040);

            vastMediaFiles.push(vastMedia1);
            vastMediaFiles.push(vastMedia2);
            vastMediaFiles.push(vastMedia3);
        });

        it('should return null if file sizes are too large in wifi', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'wifi'), null);
        });

        it('should return null if file sizes are too large for cellular connection', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles, 'cellular'), null);
        });

        it('should return null if file sizes are too large when connection info is missing', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMedia(vastMediaFiles), null);
        });
    });
});
