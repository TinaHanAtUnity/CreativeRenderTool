const puppeteer = require("puppeteer");

const SERVER_ADDRESS = "http://localhost:8000/build/browser/index.html?headless=1";
const SCREEN_VIEWPORT_PROP = {width: 1024, height: 1280};
const TEST_TIMEOUT = 30000;
const ERROR_MSG_WAIT_TIME = 1000;

const REQUIRED_MESSAGES = [
    {description: "Configuration Request",
        regexp: new RegExp(/Requesting configuration from.*/),
        seen: 0,
        expected: 1,
        matchedMessages: []},
    {description: "Configuration Response",
        regexp: new RegExp(/Received configuration with 2 placements for gamer /),
        seen: 0,
        expected: 1,
        matchedMessages: []},
    {description: "Placement State Changed incentivizedZone",
        regexp:  new RegExp(/onUnityAdsPlacementStateChanged: incentivizedZone NOT_AVAILABLE -> WAITING/),
        seen: 0,
        expected: 1,
        matchedMessages: []},
    {description: "Placement State Changed defaultVideoAndPictureZone",
        regexp:  new RegExp(/onUnityAdsPlacementStateChanged: defaultVideoAndPictureZone NOT_AVAILABLE -> WAITING/),
        seen: 0,
        expected: 1,
        matchedMessages: []}];

const FORBIDDEN_MESSAGES = [
    {description: "Warnings",
        regexp: new RegExp(/warning/i),
        seen: 0,
        matchedMessages: []}];

const ALL_MESSAGES = REQUIRED_MESSAGES.concat(FORBIDDEN_MESSAGES);

// Returns true if all expected messages have been seen
const checkMessage = (message) => {
    let allMatched = true;
    ALL_MESSAGES.forEach( (msgObj) => {
        if(message.match(msgObj.regexp)) {
            msgObj.seen += 1;
            msgObj.matchedMessages.push(message);
        }
        if(!msgObj.expected) {
            return;
        }
        if(msgObj.seen !== msgObj.expected) {
            allMatched = false;
        }
    });
    return allMatched;
};

// Returns count of failed steps (max 99)
const evaluateSuccess = () => {
    let passedSteps = 0;
    let totalSteps = 0;
    REQUIRED_MESSAGES.forEach( (reqMsg) => {
        totalSteps += 1;
        if(reqMsg.seen === reqMsg.expected) {
            passedSteps += 1;
            console.log("pass " + reqMsg.description + ": Was seen " + reqMsg.seen + " times");
        } else {
            console.log("FAIL " + reqMsg.description + ": Was seen " + reqMsg.seen + " times, expected " + reqMsg.expected);
        }
    });
    FORBIDDEN_MESSAGES.forEach( (forbiddenMsg) => {
        totalSteps += 1;
        if(forbiddenMsg.seen > 0) {
            console.log("FAIL " + forbiddenMsg.description + ": Was seen " + forbiddenMsg.seen + " times " +
                JSON.stringify(forbiddenMsg.matchedMessages));
        } else {
            passedSteps += 1;
            console.log("pass " + forbiddenMsg.description + ": Was not seen");
        }
    });
    const failedSteps = totalSteps - passedSteps;
    console.log("Total steps: " + totalSteps + ". Passed steps: " + passedSteps + ". Failed steps: " + failedSteps + ".");
    if(failedSteps > 99) {
        return 99;
    }
    return failedSteps;
};

puppeteer.launch().then(async (browser) => {
    let testRunning = true;
    console.log("### Browser Tests ###");

    const page = await browser.newPage();
    await page.setViewport(SCREEN_VIEWPORT_PROP);
    await page.goto(SERVER_ADDRESS).catch( (e) => {
        console.log("## Failed to connect to server at " + SERVER_ADDRESS);
        console.log("   Consider running `make clean build-browser start-nginx");
        process.exit(255);
    });
    console.log("## Page loaded");
    console.log("## Start test");

    let allMessagesResolve;
    let timeOutPromise = new Promise( (resolve, reject) => {
        allMessagesResolve = resolve;
        setTimeout(reject, TEST_TIMEOUT);
    });
    page.on("console", (message) => {
        console.log("* Browser output: " + message.text);
        if(checkMessage(message.text)) {
            if(!testRunning) {
                return;
            }
            testRunning = false;
            console.log("## Test end: All expected events have been seen");
            allMessagesResolve();
        }
    });
    await timeOutPromise.catch( () => {
        console.log("## Timeout after " + TEST_TIMEOUT + "ms, ");
    });

    console.log("## Waiting " + ERROR_MSG_WAIT_TIME + "ms for forbidden messages");
    await new Promise((resolve) => setTimeout(resolve, ERROR_MSG_WAIT_TIME));
    console.log("## Done");

    await browser.close();
    process.exit(evaluateSuccess())
});
