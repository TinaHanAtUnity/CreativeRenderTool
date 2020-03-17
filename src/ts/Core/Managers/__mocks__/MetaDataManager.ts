import { MetaDataManager as Base } from 'Core/Managers/MetaDataManager';

export type MetaDataManagerMock = Base & {
    fetch: jest.Mock;
};

export const MetaDataManager = jest.fn(() => {
    return <MetaDataManagerMock>{
        fetch: jest.fn().mockResolvedValue(undefined)
    };
});
