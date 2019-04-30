import { Platform } from 'Core/Constants/Platform';
import CheetahGamesJson from 'json/custom_features/CheetahGames.json';
import BitmangoGamesJson from 'json/custom_features/BitmangoGames.json';
import Game7GamesJson from 'json/custom_features/Game7Games.json';

import { SliderEndCardExperiment, ABGroup } from 'Core/Models/ABGroup';
import SliderEndScreenImagesJson from 'json/experiments/SliderEndScreenImages.json';

const CheetahGameIds = setGameIds(CheetahGamesJson);
const BitmangoGameIds = setGameIds(BitmangoGamesJson);
const Game7GameIds = setGameIds(Game7GamesJson);

const SliderEndScreenImages = parseSliderEndScreenImages();
const SliderEndScreenTargetGameIds = Object.keys(SliderEndScreenImages);

interface ISliderEndScreenImagesForGame {
    [key: string]: string[];
    'portrait': string[];
    'landscape': string[];
}

function parseSliderEndScreenImages() {
    let images;
    try {
        images = JSON.parse(SliderEndScreenImagesJson);
    } catch {
        images = {};
    }

    return images;
}

function setGameIds(gameIdJson: string): string[] {
    let gameIds: string[];
    try {
        gameIds = JSON.parse(gameIdJson);
    } catch {
        gameIds = [];
    }
    return gameIds;
}

export function matchesMajorOSVersion(majorVersion: number, osVersion: string): boolean {
    const regex = new RegExp(`^${majorVersion}\\.|^${majorVersion}$`);
    return regex.test(osVersion);
}

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isSonicPlayable(creativeId: string | undefined) {
        return  creativeId === '109455881' ||
                creativeId === '109455877' ||
                creativeId === '109091853' ||
                creativeId === '109091754' ||
                creativeId === '114617576' || // Hellfest
                creativeId === '114617336' || // Hellfest
                creativeId === '145941071' || // Miller Lite Fallback
                creativeId === '145940860' || // Miller Lite Fallback
                creativeId === '147367465' || // Carnival Creative
                creativeId === '151099348' ||
                creativeId === '151338976' ||
                creativeId === '151337994' ||
                creativeId === '152919353' ||
                creativeId === '153119177';
    }

    public static isLoopMeSeat(seatId: number | undefined): boolean {
        return seatId === 9119 ||
               seatId === 9121;
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isSimejiJapaneseKeyboardApp(gameId: string): boolean {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }

    public static isCloseIconSkipEnabled(gameId: string) {
        // skip icon is replaced with the close icon
        // Android back button enabled on video overlays for skipping the video ads
        // This is also applied to games by Bitmango and Game7 who requested to toggle same features as Cheetah
        // this should be cleaned once there is proper backend support for these features
        return this.existsInList(CheetahGameIds, gameId)
            || this.existsInList(BitmangoGameIds, gameId)
            || this.existsInList(Game7GameIds, gameId);

    }

    public static isChinaSDK(platform: Platform, versionName: string): boolean {
        return platform === Platform.ANDROID
            && versionName.endsWith('china');
    }

    public static isTimerExpirationExperiment(gameId: string): boolean {
        return gameId === '1453434';
    }

    private static existsInList(gameIdList: string[], gameId: string): boolean {
        return gameIdList.indexOf(gameId) !== -1;
    }

    public static shouldSampleAtOnePercent(): boolean {
        // will only return true when Math.random returns 0
        if (Math.floor(Math.random() * 100) % 100 === 0) {
            return true;
        } else {
            return false;
        }
    }

    public static shouldSampleAtTenPercent(): boolean {
        // will only return true when Math.random returns 1
        if (Math.floor(Math.random() * 10) % 10 === 1) {
            return true;
        } else {
            return false;
        }
    }

    public static isUnsupportedOMVendor(resourceUrl: string) {
        return false;
    }

    public static isSliderEndScreenEnabled(abGroup: ABGroup, targetGameAppStoreId: string, osVersion: string, platform: Platform): boolean {
        const isAndroid4 = platform === Platform.ANDROID && matchesMajorOSVersion(4, osVersion);
        const isIOS7 = platform === Platform.IOS && matchesMajorOSVersion(7, osVersion);
        const isIOS8 = platform === Platform.IOS && matchesMajorOSVersion(8, osVersion);

        // Exclude Android 4 and iOS 7 & 8 devices from the test because of layout issues
        if (isAndroid4 || isIOS7 || isIOS8) {
            return false;
        }

        return SliderEndCardExperiment.isValid(abGroup) && this.existsInList(SliderEndScreenTargetGameIds, '' + targetGameAppStoreId);
    }

    public static getSliderEndScreenImagesForGame(targetGameAppStoreId: string): ISliderEndScreenImagesForGame {
        return SliderEndScreenImages[targetGameAppStoreId];
    }
}
