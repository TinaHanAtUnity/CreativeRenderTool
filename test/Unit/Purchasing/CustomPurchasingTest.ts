import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { CustomPurchasingApi, CustomPurchasingEvent } from 'Purchasing/Native/CustomPurchasing';
import { ITransactionErrorDetails } from 'Purchasing/PurchasingAdapter';

describe('CustomPurchasingApi', () => {

    let nativeBridge: NativeBridge;
    let customPurchasingApi: CustomPurchasingApi;

    beforeEach(() => {
        nativeBridge = sinon.createStubInstance(NativeBridge);
        customPurchasingApi = new CustomPurchasingApi(nativeBridge);
    });

    describe('handleEvent', () => {

        describe('TRANSACTION_ERROR', () => {

            const tests: Array<{
                input: ITransactionErrorDetails;
                output: ITransactionErrorDetails;
            }> = [
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'GOOGLE_PLAY',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'GooglePlay',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'NOT_SPECIFIED',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'NotSpecified',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'AMAZON_APP_STORE',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'AmazonAppStore',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'CLOUD_MOOLAH',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'CloudMoolah',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'SAMSUNG_APPS',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'SamsungApps',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'XIAOMI_MI_PAY',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'XiaomiMiPay',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'MAC_APP_STORE',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'MacAppStore',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'APPLE_APP_STORE',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'AppleAppStore',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'WIN_RT',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'WinRT',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'TIZEN_STORE',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'TizenStore',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'FACEBOOK_STORE',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'FacebookStore',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                },
                {
                    input: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'garbage',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    },
                    output: {
                        transactionError: 'SERVER_ERROR',
                        exceptionMessage: 'test exception',
                        store: 'NotSpecified',
                        storeSpecificErrorCode: 'test google error',
                        extras: {
                            testKey: 'testValue'
                        }
                    }
                }
            ];
            tests.forEach((test) => {
                it (`input.store : ${test.input.store} should trigger onTransactionError with correct output.store : ${test.output.store}`, () => {
                    return new Promise((resolve, reject) => {
                        customPurchasingApi.onTransactionError.subscribe((outputDetails) => {
                            assert.deepEqual(test.output, outputDetails, `expected : ${JSON.stringify(test.output)}\ngot : ${JSON.stringify(outputDetails)}`);
                            resolve();
                        });
                        customPurchasingApi.handleEvent(CustomPurchasingEvent[CustomPurchasingEvent.TRANSACTION_ERROR], [test.input]);
                    });
                });
            });
        });

    });
});
