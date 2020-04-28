import { VastEndScreen as Base } from 'VAST/Views/VastEndScreen';
import { Tap } from 'Core/Utilities/__mocks__/Tap';

export type VastEndScreenMock = Base & {
    tap: jest.Mock;
    setCallButtonEnabled: jest.Mock;
};

export const VastEndScreen = jest.fn(() => {
    return <VastEndScreenMock>{
        tap: jest.fn().mockImplementation(() => new Tap()),
        setCallButtonEnabled: jest.fn()
    };
});
