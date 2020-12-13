import { Model } from 'Core/Models/Model';
export var EventType;
(function (EventType) {
    EventType[EventType["START"] = 0] = "START";
    EventType[EventType["FIRST_QUARTILE"] = 1] = "FIRST_QUARTILE";
    EventType[EventType["MIDPOINT"] = 2] = "MIDPOINT";
    EventType[EventType["THIRD_QUARTILE"] = 3] = "THIRD_QUARTILE";
    EventType[EventType["VIEW"] = 4] = "VIEW";
    EventType[EventType["SKIP"] = 5] = "SKIP";
    EventType[EventType["CLICK"] = 6] = "CLICK";
    EventType[EventType["IMPRESSION"] = 7] = "IMPRESSION";
    EventType[EventType["VAST_COMPLETE"] = 8] = "VAST_COMPLETE";
})(EventType || (EventType = {}));
export class Session extends Model {
    constructor(id) {
        super('Session', {
            id: ['string'],
            adPlan: ['string', 'undefined'],
            eventSent: ['object'],
            gameSessionCounters: ['object'],
            privacy: ['object', 'undefined'],
            legacyPrivacy: ['object', 'undefined'],
            deviceFreeSpace: ['number']
        });
        this.set('id', id);
        this.set('eventSent', {});
    }
    getId() {
        return this.get('id');
    }
    getAdPlan() {
        return this.get('adPlan');
    }
    setAdPlan(adPlan) {
        this.set('adPlan', adPlan);
    }
    getEventSent(eventType) {
        const eventSent = this.get('eventSent');
        if (!(eventType in eventSent)) {
            return false;
        }
        return eventSent[eventType];
    }
    setEventSent(eventType) {
        const eventSent = this.get('eventSent');
        if (!(eventType in eventSent)) {
            eventSent[eventType] = true;
        }
        this.set('eventSent', eventSent);
    }
    setGameSessionCounters(gameSessionCounters) {
        this.set('gameSessionCounters', gameSessionCounters);
    }
    getGameSessionCounters() {
        return this.get('gameSessionCounters');
    }
    setPrivacy(privacy) {
        this.set('privacy', privacy);
    }
    getPrivacy() {
        return this.get('privacy');
    }
    setLegacyPrivacy(privacy) {
        this.set('legacyPrivacy', privacy);
    }
    getLegacyPrivacy() {
        return this.get('legacyPrivacy');
    }
    setDeviceFreeSpace(freeSpace) {
        this.set('deviceFreeSpace', freeSpace);
    }
    getDeviceFreeSpace() {
        return this.get('deviceFreeSpace');
    }
    getDTO() {
        return {
            'id': this.getId(),
            'eventSent': this.get('eventSent')
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTW9kZWxzL1Nlc3Npb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSTFDLE1BQU0sQ0FBTixJQUFZLFNBVVg7QUFWRCxXQUFZLFNBQVM7SUFDakIsMkNBQUssQ0FBQTtJQUNMLDZEQUFjLENBQUE7SUFDZCxpREFBUSxDQUFBO0lBQ1IsNkRBQWMsQ0FBQTtJQUNkLHlDQUFJLENBQUE7SUFDSix5Q0FBSSxDQUFBO0lBQ0osMkNBQUssQ0FBQTtJQUNMLHFEQUFVLENBQUE7SUFDViwyREFBYSxDQUFBO0FBQ2pCLENBQUMsRUFWVyxTQUFTLEtBQVQsU0FBUyxRQVVwQjtBQVlELE1BQU0sT0FBTyxPQUFRLFNBQVEsS0FBZTtJQUV4QyxZQUFZLEVBQVU7UUFDbEIsS0FBSyxDQUFDLFNBQVMsRUFBRTtZQUNiLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNkLE1BQU0sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7WUFDL0IsU0FBUyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3JCLG1CQUFtQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQy9CLE9BQU8sRUFBRSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUM7WUFDaEMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFdBQVcsQ0FBQztZQUN0QyxlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUM7U0FDOUIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDbkIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLEtBQUs7UUFDUixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVNLFNBQVM7UUFDWixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVNLFNBQVMsQ0FBQyxNQUFjO1FBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxZQUFZLENBQUMsU0FBb0I7UUFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLEVBQUU7WUFDM0IsT0FBTyxLQUFLLENBQUM7U0FDaEI7UUFDRCxPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sWUFBWSxDQUFDLFNBQW9CO1FBQ3BDLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDeEMsSUFBSSxDQUFDLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxFQUFFO1lBQzNCLFNBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxJQUFJLENBQUM7U0FDL0I7UUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sc0JBQXNCLENBQUMsbUJBQXlDO1FBQ25FLElBQUksQ0FBQyxHQUFHLENBQUMscUJBQXFCLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRU0sc0JBQXNCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSxVQUFVLENBQUMsT0FBeUI7UUFDdkMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakMsQ0FBQztJQUVNLFVBQVU7UUFDYixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDL0IsQ0FBQztJQUVNLGdCQUFnQixDQUFDLE9BQStCO1FBQ25ELElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFTSxrQkFBa0IsQ0FBQyxTQUFpQjtRQUN2QyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzNDLENBQUM7SUFFTSxrQkFBa0I7UUFDckIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDdkMsQ0FBQztJQUVNLE1BQU07UUFDVCxPQUFPO1lBQ0gsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDbEIsV0FBVyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDO1NBQ3JDLENBQUM7SUFDTixDQUFDO0NBQ0oifQ==