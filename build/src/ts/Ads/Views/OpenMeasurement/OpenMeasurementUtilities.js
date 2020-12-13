import { Platform } from 'Core/Constants/Platform';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { DoubleClickAdmobVendorTags } from 'Ads/Views/OpenMeasurement/OpenMeasurementDataTypes';
export class OpenMeasurementUtilities {
    static getScreenDensity(platform, deviceInfo) {
        if (platform === Platform.ANDROID) {
            return deviceInfo.getScreenDensity();
        }
        return 0;
    }
    /**
     * Used only for sdk 3.2 and below OMID certification
     * Converts html/css generated values to scale with device size based on estimate
     * @param size px size to convert
     * @param density old android density value
     */
    static convertDpToPixels(size, density) {
        return size * (density / 160);
    }
    /**
     * Will be calculated properly for sdk 3.3+
     * Converts pixels from native to estimated DPs using native magic number
     * @param px size to convert
     * @param deviceInfo deviceinfo
     * @param platform Android/IOS
     */
    static pxToDp(px, deviceInfo) {
        return px / deviceInfo.getDisplayMetricDensity();
    }
    /**
     * Used to convert android screenview to dp for admob to
     * enable OM geometry change on all sdk versions
     * @param px pixel size of value
     * @param deviceInfo deviceinfo
     */
    static pxToDpAdmobScreenView(px, deviceInfo) {
        return Math.trunc((px / deviceInfo.getScreenDensity()) * 160);
    }
    static createRectangle(x, y, width, height) {
        return {
            x: x,
            y: y,
            width: width,
            height: height
        };
    }
    static calculateViewPort(screenWidth, screenHeight) {
        return {
            width: screenWidth,
            height: screenHeight
        };
    }
    static calculatePercentageInView(videoRectangle, obstruction, screenRectangle) {
        const adjustedObstruction = this.calculateScreenAdjustedObstruction(obstruction, screenRectangle);
        const obstructionOverlapPercentage = this.calculateObstructionOverlapPercentage(videoRectangle, adjustedObstruction);
        const percentOfVideoInViewPort = this.calculateObstructionOverlapPercentage(videoRectangle, screenRectangle);
        return percentOfVideoInViewPort - obstructionOverlapPercentage;
    }
    static calculateObstructionOverlapPercentage(videoView, obstruction) {
        let obstructionOverlapArea = 0;
        const videoXMin = videoView.x;
        const videoYMin = videoView.y;
        const videoXMax = videoView.x + videoView.width;
        const videoYMax = videoView.y + videoView.height;
        const obstructionXMin = obstruction.x;
        const obstructionYMin = obstruction.y;
        const obstructionXMax = obstruction.x + obstruction.width;
        const obstructionYMax = obstruction.y + obstruction.height;
        const dx = Math.min(videoXMax, obstructionXMax) - Math.max(videoXMin, obstructionXMin);
        const dy = Math.min(videoYMax, obstructionYMax) - Math.max(videoYMin, obstructionYMin);
        if ((dx >= 0) && (dy >= 0)) {
            obstructionOverlapArea = dx * dy;
        }
        const videoArea = videoView.width * videoView.height;
        const obstructionOverlapPercentage = obstructionOverlapArea / videoArea;
        return obstructionOverlapPercentage * 100;
    }
    static calculateScreenAdjustedObstruction(obstruction, screenRectangle) {
        let adjustedObstruction = obstruction;
        const obstructionXMin = obstruction.x;
        const obstructionYMin = obstruction.y;
        const obstructionXMax = obstruction.x + obstruction.width;
        const obstructionYMax = obstruction.y + obstruction.height;
        const screenXMax = screenRectangle.x + screenRectangle.width;
        const screenYMax = screenRectangle.y + screenRectangle.height;
        if (obstructionXMax > screenXMax) {
            adjustedObstruction.width = screenRectangle.width - obstruction.x;
        }
        if (obstructionYMax > screenYMax) {
            adjustedObstruction.height = screenRectangle.height - obstruction.y;
        }
        if (obstructionXMin >= screenXMax || obstructionYMin >= screenYMax) {
            adjustedObstruction = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
            };
        }
        return adjustedObstruction;
    }
    static calculateAdViewVideoWidth(screenWidth, screenHeight, campaign) {
        let videoWidth = screenWidth;
        const isLandscape = screenWidth > screenHeight;
        let campaignVideoWidth = 0;
        // TODO: Will be removed in subsequent refactor
        // The campaign values are not to scale to device
        // But we need a solution like this for fallback OM certification <3.2
        if (campaign instanceof VastCampaign) {
            campaignVideoWidth = campaign.getVideo().getWidth();
        }
        if (!isLandscape && campaignVideoWidth > 0) {
            videoWidth = campaignVideoWidth;
        }
        return videoWidth;
    }
    static calculateAdViewVideoHeight(screenWidth, screenHeight, campaign) {
        let videoHeight = screenHeight;
        const isLandscape = screenWidth > screenHeight;
        let campaignVideoHeight = 0;
        // TODO: Will be removed in subsequent refactor
        // The campaign values are not to scale to device
        // But we need a solution like this for fallback OM certification <3.2
        if (campaign instanceof VastCampaign) {
            campaignVideoHeight = campaign.getVideo().getHeight();
        }
        if (!isLandscape && campaignVideoHeight > 0) {
            videoHeight = campaignVideoHeight;
        }
        return videoHeight;
    }
    static estimateAdViewTopLeftYPostition(videoHeight, screenWidth, screenHeight) {
        let topLeftY = 0;
        const isLandscape = screenWidth > screenHeight;
        if (!isLandscape && videoHeight > 0) {
            const centerpoint = screenHeight / 2;
            topLeftY = centerpoint - (videoHeight / 2);
        }
        return topLeftY;
    }
    static getDcKeyMetricTag(vendor) {
        if (vendor === DoubleClickAdmobVendorTags.SSP) {
            return 'ssp';
        }
        else if (vendor === DoubleClickAdmobVendorTags.DSP) {
            return 'dsp';
        }
        else if (vendor === DoubleClickAdmobVendorTags.Neutral) {
            return 'neut';
        }
        else {
            return 'unknown';
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3Blbk1lYXN1cmVtZW50VXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9WaWV3cy9PcGVuTWVhc3VyZW1lbnQvT3Blbk1lYXN1cmVtZW50VXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUF5QiwwQkFBMEIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBRXZILE1BQU0sT0FBTyx3QkFBd0I7SUFFMUIsTUFBTSxDQUFDLGdCQUFnQixDQUFDLFFBQWtCLEVBQUUsVUFBc0I7UUFDckUsSUFBSSxRQUFRLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUMvQixPQUE0QixVQUFXLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUM5RDtRQUNELE9BQU8sQ0FBQyxDQUFDO0lBQ2IsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLGlCQUFpQixDQUFDLElBQVksRUFBRSxPQUFlO1FBQ3pELE9BQU8sSUFBSSxHQUFHLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRDs7Ozs7O09BTUc7SUFDSSxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQVUsRUFBRSxVQUE2QjtRQUMxRCxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsdUJBQXVCLEVBQUUsQ0FBQztJQUNyRCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxNQUFNLENBQUMscUJBQXFCLENBQUMsRUFBVSxFQUFFLFVBQXNCO1FBQ2xFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsR0FBdUIsVUFBVyxDQUFDLGdCQUFnQixFQUFFLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRU0sTUFB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