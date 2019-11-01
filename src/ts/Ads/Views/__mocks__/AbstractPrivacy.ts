import { AbstractPrivacy as Base } from 'Ads/Views/AbstractPrivacy';

export type AbstractPrivacyMock = Base & {};

export const AbstractPrivacy = jest.fn(() => {
    return <AbstractPrivacyMock>{};
});
