import { RequestManager as Base } from 'Core/Managers/RequestManager';

export type RequestManagerMock = Base & {
    get: jest.Mock;
    post: jest.Mock;
    followRedirectChain: jest.Mock;
};

export const RequestManager = jest.fn(() => {
    return <RequestManagerMock>{
        get: jest.fn().mockResolvedValue(Promise.resolve()),
        post: jest.fn().mockResolvedValue(Promise.resolve()),
        followRedirectChain: jest.fn().mockResolvedValue(Promise.resolve('url'))
    };
});
