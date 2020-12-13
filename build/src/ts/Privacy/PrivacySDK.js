import { PrivacyTestEnvironment } from 'Privacy/PrivacyTestEnvironment';
export class PrivacySDK {
    constructor(gamePrivacy, userPrivacy, gdprEnabled, ageGateLimit, legalFramework, useUnityAttDialog) {
        this._gamePrivacy = gamePrivacy;
        this._userPrivacy = userPrivacy;
        this._gdprEnabled = gdprEnabled;
        this._ageGateLimit = ageGateLimit;
        this._legalFramework = legalFramework;
        this._useUnityAttDialog = useUnityAttDialog;
    }
    getGamePrivacy() {
        return this._gamePrivacy;
    }
    getUserPrivacy() {
        return this._userPrivacy;
    }
    isGDPREnabled() {
        return this._gdprEnabled;
    }
    setGDPREnabled(enabled) {
        this._gdprEnabled = enabled;
    }
    isOptOutRecorded() {
        return this._userPrivacy.isRecorded();
    }
    isOptOutEnabled() {
        if (!this.isOptOutRecorded()) {
            return false;
        }
        return !this._userPrivacy.getPermissions().ads;
    }
    isAgeGateEnabled() {
        if (this._ageGateLimit > 0) {
            return true;
        }
        return false;
    }
    getAgeGateLimit() {
        return this._ageGateLimit;
    }
    getLegalFramework() {
        return PrivacyTestEnvironment.isSet('legalFramework') ?
            PrivacyTestEnvironment.get('legalFramework') : this._legalFramework;
    }
    isUnityAttDialog() {
        return this._useUnityAttDialog;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVNESy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9Qcml2YWN5L1ByaXZhY3lTREsudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFFeEUsTUFBTSxPQUFPLFVBQVU7SUFRbkIsWUFBWSxXQUF3QixFQUFFLFdBQXdCLEVBQUUsV0FBb0IsRUFBRSxZQUFvQixFQUFFLGNBQThCLEVBQUUsaUJBQTBCO1FBQ2xLLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxZQUFZLEdBQUcsV0FBVyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1FBQ2xDLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxpQkFBaUIsQ0FBQztJQUNoRCxDQUFDO0lBRU0sY0FBYztRQUNqQixPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDN0IsQ0FBQztJQUVNLGNBQWM7UUFDakIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQzdCLENBQUM7SUFFTSxhQUFhO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztJQUM3QixDQUFDO0lBRU0sY0FBYyxDQUFDLE9BQWdCO1FBQ2xDLElBQUksQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLENBQUM7SUFFTSxnQkFBZ0I7UUFDbkIsT0FBTyxJQUFJLENBQUMsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO0lBQzFDLENBQUM7SUFFTSxlQUFlO1FBQ2xCLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsRUFBRTtZQUMxQixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUNuRCxDQUFDO0lBRU0sZ0JBQWdCO1FBQ25CLElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDeEIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFFTSxlQUFlO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRU0saUJBQWlCO1FBQ3BCLE9BQU8sc0JBQXNCLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztZQUNuRCxzQkFBc0IsQ0FBQyxHQUFHLENBQWlCLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUM7SUFDNUYsQ0FBQztJQUVNLGdCQUFnQjtRQUNuQixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQztJQUNuQyxDQUFDO0NBQ0oifQ==