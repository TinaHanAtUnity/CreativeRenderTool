import { FocusManager as Base } from 'Core/Managers/FocusManager';

export type FocusManagerMock = Base & {
};

export const FocusManager = jest.fn(() => {
    return <FocusManagerMock><unknown>{};
});
