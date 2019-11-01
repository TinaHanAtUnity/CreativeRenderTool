import { VideoPlayerApi as Base } from 'Ads/Native/VideoPlayer';

export type VideoPlayerApiMock = Base & {};

export const VideoPlayerApi = jest.fn(() => {
    return <VideoPlayerApiMock>{
    };
});
