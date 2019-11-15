import { MainBundleApi as Base } from 'Core/Native/iOS/MainBundle';

export type MainBundleApiMock = Base & {
};

export const MainBundleApi = jest.fn(() => {
    return <MainBundleApiMock>{
    };
});
