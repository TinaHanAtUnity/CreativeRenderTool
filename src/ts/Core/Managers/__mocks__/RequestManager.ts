import { RequestManager as Base } from 'Core/Managers/RequestManager';

export type RequestManagerMock = Base & {
    get: jest.Mock;
};

export const RequestManager = jest.fn(() => {
    return <RequestManagerMock>{
        get: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
