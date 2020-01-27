import { LoadApi as Base } from 'Core/Native/LoadApi';

export type LoadApiMock = Base & {};

export const LoadApi = jest.fn(() => {
    return <LoadApiMock>{
    };
});
