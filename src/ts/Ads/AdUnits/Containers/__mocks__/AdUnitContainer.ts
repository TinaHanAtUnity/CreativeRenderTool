import { AdUnitContainer as Base } from 'Ads/AdUnits/Containers/AdUnitContainer';

export type AdUnitContainerMock = Base & {
    addEventHandler: jest.Mock;
    removeEventHandler: jest.Mock;
    open: jest.Mock;
    close: jest.Mock;
};

export const AdUnitContainer = jest.fn(() => {
    return <AdUnitContainerMock>{
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        open: jest.fn().mockImplementation(() => Promise.resolve()),
        close: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
