export class Intent {

    public static launch(intentData: any) {
        if('uri' in intentData) {
            window.open(intentData.uri);
        }
    }

}
