import { StoreManager } from 'Store/__mocks__/StoreManager';

export const Store = jest.fn(() => {
    return {
        Api: {
            Android: undefined,
            iOS: undefined
        },
        StoreManager: new StoreManager()
    };
});
