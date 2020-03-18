import { DeviceInfo as Base } from 'Core/Models/DeviceInfo';

export type DeviceInfoMock = Base & {
    getOsVersion: jest.Mock;
    isChineseNetworkOperator: jest.Mock<boolean>;
};

export const DeviceInfo = jest.fn(() => {
    return <DeviceInfoMock><unknown>{ // TODO: Remove unknown cast
        getAdvertisingIdentifier: jest.fn().mockImplementation(() => ''),
        getLimitedAdTracking: jest.fn().mockImplementation(() => false),
        getModel: jest.fn().mockImplementation(() => ''),
        getNetworkType: jest.fn().mockImplementation(() => Promise.resolve(0)),
        getNetworkOperator: jest.fn().mockImplementation(() => Promise.resolve(null)),
        getNetworkOperatorName: jest.fn().mockImplementation(() => Promise.resolve(null)),
        getOsVersion: jest.fn().mockImplementation(() => ''),
        getScreenWidth: jest.fn().mockImplementation(() => Promise.resolve(567)),
        getScreenHeight: jest.fn().mockImplementation(() => Promise.resolve(1234)),
        isRooted: jest.fn().mockImplementation(() => false),
        isMadeWithUnity: jest.fn().mockImplementation(() => false),
        getConnectionType: jest.fn().mockImplementation(() => Promise.resolve('')),
        getTimeZone: jest.fn().mockImplementation(() => ''),
        getFreeSpace: jest.fn().mockImplementation(() => Promise.resolve(123456789)),
        getTotalSpace: jest.fn().mockImplementation(() => Promise.resolve(12345678)),
        getLanguage: jest.fn().mockImplementation(() => 'en_US'),
        getHeadset: jest.fn().mockImplementation(() => Promise.resolve(false)),
        getDeviceVolume: jest.fn().mockImplementation(() => Promise.resolve(1)),
        checkIsMuted: jest.fn().mockImplementation(() => Promise.resolve()),
        getScreenBrightness: jest.fn().mockImplementation(() => Promise.resolve(100)),
        getBatteryLevel: jest.fn().mockImplementation(() => Promise.resolve(0.5)),
        getBatteryStatus: jest.fn().mockImplementation(() => Promise.resolve(1)),
        getFreeMemory: jest.fn().mockImplementation(() => Promise.resolve(1234567)),
        getTotalMemory: jest.fn().mockImplementation(() => Promise.resolve(12345678)),
        getDTO: jest.fn().mockImplementation(() => Promise.resolve({})),
        getAnonymousDTO: jest.fn().mockImplementation(() => Promise.resolve({})),
        getStaticDTO: jest.fn().mockImplementation(() => Promise.resolve({})),
        getAnonymousStaticDTO: jest.fn().mockImplementation(() => Promise.resolve({})),
        isChineseNetworkOperator: jest.fn().mockImplementation(() => false),
        getLimitAdTracking: jest.fn().mockReturnValue(false),
        getStores: jest.fn().mockReturnValue('')
    };
});
