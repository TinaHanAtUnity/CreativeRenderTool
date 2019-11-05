import { AndroidStoreApi as Base } from 'Store/Native/Android/Store';

export type AndroidStoreApiMock = Base & {
};

export const AndroidStoreApi = jest.fn(() => {
    return <AndroidStoreApiMock>{
    };
});
