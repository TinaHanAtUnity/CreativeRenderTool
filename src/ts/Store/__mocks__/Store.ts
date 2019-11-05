import { StoreManager } from 'Store/__mocks__/StoreManager';
import { AndroidStoreApi } from 'Store/Native/Android/__mocks__/AndroidStoreApi';
import { AppSheetApi } from 'Store/Native/iOS/__mocks__/AppsheetApi';
import { ProductsApi } from 'Store/Native/iOS/__mocks__/ProductsApi';

import { IStore } from 'Store/IStore';

export const Store = jest.fn(() => {
    return <IStore>{
        Api: {
            Android: {
                Store: new AndroidStoreApi()
            },
            iOS: {
                Products: new ProductsApi(),
                AppSheet: new AppSheetApi()
            }
        },
        StoreManager: new StoreManager()
    };
});
