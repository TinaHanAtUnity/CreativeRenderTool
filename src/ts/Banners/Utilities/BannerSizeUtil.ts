import { IErrorLogger } from 'Core/Native/Sdk';

export interface IBannerDimensions {
    w: number;
    h: number;
}

export const BannerSizeStandardDimensions: IBannerDimensions = {
    w: 320,
    h: 50
};

export const BannerSizeLeaderboardDimensions: IBannerDimensions = {
    w: 728,
    h: 90
};

export const BannerSizeIABStandardDimensions: IBannerDimensions = {
    w: 468,
    h: 60
};

export class BannerSizeUtil {

    public static getBannerSizeFromWidthAndHeight(width: number, height: number, errorLogger: IErrorLogger): IBannerDimensions {
        if (width >= BannerSizeLeaderboardDimensions.w && height >= BannerSizeLeaderboardDimensions.h) {
            return BannerSizeLeaderboardDimensions;
        } else if (width >= BannerSizeIABStandardDimensions.w && height >= BannerSizeIABStandardDimensions.h) {
            return BannerSizeIABStandardDimensions;
        } else if (width >= BannerSizeStandardDimensions.w && height >= BannerSizeStandardDimensions.h) {
            return BannerSizeStandardDimensions;
        } else {
            errorLogger.logError(`Invalid Banner size of ${width}(width) ${height}(height) was given to Unity Ads Sdk, defaulting to minimum size 320x50`);
            return BannerSizeStandardDimensions;
        }
    }

}
