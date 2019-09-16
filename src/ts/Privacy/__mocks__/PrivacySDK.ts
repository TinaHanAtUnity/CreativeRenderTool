import { PrivacySDK as Base } from 'Privacy/PrivacySDK';

export type PrivacySDKMock = Base & {};

export const PrivacySDK = jest.fn(() => {
    return <PrivacySDKMock>{};
});
