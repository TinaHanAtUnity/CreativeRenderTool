import { UserPrivacyManager as Base } from 'Ads/Managers/UserPrivacyManager';

export type UserPrivacyManagerMock = Base & {};

export const UserPrivacyManager = jest.fn(() => {
    return <UserPrivacyManagerMock>{};
});
