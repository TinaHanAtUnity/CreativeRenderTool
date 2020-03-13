import { PrivacySDK as Base } from 'Privacy/PrivacySDK';
import { GamePrivacy, UserPrivacy, PrivacyMethod } from 'Privacy/Privacy';
import { LegalFramework } from 'Ads/Managers/UserPrivacyManager';

export type PrivacySDKMock = Base & {
    isOptOutRecorded: jest.Mock;
    isOptOutEnabled: jest.Mock;
    isGDPREnabled: jest.Mock;
    getGamePrivacy: jest.Mock;
    getLegalFramework: jest.Mock;
    getUserPrivacy: jest.Mock;
};

export const PrivacySDK = jest.fn(() => {
    return <PrivacySDKMock>{
        isOptOutRecorded: jest.fn().mockReturnValue(false),
        isOptOutEnabled: jest.fn().mockReturnValue(false),
        isGDPREnabled: jest.fn().mockReturnValue(false),
        getGamePrivacy: jest.fn().mockReturnValue(new GamePrivacy({
            method: 'default'
        })),
        getLegalFramework: jest.fn().mockReturnValue(LegalFramework.NONE),
        getUserPrivacy: jest.fn().mockReturnValue(UserPrivacy.createFromLegacy(PrivacyMethod.DEFAULT, false, false))
    };
});
