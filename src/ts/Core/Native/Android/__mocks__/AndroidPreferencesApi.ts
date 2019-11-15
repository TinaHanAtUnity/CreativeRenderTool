import { AndroidPreferencesApi as Base } from 'Core/Native/Android/Preferences';

export type AndroidPreferencesApiMock = Base & {
};

export const AndroidPreferencesApi = jest.fn(() => {
    return <AndroidPreferencesApiMock>{
    };
});
