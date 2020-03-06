import { SdkDetectionInfo as Base } from '../SdkDetectionInfo';

export type SdkDetectionInfoMock = Base & {
};

export const Purchasing = jest.fn(() => {
    return <SdkDetectionInfoMock>{};
});
