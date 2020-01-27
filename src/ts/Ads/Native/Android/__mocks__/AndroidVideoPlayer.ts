import { AndroidVideoPlayerApi as Base } from 'Ads/Native/Android/VideoPlayer';

export type AndroidVideoPlayerApiMock = Base & {};

export const AndroidVideoPlayerApi = jest.fn(() => {
    return <AndroidVideoPlayerApiMock>{
    };
});
