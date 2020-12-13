import { assert } from 'chai';
import 'mocha';
import { VastMediaFile } from 'VAST/Models/VastMediaFile';
import { VastMediaSelector } from 'VAST/Utilities/VastMediaSelector';
describe('VastMediaSelectorTest for getOptimizedVideoUrl', () => {
    let vastMediaFiles;
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
            assert.deepEqual(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'wifi').getFileURL(), 'https://vast_media_url_3.2mb');
        });
        it('should return celluar range media url in cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'cellular').getFileURL(), 'https://vast_media_url_570kb');
        });
        it('should return celluar range media url if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles).getFileURL(), 'https://vast_media_url_570kb');
        });
    });
    describe('selecting one file from media files where file sizes are 0', () => {
        let vastMedia1;
        let vastMedia2;
        let vastMedia3;
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
            assert.deepEqual(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'wifi'), vastMedia3);
        });
        it('should return default/first media url if none is found for cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'cellular'), vastMedia1);
        });
        it('should return default/first media url if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles), vastMedia1);
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
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'wifi').getFileURL(), 'https://vast_media_url_11');
        });
        it('should return the lowest bitrate file for cellular connection', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'cellular').getFileURL(), 'https://vast_media_url_11');
        });
        it('should return the lowest bitrate file if connection info is missing', () => {
            assert.equal(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles).getFileURL(), 'https://vast_media_url_11');
        });
    });
    describe('returning null where file sizes are too large', () => {
        let vastMedia1;
        let vastMedia2;
        let vastMedia3;
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
            assert.deepEqual(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'wifi'), null);
        });
        it('should return null if file sizes are too large for cellular connection', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles, 'cellular'), null);
        });
        it('should return null if file sizes are too large when connection info is missing', () => {
            assert.deepEqual(VastMediaSelector.getOptimizedVastMediaFile(vastMediaFiles), null);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdE1lZGlhU2VsZWN0b3JUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZBU1QvVmFzdE1lZGlhU2VsZWN0b3JUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFFckUsUUFBUSxDQUFDLGdEQUFnRCxFQUFFLEdBQUcsRUFBRTtJQUM1RCxJQUFJLGNBQStCLENBQUM7SUFFcEMsUUFBUSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtRQUNuRSxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osY0FBYyxHQUFHLEVBQUUsQ0FBQztZQUVwQixNQUFNLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQyw2QkFBNkIsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUMzSSxNQUFNLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQyw4QkFBOEIsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUN0SSxNQUFNLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQyw4QkFBOEIsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxPQUFPLENB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QyxDQUFDO1lBQ2hJLE1BQU0sVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hJLE1BQU0sVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzlILE1BQU0sVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQy9ILE1BQU0sVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2hJLE1BQU0sV0FBVyxHQUFHLElBQUksYUFBYSxDQUFDLDJCQUEyQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ2pJLE1BQU0sV0FBVyxHQUFHLElBQUksYUFBYSxDQUFDLDJCQUEyQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRWhJLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUNoQyxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDakMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNyQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7WUFDakUsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNqSSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQywrREFBK0QsRUFBRSxHQUFHLEVBQUU7WUFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLEVBQUUsVUFBVSxDQUFFLENBQUMsVUFBVSxFQUFFLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztRQUNySSxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyxxRUFBcUUsRUFBRSxHQUFHLEVBQUU7WUFDM0UsTUFBTSxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLENBQUUsQ0FBQyxVQUFVLEVBQUUsRUFBRSwyQkFBMkIsQ0FBQyxDQUFDO1FBQ3pILENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsK0NBQStDLEVBQUUsR0FBRyxFQUFFO1FBQzNELElBQUksVUFBeUIsQ0FBQztRQUM5QixJQUFJLFVBQXlCLENBQUM7UUFDOUIsSUFBSSxVQUF5QixDQUFDO1FBRTlCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixjQUFjLEdBQUcsRUFBRSxDQUFDO1lBRXBCLG1CQUFtQjtZQUNuQixVQUFVLEdBQUcsSUFBSSxhQUFhLENBQUMsMEJBQTBCLEVBQUUsYUFBYSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7WUFDbEksVUFBVSxHQUFHLElBQUksYUFBYSxDQUFDLDBCQUEwQixFQUFFLGFBQWEsRUFBRSxFQUFFLEVBQUUsV0FBVyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ2pJLFVBQVUsR0FBRyxJQUFJLGFBQWEsQ0FBQywwQkFBMEIsRUFBRSxhQUFhLEVBQUUsRUFBRSxFQUFFLFdBQVcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxRQUFRLENBQUMsQ0FBQztZQUVsSSxjQUFjLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQ2hDLGNBQWMsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDaEMsY0FBYyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUNwQyxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3REFBd0QsRUFBRSxHQUFHLEVBQUU7WUFDOUQsTUFBTSxDQUFDLFNBQVMsQ0FBQyxpQkFBaUIsQ0FBQyx5QkFBeUIsQ0FBQyxjQUFjLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEcsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsd0VBQXdFLEVBQUUsR0FBRyxFQUFFO1lBQzlFLE1BQU0sQ0FBQyxTQUFTLENBQUMsaUJBQWlCLENBQUMseUJBQXlCLENBQUMsY0FBYyxFQUFFLFVBQVUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3BHLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLGdGQUFnRixFQUFFLEdBQUcsRUFBRTtZQUN0RixNQUFNLENBQUMsU0FBUyxDQUFDLGlCQUFpQixDQUFDLHlCQUF5QixDQUFDLGNBQWMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3hGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9