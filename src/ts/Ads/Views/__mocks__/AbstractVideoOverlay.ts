import { AbstractVideoOverlay as Base } from 'Ads/Views/AbstractVideoOverlay';
import { Tap } from 'Core/Utilities/__mocks__/Tap';

export type AbstractVideoOverlayMock = Base & {
    tap: jest.Mock;
    setCallButtonEnabled: jest.Mock;
};

export const AbstractVideoOverlay = jest.fn(() => {
    return <AbstractVideoOverlayMock>{
        tap: jest.fn().mockImplementation(() => new Tap()),
        setCallButtonEnabled: jest.fn()
    };
});
