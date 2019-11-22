import { MetaDataManager as Base } from 'Core/Managers/MetaDataManager';

export type MetaDataManagerMock = Base & {
};

export const MetaDataManager = jest.fn(() => {
    return <MetaDataManagerMock>{};
});
