import { PrivacySDK as Base } from 'Privacy/PrivacySDK';

export type PrivacySDKMock = Base & {
    isGDPREnabled: jest.Mock;
};

export const PrivacySDK = jest.fn(() => {
    return <PrivacySDKMock>{
        isGDPREnabled: jest.fn()
    };
});
