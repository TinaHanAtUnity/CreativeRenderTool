import { ConfigManager as Base } from 'Core/Managers/ConfigManager';

export type ConfigManagerMock = Base & {
};

export const ConfigManager = jest.fn(() => {
    return <ConfigManagerMock>{};
});
