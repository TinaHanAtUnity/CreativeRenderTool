import { ClientInfo as Base } from 'Core/Models/ClientInfo';

export type ClientInfoMock = Base & {
    getSdkVersionName: jest.Mock;
    getApplicationName: jest.Mock
    getTestMode: jest.Mock;
    getSdkVersion: jest.Mock;
    getGameId: jest.Mock;

};

export const ClientInfo = jest.fn(() => {
    return <ClientInfoMock>{
        getSdkVersionName: jest.fn().mockImplementation(() => ''),
        getApplicationName: jest.fn().mockImplementation(() => ''),
        getTestMode: jest.fn(),
        getSdkVersion: jest.fn().mockImplementation(() => ''),
        getGameId: jest.fn()
    };
});
