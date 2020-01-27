import { IosAdUnitApi as Base } from 'Ads/Native/iOS/AdUnit';

export type IosAdUnitApiMock = Base & {};

export const IosAdUnitApi = jest.fn(() => {
    return <IosAdUnitApiMock>{
    };
});
