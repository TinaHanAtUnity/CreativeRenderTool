import { RequestManager as Base } from 'Core/Managers/RequestManager';

export type RequestManagerMock = Base & {
    get: jest.Mock;
    post: jest.Mock;
};

export const RequestManager = jest.fn(() => {
    return <RequestManagerMock>{
        get: jest.fn().mockImplementation(() => Promise.resolve()),
        post: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
