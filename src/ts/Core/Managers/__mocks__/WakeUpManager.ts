import { WakeUpManager as Base } from 'Core/Managers/WakeUpManager';

export type WakeUpManagerMock = Base & {
};

export const WakeUpManager = jest.fn(() => {
    return <WakeUpManagerMock>{};
});
