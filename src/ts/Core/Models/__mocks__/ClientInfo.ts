import { ClientInfo as Base } from 'Core/Models/ClientInfo';

export type ClientInfoMock = Base & {
};

export const ClientInfo = jest.fn(() => {
    return <ClientInfoMock>{};
});
