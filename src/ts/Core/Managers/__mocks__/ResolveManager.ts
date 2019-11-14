import { ResolveManager as Base } from 'Core/Managers/ResolveManager';

export type ResolveManagerMock = Base & {
};

export const ResolveManager = jest.fn(() => {
    return <ResolveManagerMock>{};
});
