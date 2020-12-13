export class UIWebViewBridge {
    handleInvocation(invocations) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleInvocation', true);
        xhr.send(invocations);
    }
    handleCallback(id, status, parameters) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', UIWebViewBridge._nativeUrl + '/handleCallback', true);
        xhr.send('{"id":"' + id + '","status":"' + status + '","parameters":' + parameters + '}');
    }
}
UIWebViewBridge._nativeUrl = 'https://webviewbridge.unityads.unity3d.com';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVUlXZWJWaWV3QnJpZGdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTmF0aXZlL0JyaWRnZS9VSVdlYlZpZXdCcmlkZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsTUFBTSxPQUFPLGVBQWU7SUFJakIsZ0JBQWdCLENBQUMsV0FBbUI7UUFDdkMsTUFBTSxHQUFHLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztRQUNqQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsVUFBVSxHQUFHLG1CQUFtQixFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ3pFLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUVNLGNBQWMsQ0FBQyxFQUFVLEVBQUUsTUFBYyxFQUFFLFVBQW1CO1FBQ2pFLE1BQU0sR0FBRyxHQUFHLElBQUksY0FBYyxFQUFFLENBQUM7UUFDakMsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUN2RSxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLEdBQUcsY0FBYyxHQUFHLE1BQU0sR0FBRyxpQkFBaUIsR0FBRyxVQUFVLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDOUYsQ0FBQzs7QUFaYywwQkFBVSxHQUFHLDRDQUE0QyxDQUFDIn0=