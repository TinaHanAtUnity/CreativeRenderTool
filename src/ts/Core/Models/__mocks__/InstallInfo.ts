import { InstallInfo as Base } from 'Core/Models/InstallInfo';

export type InstallInfoMock = Base & {
    fetch: jest.Mock;
    getIdentifierForInstall: jest.Mock;
    getDTO: jest.Mock;
};

const validIDFI = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

export const InstallInfo = jest.fn(() => {
    return <InstallInfoMock>{
        fetch: jest.fn().mockImplementation(() => Promise.resolve([])),
        getIdentifierForInstall: jest.fn().mockReturnValue(validIDFI),
        getDTO: jest.fn().mockImplementation(() => Promise.resolve({ 'idfi': validIDFI }))
    };
});
