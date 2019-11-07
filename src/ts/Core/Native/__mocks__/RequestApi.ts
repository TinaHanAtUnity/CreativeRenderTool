import { RequestApi as Base } from 'Core/Native/Request';

export type RequestApiMock = Base & {
};

export const RequestApi = jest.fn(() => {
    return <RequestApiMock>{
    };
});
