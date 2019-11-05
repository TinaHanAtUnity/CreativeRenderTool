import { AndroidAdUnitApi as Base } from 'Ads/Native/Android/AdUnit';

export type AndroidAdUnitApiMock = Base & {};

export const AndroidAdUnitApi = jest.fn(() => {
    return <AndroidAdUnitApiMock>{
    };
});
