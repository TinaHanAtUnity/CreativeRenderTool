import { CoreConfiguration as Base } from 'Core/Models/CoreConfiguration';
import Mock = jest.Mock;

export type CoreConfigurationMock = Base & {
    getTestMode: jest.Mock;
    getToken: jest.Mock;
    getProperties: jest.Mock;
    getUnityProjectId: jest.Mock;
    getAbGroup: jest.Mock;
    getOrganizationId: jest.Mock;
    getDeveloperId: jest.Mock;
    isCoppaCompliant: Mock<boolean>;
    getCountry: Mock<string>;
};

export const CoreConfiguration = jest.fn(() => {
    return <CoreConfigurationMock>{
        getTestMode: jest.fn().mockReturnValue(false),
        getToken: jest.fn().mockReturnValue(''),
        getProperties: jest.fn().mockReturnValue(''),
        getUnityProjectId: jest.fn().mockReturnValue(''),
        getAbGroup: jest.fn().mockReturnValue(99),
        getOrganizationId: jest.fn().mockReturnValue(''),
        getDeveloperId: jest.fn().mockReturnValue(''),
        isCoppaCompliant: jest.fn().mockImplementation(() => true),
        getCountry: jest.fn().mockImplementation(() => 'us')
    };
});
