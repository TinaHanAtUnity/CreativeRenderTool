import { RequestManager as Base } from 'Core/Managers/RequestManager';

export type RequestManagerMock = Base & {};

export const RequestManager = jest.fn(() => {
    return <RequestManagerMock>{};
});
