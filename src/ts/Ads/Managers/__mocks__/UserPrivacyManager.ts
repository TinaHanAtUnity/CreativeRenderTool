import { UserPrivacyManager as Base, AgeGateChoice } from 'Ads/Managers/UserPrivacyManager';
import Mock = jest.Mock;

export type UserPrivacyManagerMock = Base & {
    isUserUnderAgeLimit: Mock<boolean>;
    getAgeGateChoice: Mock<AgeGateChoice>;
};

export const UserPrivacyManager = jest.fn(() => {
    return <UserPrivacyManagerMock>{
        isUserUnderAgeLimit: jest.fn().mockImplementation(() => true),
        getAgeGateChoice: jest.fn().mockReturnValue(AgeGateChoice.YES)
    };
});
