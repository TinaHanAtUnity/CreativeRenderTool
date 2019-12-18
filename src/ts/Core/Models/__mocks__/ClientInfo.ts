import { ClientInfo as Base } from 'Core/Models/ClientInfo';

export type ClientInfoMock = Base & {
    getSdkVersionName: jest.Mock;
};

export const ClientInfo = jest.fn(() => {
    return <ClientInfoMock>{
        getSdkVersionName: jest.fn().mockImplementation(() => '')
    };
});
