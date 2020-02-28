import { CoreConfiguration as Base } from 'Core/Models/CoreConfiguration';
import Mock = jest.Mock;

export type CoreConfigurationMock = Base & {
    isCoppaCompliant: Mock<boolean>;
    getCountry: Mock<string>;
};

export const CoreConfiguration = jest.fn(() => {
    return <CoreConfigurationMock>{
        isCoppaCompliant: jest.fn().mockImplementation(() => true),
        getCountry: jest.fn().mockImplementation(() => 'us')
    };
});
