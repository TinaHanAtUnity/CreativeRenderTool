/**
 * This is a Tencent specific utilities collection
 */
import { Tap } from 'Core/Utilities/Tap';
import { MacroUtil } from 'Ads/Utilities/MacroUtil';

export class TencentUtils {
    public static replaceClickThroughMacro(url: string, tap: Tap | undefined): string {
        let x: string;
        let y: string;
        if (!tap) {
            // according to Tencent requirement, if there is no valid position value, we should use -999 instead
            x = '-999';
            y = '-999';
        } else {
            x = Math.round(tap.getTouchStartPosition().startX).toString();
            y = Math.round(tap.getTouchStartPosition().startY).toString();
        }
        const screenWidth = screen.width.toString();
        const screenHeight = screen.height.toString();
        const macroMap = {
            '__REQ_WIDTH__': screenWidth,
            '__WIDTH__': screenWidth,
            '__REQ_HEIGHT__': screenHeight,
            '__HEIGHT__': screenHeight,
            '__DOWN_X__': x,
            '__UP_X__': x,
            '__DOWN_Y__': y,
            '__UP_Y__': y
        };
        return MacroUtil.replaceMacro(url, macroMap);
    }
}
