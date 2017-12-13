import * as $protobuf from "protobufjs";

/** Namespace unity_proto. */
export namespace unity_proto {

    /** Properties of an UnityProto. */
    interface IUnityProto {

        /** UnityProto encryptedBlobs */
        encryptedBlobs?: Uint8Array[];

        /** UnityProto encryptionMethod */
        encryptionMethod?: unity_proto.UnityProto.EncryptionMethod;

        /** UnityProto protoName */
        protoName?: unity_proto.UnityProto.ProtoName;
    }

    /** Represents an UnityProto. */
    class UnityProto {

        /**
         * Constructs a new UnityProto.
         * @param [properties] Properties to set
         */
        constructor(properties?: unity_proto.IUnityProto);

        /** UnityProto encryptedBlobs. */
        public encryptedBlobs: Uint8Array[];

        /** UnityProto encryptionMethod. */
        public encryptionMethod: unity_proto.UnityProto.EncryptionMethod;

        /** UnityProto protoName. */
        public protoName: unity_proto.UnityProto.ProtoName;

        /**
         * Creates a new UnityProto instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnityProto instance
         */
        public static create(properties?: unity_proto.IUnityProto): unity_proto.UnityProto;

        /**
         * Encodes the specified UnityProto message. Does not implicitly {@link unity_proto.UnityProto.verify|verify} messages.
         * @param message UnityProto message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: unity_proto.IUnityProto, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UnityProto message, length delimited. Does not implicitly {@link unity_proto.UnityProto.verify|verify} messages.
         * @param message UnityProto message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: unity_proto.IUnityProto, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UnityProto message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UnityProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): unity_proto.UnityProto;

        /**
         * Decodes an UnityProto message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UnityProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): unity_proto.UnityProto;

        /**
         * Verifies an UnityProto message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UnityProto message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UnityProto
         */
        public static fromObject(object: { [k: string]: any }): unity_proto.UnityProto;

        /**
         * Creates a plain object from an UnityProto message. Also converts values to other types if specified.
         * @param message UnityProto
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: unity_proto.UnityProto, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UnityProto to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace UnityProto {

        /** EncryptionMethod enum. */
        enum EncryptionMethod {
            UNENCRYPTED = 3
        }

        /** ProtoName enum. */
        enum ProtoName {
            UNITY_INFO = 2
        }
    }

    /** Properties of an UnityInfo. */
    interface IUnityInfo {

        /** UnityInfo field_1 */
        field_1?: string;

        /** UnityInfo field_2 */
        field_2?: (number|Long);

        /** UnityInfo field_3 */
        field_3?: (number|Long);

        /** UnityInfo field_4 */
        field_4?: (number|Long);

        /** UnityInfo field_5 */
        field_5?: (number|Long);

        /** UnityInfo field_6 */
        field_6?: (number|Long);

        /** UnityInfo field_7 */
        field_7?: (number|Long);

        /** UnityInfo field_8 */
        field_8?: (number|Long);

        /** UnityInfo field_9 */
        field_9?: (number|Long);

        /** UnityInfo field_10 */
        field_10?: (number|Long);

        /** UnityInfo field_11 */
        field_11?: (number|Long);

        /** UnityInfo field_12 */
        field_12?: (number|Long);

        /** UnityInfo field_13 */
        field_13?: (number|Long);

        /** UnityInfo field_14 */
        field_14?: boolean;

        /** UnityInfo field_15 */
        field_15?: (number|Long);

        /** UnityInfo field_16 */
        field_16?: (number|Long);

        /** UnityInfo field_17 */
        field_17?: (number|Long);

        /** UnityInfo field_18 */
        field_18?: (number|Long);

        /** UnityInfo field_19 */
        field_19?: (number|Long);

        /** UnityInfo field_20 */
        field_20?: (number|Long);

        /** UnityInfo field_21 */
        field_21?: (number|Long);

        /** UnityInfo field_22 */
        field_22?: (number|Long);

        /** UnityInfo field_23 */
        field_23?: string;

        /** UnityInfo field_24 */
        field_24?: (number|Long);

        /** UnityInfo field_25 */
        field_25?: (number|Long);

        /** UnityInfo field_26 */
        field_26?: (number|Long);

        /** UnityInfo field_27 */
        field_27?: (number|Long);

        /** UnityInfo field_28 */
        field_28?: (number|Long);

        /** UnityInfo field_29 */
        field_29?: (number|Long);

        /** UnityInfo field_30 */
        field_30?: (number|Long);

        /** UnityInfo field_31 */
        field_31?: (number|Long);

        /** UnityInfo field_32 */
        field_32?: boolean;

        /** UnityInfo field_33 */
        field_33?: (number|Long);

        /** UnityInfo field_34 */
        field_34?: (number|Long);

        /** UnityInfo field_35 */
        field_35?: (number|Long);

        /** UnityInfo field_36 */
        field_36?: (number|Long);

        /** UnityInfo field_37 */
        field_37?: string;

        /** UnityInfo field_38 */
        field_38?: string;

        /** UnityInfo field_39 */
        field_39?: string;

        /** UnityInfo field_40 */
        field_40?: (number|Long);

        /** UnityInfo field_41 */
        field_41?: string;

        /** UnityInfo field_42 */
        field_42?: string;

