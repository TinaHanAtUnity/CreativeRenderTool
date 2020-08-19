import { InstallInfo as Base } from 'Core/Models/InstallInfo';

export type InstallInfoMock = Base & {
    fetch: jest.Mock;
    getIdfi: jest.Mock;
    getDTO: jest.Mock;
};

const VALID_IDFI = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

export const InstallInfo = jest.fn(() => {
    return <InstallInfoMock>{
        fetch: jest.fn().mockImplementation(() => Promise.resolve([])),
        getIdfi: jest.fn().mockReturnValue(VALID_IDFI),
        getDTO: jest.fn().mockImplementation(() => Promise.resolve({ 'idfi': VALID_IDFI }))
    };
});
