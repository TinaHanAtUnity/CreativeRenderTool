import { WebPlayerApi as Base } from 'Ads/Native/WebPlayer';

export type WebPlayerApiMock = Base & {};

export const WebPlayerApi = jest.fn(() => {
    return <WebPlayerApiMock>{
    };
});
