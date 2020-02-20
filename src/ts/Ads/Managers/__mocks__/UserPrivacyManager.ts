import { UserPrivacyManager as Base } from 'Ads/Managers/UserPrivacyManager';
import Mock = jest.Mock;

export type UserPrivacyManagerMock = Base & {
    isUserUnderAgeLimit: Mock<boolean>;
};

export const UserPrivacyManager = jest.fn(() => {
    return <UserPrivacyManagerMock>{
        isUserUnderAgeLimit: jest.fn().mockImplementation(() => true)
    };
});
