import { ConnectivityApi as Base } from 'Core/Native/Connectivity';

export type ConnectivityApiMock = Base & {
};

export const ConnectivityApi = jest.fn(() => {
    return <ConnectivityApiMock>{
    };
});
