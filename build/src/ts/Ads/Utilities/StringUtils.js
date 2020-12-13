export class StringUtils {
    // </charcters/> ... <//characters/>
    static startWithHTMLTag(markup) {
        const checkResult = this._htmlOpenTag.exec(markup);
        if (checkResult) {
            return checkResult.index === 0;
        }
        return false;
    }
}
StringUtils._htmlOpenTag = /<[^>]*>/;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RyaW5nVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9TdHJpbmdVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxNQUFNLE9BQU8sV0FBVztJQUdwQixvQ0FBb0M7SUFDN0IsTUFBTSxDQUFDLGdCQUFnQixDQUFDLE1BQWM7UUFDekMsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDbkQsSUFBSSxXQUFXLEVBQUU7WUFDYixPQUFPLFdBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDO1NBQ2xDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQzs7QUFSYyx3QkFBWSxHQUFXLFNBQVMsQ0FBQyJ9