import { WebViewError } from 'Core/Errors/WebViewError';
export class RequestError extends WebViewError {
    constructor(message, nativeRequest, nativeResponse) {
        super(message);
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmVxdWVzdEVycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvRXJyb3JzL1JlcXVlc3RFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHeEQsTUFBTSxPQUFPLFlBQWEsU0FBUSxZQUFZO0lBSzFDLFlBQVksT0FBZSxFQUFFLGFBQXNCLEVBQUUsY0FBZ0M7UUFDakYsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ2YsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7UUFDbkMsSUFBSSxDQUFDLGNBQWMsR0FBRyxjQUFjLENBQUM7SUFDekMsQ0FBQztDQUNKIn0=