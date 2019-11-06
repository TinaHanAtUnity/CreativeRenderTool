import { IosPreferencesApi as Base } from 'Core/Native/iOS/Preferences';

export type IosPreferencesApiMock = Base & {
};

export const IosPreferencesApi = jest.fn(() => {
    return <IosPreferencesApiMock>{
    };
});
