export class JaegerUtilities {
    static genTimestamp() {
        return Date.now() * 1000;
    }
    static stripQueryAndFragment(url) {
        return url.split(/[?#]/)[0];
    }
    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    // this should not be done over the native bridge else we end up with delay added to all network requests.
    static uuidv4() {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSmFlZ2VyVXRpbGl0aWVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvSmFlZ2VyL0phZWdlclV0aWxpdGllcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLE9BQU8sZUFBZTtJQUNqQixNQUFNLENBQUMsWUFBWTtRQUN0QixPQUFPLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUVNLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxHQUFXO1FBQzNDLE9BQU8sR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRUQsNEVBQTRFO0lBQzVFLDBHQUEwRztJQUNuRyxNQUFNLENBQUMsTUFBTTtRQUNoQixPQUFPLGtDQUFrQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRTtZQUM3RCxNQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNqQyxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQztZQUMxQyxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDeEIsQ0FBQyxDQUFDLENBQUM7SUFDVCxDQUFDO0NBQ0oifQ==