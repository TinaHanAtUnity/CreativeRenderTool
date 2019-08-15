import { IosVideoPlayerApi as Base } from 'Ads/Native/Ios/VideoPlayer';

export type VideoPlayerMock = Base & {};

export const IosVideoPlayerApi = jest.fn(() => {
    return <VideoPlayerMock>{
    };
});
