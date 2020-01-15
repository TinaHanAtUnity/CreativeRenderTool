import { CoreConfiguration as Base } from 'Core/Models/CoreConfiguration';
import Mock = jest.Mock;
import { ABGroupMock } from 'Core/Models/__mocks__/ABGroup';

export type CoreConfigurationMock = Base & {
    getAbGroup: Mock<ABGroupMock>;
};

export const CoreConfiguration = jest.fn(() => {
    return <CoreConfigurationMock>{
        getAbGroup: jest.fn()
    };
});
