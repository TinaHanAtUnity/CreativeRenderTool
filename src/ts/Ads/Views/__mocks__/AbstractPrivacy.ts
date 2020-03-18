import { AbstractPrivacy as Base } from 'Ads/Views/AbstractPrivacy';
import { AdUnitContainer } from 'Ads/AdUnits/Containers/__mocks__/AdUnitContainer';

export type AbstractPrivacyMock = Base & {
    addEventHandler: jest.Mock;
    hide: jest.Mock;
    container: jest.Mock;
};

export const AbstractPrivacy = jest.fn(() => {
    return <AbstractPrivacyMock>{
        addEventHandler: jest.fn(),
        hide: jest.fn(),
        container: jest.fn().mockImplementation(() => {
            return new AdUnitContainer();
        })
    };
});
