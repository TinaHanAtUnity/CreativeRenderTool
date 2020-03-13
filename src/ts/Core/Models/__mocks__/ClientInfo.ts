import { ClientInfo as Base } from 'Core/Models/ClientInfo';

export type ClientInfoMock = Base & {
    getSdkVersionName: jest.Mock;
    getApplicationName: jest.Mock;
    getTestMode: jest.Mock;
    getGameId: jest.Mock;
    getSdkVersion: jest.Mock;
    getApplicationVersion: jest.Mock;
};

export const ClientInfo = jest.fn(() => {
    return <ClientInfoMock>{
        getSdkVersionName: jest.fn().mockImplementation(() => ''),
        getApplicationName: jest.fn().mockImplementation(() => ''),
        getTestMode: jest.fn(),
        getGameId: jest.fn().mockReturnValue('test'),
        getSdkVersion: jest.fn().mockReturnValue(3420),
        getApplicationVersion: jest.fn().mockReturnValue('1.0')
    };
});
