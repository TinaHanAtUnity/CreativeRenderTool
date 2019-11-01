import { CoreConfiguration as Base } from 'Core/Models/CoreConfiguration';

export type CoreConfigurationMock = Base & {
};

export const CoreConfiguration = jest.fn(() => {
    return <CoreConfigurationMock><unknown>{};
});
