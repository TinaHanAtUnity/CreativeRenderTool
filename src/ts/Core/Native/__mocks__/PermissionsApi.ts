import { PermissionsApi as Base } from 'Core/Native/Permissions';

export type PermissionsApiMock = Base & {
};

export const PermissionsApi = jest.fn(() => {
    return <PermissionsApiMock>{
    };
});
