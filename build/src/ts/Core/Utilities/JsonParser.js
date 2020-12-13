import { DiagnosticError } from 'Core/Errors/DiagnosticError';
export class JsonParser {
    static parse(text, reviver) {
        try {
            return JSON.parse(text, reviver);
        }
        catch (e) {
            throw new DiagnosticError(e, { json: text });
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSnNvblBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL1V0aWxpdGllcy9Kc29uUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUU5RCxNQUFNLE9BQU8sVUFBVTtJQUVaLE1BQU0sQ0FBQyxLQUFLLENBQXVDLElBQVksRUFBRSxPQUFtRDtRQUN2SCxJQUFJO1lBQ0EsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNwQztRQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ1IsTUFBTSxJQUFJLGVBQWUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNoRDtJQUVMLENBQUM7Q0FDSiJ9