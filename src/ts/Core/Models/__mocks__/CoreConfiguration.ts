import { CoreConfiguration as Base } from 'Core/Models/CoreConfiguration';
import Mock = jest.Mock;
import { ABGroup } from 'Core/Models/__mocks__/ABGroup';

export type CoreConfigurationMock = Base & {
    getAbGroup: Mock<ABGroup>;
};

export const CoreConfiguration = jest.fn(() => {
    return <CoreConfigurationMock>{
        getAbGroup: jest.fn()
    };
});
