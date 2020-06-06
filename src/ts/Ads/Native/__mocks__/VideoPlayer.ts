import { VideoPlayerApi as Base } from 'Ads/Native/VideoPlayer';

export type VideoPlayerApiMock = Base & {
    play: jest.Mock;
    pause: jest.Mock;
};

export const VideoPlayerApi = jest.fn(() => {
    return <VideoPlayerApiMock>{
        play: jest.fn(),
        pause: jest.fn()
    };
});
