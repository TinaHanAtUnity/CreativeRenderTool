import { AppSheetApi as Base } from 'Store/Native/iOS/AppSheet';

export type AppSheetApiMock = Base & {
};

export const AppSheetApi = jest.fn(() => {
    return <AppSheetApiMock>{
    };
});
