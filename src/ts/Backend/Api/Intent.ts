export class Intent {

    public static launch(intentData: unknown) {
        if('uri' in intentData) {
            window.open(intentData.uri);
        }
    }

}
