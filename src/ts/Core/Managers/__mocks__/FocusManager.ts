import { FocusManager as Base } from 'Core/Managers/FocusManager';
import { ObservableMock, Observable } from 'Core/Utilities/__mocks__/Observable';

export type FocusManagerMock = Base & {
    onAppForeground: ObservableMock;
    onAppBackground: ObservableMock;
    onActivityResumed: ObservableMock;
    onActivityPaused: ObservableMock;
    onActivityDestroyed: ObservableMock;
    onScreenOn: ObservableMock;
    setListenAppForeground: jest.Mock;
    setListenAppBackground: jest.Mock;
    setListenAndroidLifecycle: jest.Mock;
    setListenScreen: jest.Mock;
    isAppForeground: jest.Mock;
};

export const FocusManager = jest.fn(() => {
    return <FocusManagerMock>{
        onAppForeground: Observable(),
        onAppBackground: Observable(),
        onActivityResumed: Observable(),
        onActivityPaused: Observable(),
        onActivityDestroyed: Observable(),
        onScreenOn: Observable(),
        setListenAppForeground: jest.fn(),
        setListenAppBackground: jest.fn(),
        setListenAndroidLifecycle: jest.fn(),
        setListenScreen: jest.fn(),
        isAppForeground: jest.fn()
    };
});
