import { WebViewError } from 'Core/Errors/WebViewError';
export class DiagnosticError extends WebViewError {
    constructor(error, diagnosticData) {
        super(error.message, error.name);
        this.diagnostic = {};
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlhZ25vc3RpY0Vycm9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvRXJyb3JzL0RpYWdub3N0aWNFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsWUFBWTtJQUs3QyxZQUFZLEtBQVksRUFBRSxjQUF5QztRQUMvRCxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFKOUIsZUFBVSxHQUE4QixFQUFFLENBQUM7UUFLOUMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1FBQ3pCLElBQUksQ0FBQyxVQUFVLEdBQUcsY0FBYyxDQUFDO0lBQ3JDLENBQUM7Q0FFSiJ9