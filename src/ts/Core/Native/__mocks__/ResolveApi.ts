import { ResolveApi as Base } from 'Core/Native/Resolve';

export type ResolveApiMock = Base & {
};

export const ResolveApi = jest.fn(() => {
    return <ResolveApiMock>{
    };
});
