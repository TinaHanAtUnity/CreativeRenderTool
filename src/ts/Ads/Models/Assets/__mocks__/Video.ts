import { Video as Base } from 'Ads/Models/Assets/Video';

export type VideoMock = Base & {
};

export const Video = jest.fn(() => {
    return <VideoMock>{
    };
});
