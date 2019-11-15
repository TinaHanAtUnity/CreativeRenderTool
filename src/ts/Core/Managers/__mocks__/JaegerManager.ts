import { JaegerManager as Base } from 'Core/Managers/JaegerManager';

export type JaegerManagerMock = Base & {
};

export const JaegerManager = jest.fn(() => {
    return <JaegerManagerMock>{};
});
