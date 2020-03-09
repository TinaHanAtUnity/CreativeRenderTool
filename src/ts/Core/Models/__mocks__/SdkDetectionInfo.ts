import { SdkDetectionInfo as Base } from '../SdkDetectionInfo';

export type SdkDetectionInfoMock = Base & {
};

export const SdkDetectionInfo = jest.fn(() => {
    return <SdkDetectionInfoMock>{};
});
