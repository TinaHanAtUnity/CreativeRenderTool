export class VastValidationUtilities {
    static invalidUrlError(description, url) {
        return new Error(`VAST ${description} contains invalid url("${url}")`);
    }
    static formatErrors(errors) {
        return errors.map((error) => {
            return error.message;
        }).join('\n    ');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdFZhbGlkYXRpb25VdGlsaXRpZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9WYWxpZGF0b3JzL1Zhc3RWYWxpZGF0aW9uVXRpbGl0aWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE1BQU0sT0FBTyx1QkFBdUI7SUFFekIsTUFBTSxDQUFDLGVBQWUsQ0FBQyxXQUFtQixFQUFFLEdBQVc7UUFDMUQsT0FBTyxJQUFJLEtBQUssQ0FBQyxRQUFRLFdBQVcsMEJBQTBCLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQUVNLE1BQU0sQ0FBQyxZQUFZLENBQUMsTUFBZTtRQUN0QyxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN4QixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3RCLENBQUM7Q0FFSiJ9