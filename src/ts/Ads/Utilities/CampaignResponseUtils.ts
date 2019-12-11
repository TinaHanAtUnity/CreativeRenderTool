import { ITestCreativePack } from 'Ads/Models/CreativePack';
import { Platform } from 'Core/Constants/Platform';
import { JsonParser } from 'Core/Utilities/JsonParser';
import CreativePackResponseAndroid from 'json/CreativePackResponseAndroid.json';
import CreativePackResponseIos from 'json/CreativePackResponseIos.json';

export class CampaignResponseUtils {
    public static getVideoCreativePackResponse(platform: Platform, creativePack: string): string {
        const json = JsonParser.parse<ITestCreativePack>(creativePack);
        let response: string = '';

        if (platform === Platform.ANDROID) {
            response = JSON.stringify(CreativePackResponseAndroid);
        } else if (platform === Platform.IOS) {
            response = JSON.stringify(CreativePackResponseIos);
        }

        response = response.replace('{ICON_PLACEHOLDER}', json.gameIcon || '');
        response = response.replace('{ENDSCREEN_PLACEHOLDER}', json.endScreen || '');
        response = response.replace('{ENDSCREEN_LANDSCAPE_PLACEHOLDER}', json.endScreenLandscape || '');
        response = response.replace('{ENDSCREEN_PORTRAIT_PLACEHOLDER}', json.endScreenPortrait || '');
        response = response.replace('{TRAILER_DOWNLOADABLE_PLACEHOLDER}', json.trailerDownloadable || '');
        response = response.replace('{TRAILER_DOWNLOADABLE_SIZE}', json.trailerDownloadableSize ? json.trailerDownloadableSize.toString() : '1');
        response = response.replace('{TRAILER_STREAMING_PLACEHOLDER}', json.trailerStreaming || '');
        response = response.replace('{TRAILER_PORTRAIT_DOWNLOADABLE_PLACEHOLDER}', json.trailerPortraitDownloadable || '');
        response = response.replace('{TRAILER_PORTRAIT_DOWNLOADABLE_SIZE}', json.trailerPortraitDownloadableSize ? json.trailerPortraitDownloadableSize.toString() : '1');
        response = response.replace('{TRAILER_PORTRAIT_STREAMING_PLACEHOLDER}', json.trailerPortraitStreaming || '');
        response = response.replace('{APPSTORE_ID_PLACEHOLDER}', json.appStoreId || '');
        response = response.replace('{APPSTORE_NAME_PLACEHOLDER}', json.appStoreName || '');

        return response;
    }
}
