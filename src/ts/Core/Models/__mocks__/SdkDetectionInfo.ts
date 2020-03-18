import { SdkDetectionInfo as Base } from '../SdkDetectionInfo';

export type SdkDetectionInfoMock = Base & {
    isMadeWithUnity: jest.Mock<boolean>;
};

export const SdkDetectionInfo = jest.fn(() => {
    return <SdkDetectionInfoMock>{
        isMadeWithUnity: jest.fn().mockReturnValue(false)
    };
});