        /** UnityInfo field_43 */
        field_43?: (number|Long);

        /** UnityInfo field_44 */
        field_44?: (number|Long);

        /** UnityInfo field_45 */
        field_45?: (number|Long);

        /** UnityInfo field_46 */
        field_46?: (number|Long);

        /** UnityInfo field_47 */
        field_47?: (number|Long);

        /** UnityInfo field_48 */
        field_48?: (number|Long);

        /** UnityInfo field_49 */
        field_49?: (number|Long);

        /** UnityInfo field_50 */
        field_50?: (number|Long);
    }

    /** Represents an UnityInfo. */
    class UnityInfo {

        /**
         * Constructs a new UnityInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: unity_proto.IUnityInfo);

        /** UnityInfo field_1. */
        public field_1: string;

        /** UnityInfo field_2. */
        public field_2: (number|Long);

        /** UnityInfo field_3. */
        public field_3: (number|Long);

        /** UnityInfo field_4. */
        public field_4: (number|Long);

        /** UnityInfo field_5. */
        public field_5: (number|Long);

        /** UnityInfo field_6. */
        public field_6: (number|Long);

        /** UnityInfo field_7. */
        public field_7: (number|Long);

        /** UnityInfo field_8. */
        public field_8: (number|Long);

        /** UnityInfo field_9. */
        public field_9: (number|Long);

        /** UnityInfo field_10. */
        public field_10: (number|Long);

        /** UnityInfo field_11. */
        public field_11: (number|Long);

        /** UnityInfo field_12. */
        public field_12: (number|Long);

        /** UnityInfo field_13. */
        public field_13: (number|Long);

        /** UnityInfo field_14. */
        public field_14: boolean;

        /** UnityInfo field_15. */
        public field_15: (number|Long);

        /** UnityInfo field_16. */
        public field_16: (number|Long);

        /** UnityInfo field_17. */
        public field_17: (number|Long);

        /** UnityInfo field_18. */
        public field_18: (number|Long);

        /** UnityInfo field_19. */
        public field_19: (number|Long);

        /** UnityInfo field_20. */
        public field_20: (number|Long);

        /** UnityInfo field_21. */
        public field_21: (number|Long);

        /** UnityInfo field_22. */
        public field_22: (number|Long);

        /** UnityInfo field_23. */
        public field_23: string;

        /** UnityInfo field_24. */
        public field_24: (number|Long);

        /** UnityInfo field_25. */
        public field_25: (number|Long);

        /** UnityInfo field_26. */
        public field_26: (number|Long);

        /** UnityInfo field_27. */
        public field_27: (number|Long);

        /** UnityInfo field_28. */
        public field_28: (number|Long);

        /** UnityInfo field_29. */
        public field_29: (number|Long);

        /** UnityInfo field_30. */
        public field_30: (number|Long);

        /** UnityInfo field_31. */
        public field_31: (number|Long);

        /** UnityInfo field_32. */
        public field_32: boolean;

        /** UnityInfo field_33. */
        public field_33: (number|Long);

        /** UnityInfo field_34. */
        public field_34: (number|Long);

        /** UnityInfo field_35. */
        public field_35: (number|Long);

        /** UnityInfo field_36. */
        public field_36: (number|Long);

        /** UnityInfo field_37. */
        public field_37: string;

        /** UnityInfo field_38. */
        public field_38: string;

        /** UnityInfo field_39. */
        public field_39: string;

        /** UnityInfo field_40. */
        public field_40: (number|Long);

        /** UnityInfo field_41. */
        public field_41: string;

        /** UnityInfo field_42. */
        public field_42: string;

        /** UnityInfo field_43. */
        public field_43: (number|Long);

        /** UnityInfo field_44. */
        public field_44: (number|Long);

        /** UnityInfo field_45. */
        public field_45: (number|Long);

        /** UnityInfo field_46. */
        public field_46: (number|Long);

        /** UnityInfo field_47. */
        public field_47: (number|Long);

        /** UnityInfo field_48. */
        public field_48: (number|Long);

        /** UnityInfo field_49. */
        public field_49: (number|Long);

        /** UnityInfo field_50. */
        public field_50: (number|Long);

        /**
         * Creates a new UnityInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns UnityInfo instance
         */
        public static create(properties?: unity_proto.IUnityInfo): unity_proto.UnityInfo;

        /**
         * Encodes the specified UnityInfo message. Does not implicitly {@link unity_proto.UnityInfo.verify|verify} messages.
         * @param message UnityInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: unity_proto.IUnityInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified UnityInfo message, length delimited. Does not implicitly {@link unity_proto.UnityInfo.verify|verify} messages.
         * @param message UnityInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: unity_proto.IUnityInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an UnityInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns UnityInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): unity_proto.UnityInfo;

        /**
         * Decodes an UnityInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns UnityInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): unity_proto.UnityInfo;

        /**
         * Verifies an UnityInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an UnityInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns UnityInfo
         */
        public static fromObject(object: { [k: string]: any }): unity_proto.UnityInfo;

        /**
         * Creates a plain object from an UnityInfo message. Also converts values to other types if specified.
         * @param message UnityInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: unity_proto.UnityInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this UnityInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
