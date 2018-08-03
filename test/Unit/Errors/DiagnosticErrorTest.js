System.register(["mocha", "chai", "Errors/DiagnosticError"], function (exports_1, context_1) {
    "use strict";
    var chai_1, DiagnosticError_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (DiagnosticError_1_1) {
                DiagnosticError_1 = DiagnosticError_1_1;
            }
        ],
        execute: function () {
            describe('DiagnosticErrorTest', function () {
                describe('with existing error', function () {
                    var originalError;
                    before(function () {
                        originalError = new SyntaxError('foo message');
                    });
                    it('should contain original fields', function () {
                        var diagnosticError = new DiagnosticError_1.DiagnosticError(originalError, {});
                        chai_1.assert.equal(diagnosticError.name, 'SyntaxError');
                        chai_1.assert.equal(diagnosticError.message, 'foo message');
                        chai_1.assert.equal(diagnosticError.stack, originalError.stack);
                    });
                    it('should contain the diagnostic data', function () {
                        var diagnosticError = new DiagnosticError_1.DiagnosticError(originalError, { foo: 'foo1', bar: 'bar2' });
                        // tslint:disable:no-string-literal
                        chai_1.assert.equal(diagnosticError.diagnostic['foo'], 'foo1');
                        chai_1.assert.equal(diagnosticError.diagnostic['bar'], 'bar2');
                        // tslint:enable:no-string-literal
                    });
                    it('should serialize correctly', function () {
                        var diagnosticError = new DiagnosticError_1.DiagnosticError(originalError, { foo: 'foo1', bar: 'bar2' });
                        var result = JSON.stringify(diagnosticError);
                        chai_1.assert.notEqual(result.indexOf('"name":"SyntaxError"'), -1);
                        chai_1.assert.notEqual(result.indexOf('"message":"foo message"'), -1);
                        chai_1.assert.notEqual(result.indexOf('"diagnostic":{"foo":"foo1","bar":"bar2"}'), -1);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlhZ25vc3RpY0Vycm9yVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNFcnJvclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7OztZQUlBLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRTtnQkFDNUIsUUFBUSxDQUFDLHFCQUFxQixFQUFFO29CQUM1QixJQUFJLGFBQW9CLENBQUM7b0JBRXpCLE1BQU0sQ0FBQzt3QkFDSCxhQUFhLEdBQUcsSUFBSSxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ25ELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxnQ0FBZ0MsRUFBRTt3QkFDakMsSUFBTSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQzt3QkFFL0QsYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO3dCQUNsRCxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ3JELGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLEtBQUssRUFBRSxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzdELENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxvQ0FBb0MsRUFBRTt3QkFDckMsSUFBTSxlQUFlLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLGFBQWEsRUFBRSxFQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7d0JBRXZGLG1DQUFtQzt3QkFDbkMsYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO3dCQUN4RCxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQ3hELGtDQUFrQztvQkFDdEMsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLDRCQUE0QixFQUFFO3dCQUM3QixJQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsYUFBYSxFQUFFLEVBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFDLENBQUMsQ0FBQzt3QkFDdkYsSUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQzt3QkFFL0MsYUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDNUQsYUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLHlCQUF5QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDL0QsYUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDcEYsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9