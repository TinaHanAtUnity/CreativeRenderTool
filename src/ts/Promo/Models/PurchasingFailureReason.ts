
// copied from com.unity.purchasing
export enum PurchasingFailureReason {
    /// <summary>
    /// Purchasing may be disabled in security settings.
    /// </summary>
    PurchasingUnavailable,

    /// <summary>
    /// Another purchase is already in progress.
    /// </summary>
    ExistingPurchasePending,

    /// <summary>
    /// The product was reported unavailable by the purchasing system.
    /// </summary>
    ProductUnavailable,

    /// <summary>
    /// Signature validation of the purchase's receipt failed.
    /// </summary>
    SignatureInvalid,

    /// <summary>
    /// The user opted to cancel rather than proceed with the purchase.
    /// This is not specified on platforms that do not distinguish
    /// cancellation from other failure (Amazon, Microsoft).
    /// </summary>
    UserCancelled,

    /// <summary>
    /// There was a problem with the payment.
    /// This is unique to Apple platforms.
    /// </summary>
    PaymentDeclined,

    /// <summary>
    /// The transaction has already been completed successfully. This error can occur
    /// on Apple platforms if the transaction is finished successfully while the user
    /// is logged out of the app store, using a receipt generated while the user was
    /// logged in.
    /// </summary>
    DuplicateTransaction,

    /// <summary>
    /// A catch all for remaining purchase problems.
    /// </summary>
    Unknown
}
