import { AdUnitContainer as Base } from 'Ads/AdUnits/Containers/AdUnitContainer';

export type AdUnitContainerMock = Base & {
    addEventHandler: jest.Mock;
    removeEventHandler: jest.Mock;
    open: jest.Mock;
    close: jest.Mock;
    reconfigure: jest.Mock;
    setViewFrame: jest.Mock;
    reorient: jest.Mock;
    getLockedOrientation: jest.Mock;
};

export const AdUnitContainer = jest.fn(() => {
    return <AdUnitContainerMock>{
        addEventHandler: jest.fn(),
        removeEventHandler: jest.fn(),
        open: jest.fn().mockResolvedValue(Promise.resolve()),
        close: jest.fn().mockResolvedValue(Promise.resolve()),
        reconfigure: jest.fn().mockResolvedValue(Promise.resolve()),
        setViewFrame: jest.fn().mockResolvedValue(Promise.resolve()),
        reorient: jest.fn().mockResolvedValue(Promise.resolve()),
        getLockedOrientation: jest.fn().mockResolvedValue(Promise.resolve())
    };
});
