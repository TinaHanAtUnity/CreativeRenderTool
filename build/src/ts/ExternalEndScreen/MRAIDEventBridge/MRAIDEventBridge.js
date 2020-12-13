export class MRAIDEventBridge {
    constructor(handler, core) {
        this._handler = handler;
        this._core = core;
        this.start();
    }
    sendViewableEvent(viewable) {
        this.postMessage('viewable', viewable);
    }
    sendResizeEvent(width, height) {
        this.postMessage('resize', { width: width, height: height });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURFdmVudEJyaWRnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9FeHRlcm5hbEVuZFNjcmVlbi9NUkFJREV2ZW50QnJpZGdlL01SQUlERXZlbnRCcmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU0EsTUFBTSxPQUFnQixnQkFBZ0I7SUFJbEMsWUFBWSxPQUFpQyxFQUFFLElBQWM7UUFDekQsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFFbEIsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFNTSxpQkFBaUIsQ0FBQyxRQUFpQjtRQUN0QyxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sZUFBZSxDQUFDLEtBQWEsRUFBRSxNQUFjO1FBQ2hELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQztJQUNqRSxDQUFDO0NBR0oifQ==