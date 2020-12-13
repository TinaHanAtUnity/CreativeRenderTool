import { MacroUtil } from 'Ads/Utilities/MacroUtil';
export class TencentUtils {
    static replaceClickThroughMacro(url, tap) {
        let x;
        let y;
        if (!tap) {
            // according to Tencent requirement, if there is no valid position value, we should use -999 instead
            x = '-999';
            y = '-999';
        }
        else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZBU1QvVXRpbGl0aWVzL1RlbmNlbnRVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFcEQsTUFBTSxPQUFPLFlBQVk7SUFDZCxNQUFNLENBQUMsd0JBQXdCLENBQUMsR0FBVyxFQUFFLEdBQW9CO1FBQ3BFLElBQUksQ0FBUyxDQUFDO1FBQ2QsSUFBSSxDQUFTLENBQUM7UUFDZCxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ04sb0dBQW9HO1lBQ3BHLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDWCxDQUFDLEdBQUcsTUFBTSxDQUFDO1NBQ2Q7YUFBTTtZQUNILENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQzlELENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ2pFO1FBQ0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUM1QyxNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQzlDLE1BQU0sUUFBUSxHQUFHO1lBQ2IsZUFBZSxFQUFFLFdBQVc7WUFDNUIsV0FBVyxFQUFFLFdBQVc7WUFDeEIsZ0JBQWdCLEVBQUUsWUFBWTtZQUM5QixZQUFZLEVBQUUsWUFBWTtZQUMxQixZQUFZLEVBQUUsQ0FBQztZQUNmLFVBQVUsRUFBRSxDQUFDO1lBQ2IsWUFBWSxFQUFFLENBQUM7WUFDZixVQUFVLEVBQUUsQ0FBQztTQUNoQixDQUFDO1FBQ0YsT0FBTyxTQUFTLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUNqRCxDQUFDO0NBQ0oifQ==