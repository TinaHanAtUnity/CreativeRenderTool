import { InstallInfo as Base } from 'Core/Models/InstallInfo';

export type InstallInfoMock = Base & {
    fetch: jest.Mock;
    getIdentifierForInstall: jest.Mock;
    getDTO: jest.Mock;
};

export const InstallInfo = jest.fn(() => {
    return <InstallInfoMock>{
        fetch: jest.fn().mockImplementation(() => Promise.resolve()),
        getIdentifierForInstall: jest.fn().mockReturnValue('ffffffff-ffff-ffff-ffff-ffffffffffff'),
        getDTO: jest.fn().mockImplementation(() => Promise.resolve())
    };
});
