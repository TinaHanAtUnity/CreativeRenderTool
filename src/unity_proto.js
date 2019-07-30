/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const unity_proto = $root.unity_proto = (() => {

    /**
     * Namespace unity_proto.
     * @exports unity_proto
     * @namespace
     */
    const unity_proto = {};

    unity_proto.UnityProto = (function() {

        /**
         * Properties of an UnityProto.
         * @memberof unity_proto
         * @interface IUnityProto
         * @property {Array.<Uint8Array>|null} [encryptedBlobs] UnityProto encryptedBlobs
         * @property {unity_proto.UnityProto.EncryptionMethod|null} [encryptionMethod] UnityProto encryptionMethod
         * @property {unity_proto.UnityProto.ProtoName|null} [protoName] UnityProto protoName
         */

        /**
         * Constructs a new UnityProto.
         * @memberof unity_proto
         * @classdesc Represents an UnityProto.
         * @implements IUnityProto
         * @constructor
         * @param {unity_proto.IUnityProto=} [p] Properties to set
         */
        function UnityProto(p) {
            this.encryptedBlobs = [];
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * UnityProto encryptedBlobs.
         * @member {Array.<Uint8Array>} encryptedBlobs
         * @memberof unity_proto.UnityProto
         * @instance
         */
        UnityProto.prototype.encryptedBlobs = $util.emptyArray;

        /**
         * UnityProto encryptionMethod.
         * @member {unity_proto.UnityProto.EncryptionMethod} encryptionMethod
         * @memberof unity_proto.UnityProto
         * @instance
         */
        UnityProto.prototype.encryptionMethod = 3;

        /**
         * UnityProto protoName.
         * @member {unity_proto.UnityProto.ProtoName} protoName
         * @memberof unity_proto.UnityProto
         * @instance
         */
        UnityProto.prototype.protoName = 2;

        /**
         * Encodes the specified UnityProto message. Does not implicitly {@link unity_proto.UnityProto.verify|verify} messages.
         * @function encode
         * @memberof unity_proto.UnityProto
         * @static
         * @param {unity_proto.IUnityProto} m UnityProto message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UnityProto.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.encryptedBlobs != null && m.encryptedBlobs.length) {
                for (var i = 0; i < m.encryptedBlobs.length; ++i)
                    w.uint32(10).bytes(m.encryptedBlobs[i]);
            }
            if (m.protoName != null && m.hasOwnProperty("protoName"))
                w.uint32(24).int32(m.protoName);
            if (m.encryptionMethod != null && m.hasOwnProperty("encryptionMethod"))
                w.uint32(32).int32(m.encryptionMethod);
            return w;
        };

        /**
         * Decodes an UnityProto message from the specified reader or buffer.
         * @function decode
         * @memberof unity_proto.UnityProto
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {unity_proto.UnityProto} UnityProto
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UnityProto.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.unity_proto.UnityProto();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    if (!(m.encryptedBlobs && m.encryptedBlobs.length))
                        m.encryptedBlobs = [];
                    m.encryptedBlobs.push(r.bytes());
                    break;
                case 4:
                    m.encryptionMethod = r.int32();
                    break;
                case 3:
                    m.protoName = r.int32();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        /**
         * EncryptionMethod enum.
         * @name unity_proto.UnityProto.EncryptionMethod
         * @enum {string}
         * @property {number} UNENCRYPTED=3 UNENCRYPTED value
         */
        UnityProto.EncryptionMethod = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[3] = "UNENCRYPTED"] = 3;
            return values;
        })();

        /**
         * ProtoName enum.
         * @name unity_proto.UnityProto.ProtoName
         * @enum {string}
         * @property {number} UNITY_INFO=2 UNITY_INFO value
         */
        UnityProto.ProtoName = (function() {
            const valuesById = {}, values = Object.create(valuesById);
            values[valuesById[2] = "UNITY_INFO"] = 2;
            return values;
        })();

        return UnityProto;
    })();

    unity_proto.UnityInfo = (function() {

        /**
         * Properties of an UnityInfo.
         * @memberof unity_proto
         * @interface IUnityInfo
         * @property {string|null} [field_1] UnityInfo field_1
         * @property {number|Long|null} [field_2] UnityInfo field_2
         * @property {number|Long|null} [field_3] UnityInfo field_3
         * @property {number|Long|null} [field_4] UnityInfo field_4
         * @property {number|Long|null} [field_5] UnityInfo field_5
         * @property {number|Long|null} [field_6] UnityInfo field_6
         * @property {number|Long|null} [field_7] UnityInfo field_7
         * @property {number|Long|null} [field_8] UnityInfo field_8
         * @property {number|Long|null} [field_9] UnityInfo field_9
         * @property {number|Long|null} [field_10] UnityInfo field_10
         * @property {number|Long|null} [field_11] UnityInfo field_11
         * @property {number|Long|null} [field_12] UnityInfo field_12
         * @property {number|Long|null} [field_13] UnityInfo field_13
         * @property {boolean|null} [field_14] UnityInfo field_14
         * @property {number|Long|null} [field_15] UnityInfo field_15
         * @property {number|Long|null} [field_16] UnityInfo field_16
         * @property {number|Long|null} [field_17] UnityInfo field_17
         * @property {number|Long|null} [field_18] UnityInfo field_18
         * @property {number|Long|null} [field_19] UnityInfo field_19
         * @property {number|Long|null} [field_20] UnityInfo field_20
         * @property {number|Long|null} [field_21] UnityInfo field_21
         * @property {number|Long|null} [field_22] UnityInfo field_22
         * @property {string|null} [field_23] UnityInfo field_23
         * @property {number|Long|null} [field_24] UnityInfo field_24
         * @property {number|Long|null} [field_25] UnityInfo field_25
         * @property {number|Long|null} [field_26] UnityInfo field_26
         * @property {number|Long|null} [field_27] UnityInfo field_27
         * @property {number|Long|null} [field_28] UnityInfo field_28
         * @property {number|Long|null} [field_29] UnityInfo field_29
         * @property {number|Long|null} [field_30] UnityInfo field_30
         * @property {number|Long|null} [field_31] UnityInfo field_31
         * @property {boolean|null} [field_32] UnityInfo field_32
         * @property {number|Long|null} [field_33] UnityInfo field_33
         * @property {number|Long|null} [field_34] UnityInfo field_34
         * @property {number|Long|null} [field_35] UnityInfo field_35
         * @property {number|Long|null} [field_36] UnityInfo field_36
         * @property {string|null} [field_37] UnityInfo field_37
         * @property {string|null} [field_38] UnityInfo field_38
         * @property {string|null} [field_39] UnityInfo field_39
         * @property {number|Long|null} [field_40] UnityInfo field_40
         * @property {string|null} [field_41] UnityInfo field_41
         * @property {string|null} [field_42] UnityInfo field_42
         * @property {number|Long|null} [field_43] UnityInfo field_43
         * @property {number|Long|null} [field_44] UnityInfo field_44
         * @property {number|Long|null} [field_45] UnityInfo field_45
         * @property {number|Long|null} [field_46] UnityInfo field_46
         * @property {number|Long|null} [field_47] UnityInfo field_47
         * @property {number|Long|null} [field_48] UnityInfo field_48
         * @property {number|Long|null} [field_49] UnityInfo field_49
         * @property {number|Long|null} [field_50] UnityInfo field_50
         */

        /**
         * Constructs a new UnityInfo.
         * @memberof unity_proto
         * @classdesc Represents an UnityInfo.
         * @implements IUnityInfo
         * @constructor
         * @param {unity_proto.IUnityInfo=} [p] Properties to set
         */
        function UnityInfo(p) {
            if (p)
                for (var ks = Object.keys(p), i = 0; i < ks.length; ++i)
                    if (p[ks[i]] != null)
                        this[ks[i]] = p[ks[i]];
        }

        /**
         * UnityInfo field_1.
         * @member {string} field_1
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_1 = "";

        /**
         * UnityInfo field_2.
         * @member {number|Long} field_2
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_2 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_3.
         * @member {number|Long} field_3
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_3 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_4.
         * @member {number|Long} field_4
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_4 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_5.
         * @member {number|Long} field_5
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_5 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_6.
         * @member {number|Long} field_6
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_6 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_7.
         * @member {number|Long} field_7
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_7 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_8.
         * @member {number|Long} field_8
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_8 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_9.
         * @member {number|Long} field_9
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_9 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_10.
         * @member {number|Long} field_10
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_10 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_11.
         * @member {number|Long} field_11
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_11 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_12.
         * @member {number|Long} field_12
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_12 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_13.
         * @member {number|Long} field_13
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_13 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_14.
         * @member {boolean} field_14
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_14 = false;

        /**
         * UnityInfo field_15.
         * @member {number|Long} field_15
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_15 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_16.
         * @member {number|Long} field_16
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_16 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_17.
         * @member {number|Long} field_17
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_17 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_18.
         * @member {number|Long} field_18
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_18 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_19.
         * @member {number|Long} field_19
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_19 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_20.
         * @member {number|Long} field_20
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_20 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_21.
         * @member {number|Long} field_21
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_21 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_22.
         * @member {number|Long} field_22
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_22 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_23.
         * @member {string} field_23
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_23 = "";

        /**
         * UnityInfo field_24.
         * @member {number|Long} field_24
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_24 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_25.
         * @member {number|Long} field_25
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_25 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_26.
         * @member {number|Long} field_26
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_26 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_27.
         * @member {number|Long} field_27
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_27 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_28.
         * @member {number|Long} field_28
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_28 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_29.
         * @member {number|Long} field_29
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_29 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_30.
         * @member {number|Long} field_30
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_30 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_31.
         * @member {number|Long} field_31
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_31 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_32.
         * @member {boolean} field_32
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_32 = false;

        /**
         * UnityInfo field_33.
         * @member {number|Long} field_33
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_33 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_34.
         * @member {number|Long} field_34
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_34 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_35.
         * @member {number|Long} field_35
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_35 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_36.
         * @member {number|Long} field_36
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_36 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_37.
         * @member {string} field_37
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_37 = "";

        /**
         * UnityInfo field_38.
         * @member {string} field_38
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_38 = "";

        /**
         * UnityInfo field_39.
         * @member {string} field_39
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_39 = "";

        /**
         * UnityInfo field_40.
         * @member {number|Long} field_40
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_40 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_41.
         * @member {string} field_41
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_41 = "";

        /**
         * UnityInfo field_42.
         * @member {string} field_42
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_42 = "";

        /**
         * UnityInfo field_43.
         * @member {number|Long} field_43
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_43 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_44.
         * @member {number|Long} field_44
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_44 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_45.
         * @member {number|Long} field_45
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_45 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_46.
         * @member {number|Long} field_46
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_46 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_47.
         * @member {number|Long} field_47
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_47 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_48.
         * @member {number|Long} field_48
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_48 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_49.
         * @member {number|Long} field_49
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_49 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * UnityInfo field_50.
         * @member {number|Long} field_50
         * @memberof unity_proto.UnityInfo
         * @instance
         */
        UnityInfo.prototype.field_50 = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * Encodes the specified UnityInfo message. Does not implicitly {@link unity_proto.UnityInfo.verify|verify} messages.
         * @function encode
         * @memberof unity_proto.UnityInfo
         * @static
         * @param {unity_proto.IUnityInfo} m UnityInfo message or plain object to encode
         * @param {$protobuf.Writer} [w] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        UnityInfo.encode = function encode(m, w) {
            if (!w)
                w = $Writer.create();
            if (m.field_1 != null && m.hasOwnProperty("field_1"))
                w.uint32(10).string(m.field_1);
            if (m.field_2 != null && m.hasOwnProperty("field_2"))
                w.uint32(16).int64(m.field_2);
            if (m.field_3 != null && m.hasOwnProperty("field_3"))
                w.uint32(24).int64(m.field_3);
            if (m.field_4 != null && m.hasOwnProperty("field_4"))
                w.uint32(32).int64(m.field_4);
            if (m.field_5 != null && m.hasOwnProperty("field_5"))
                w.uint32(40).int64(m.field_5);
            if (m.field_6 != null && m.hasOwnProperty("field_6"))
                w.uint32(48).int64(m.field_6);
            if (m.field_7 != null && m.hasOwnProperty("field_7"))
                w.uint32(56).int64(m.field_7);
            if (m.field_8 != null && m.hasOwnProperty("field_8"))
                w.uint32(64).int64(m.field_8);
            if (m.field_9 != null && m.hasOwnProperty("field_9"))
                w.uint32(72).int64(m.field_9);
            if (m.field_10 != null && m.hasOwnProperty("field_10"))
                w.uint32(80).int64(m.field_10);
            if (m.field_11 != null && m.hasOwnProperty("field_11"))
                w.uint32(88).int64(m.field_11);
            if (m.field_12 != null && m.hasOwnProperty("field_12"))
                w.uint32(96).int64(m.field_12);
            if (m.field_13 != null && m.hasOwnProperty("field_13"))
                w.uint32(104).int64(m.field_13);
            if (m.field_14 != null && m.hasOwnProperty("field_14"))
                w.uint32(112).bool(m.field_14);
            if (m.field_15 != null && m.hasOwnProperty("field_15"))
                w.uint32(120).int64(m.field_15);
            if (m.field_16 != null && m.hasOwnProperty("field_16"))
                w.uint32(128).int64(m.field_16);
            if (m.field_17 != null && m.hasOwnProperty("field_17"))
                w.uint32(136).int64(m.field_17);
            if (m.field_18 != null && m.hasOwnProperty("field_18"))
                w.uint32(144).int64(m.field_18);
            if (m.field_19 != null && m.hasOwnProperty("field_19"))
                w.uint32(152).int64(m.field_19);
            if (m.field_20 != null && m.hasOwnProperty("field_20"))
                w.uint32(160).int64(m.field_20);
            if (m.field_21 != null && m.hasOwnProperty("field_21"))
                w.uint32(168).int64(m.field_21);
            if (m.field_22 != null && m.hasOwnProperty("field_22"))
                w.uint32(176).int64(m.field_22);
            if (m.field_23 != null && m.hasOwnProperty("field_23"))
                w.uint32(186).string(m.field_23);
            if (m.field_24 != null && m.hasOwnProperty("field_24"))
                w.uint32(192).int64(m.field_24);
            if (m.field_25 != null && m.hasOwnProperty("field_25"))
                w.uint32(200).int64(m.field_25);
            if (m.field_26 != null && m.hasOwnProperty("field_26"))
                w.uint32(208).int64(m.field_26);
            if (m.field_27 != null && m.hasOwnProperty("field_27"))
                w.uint32(216).int64(m.field_27);
            if (m.field_28 != null && m.hasOwnProperty("field_28"))
                w.uint32(224).int64(m.field_28);
            if (m.field_29 != null && m.hasOwnProperty("field_29"))
                w.uint32(232).int64(m.field_29);
            if (m.field_30 != null && m.hasOwnProperty("field_30"))
                w.uint32(240).int64(m.field_30);
            if (m.field_31 != null && m.hasOwnProperty("field_31"))
                w.uint32(248).int64(m.field_31);
            if (m.field_32 != null && m.hasOwnProperty("field_32"))
                w.uint32(256).bool(m.field_32);
            if (m.field_33 != null && m.hasOwnProperty("field_33"))
                w.uint32(264).int64(m.field_33);
            if (m.field_34 != null && m.hasOwnProperty("field_34"))
                w.uint32(272).int64(m.field_34);
            if (m.field_35 != null && m.hasOwnProperty("field_35"))
                w.uint32(280).int64(m.field_35);
            if (m.field_36 != null && m.hasOwnProperty("field_36"))
                w.uint32(288).int64(m.field_36);
            if (m.field_37 != null && m.hasOwnProperty("field_37"))
                w.uint32(298).string(m.field_37);
            if (m.field_38 != null && m.hasOwnProperty("field_38"))
                w.uint32(306).string(m.field_38);
            if (m.field_39 != null && m.hasOwnProperty("field_39"))
                w.uint32(314).string(m.field_39);
            if (m.field_40 != null && m.hasOwnProperty("field_40"))
                w.uint32(320).int64(m.field_40);
            if (m.field_41 != null && m.hasOwnProperty("field_41"))
                w.uint32(330).string(m.field_41);
            if (m.field_42 != null && m.hasOwnProperty("field_42"))
                w.uint32(338).string(m.field_42);
            if (m.field_43 != null && m.hasOwnProperty("field_43"))
                w.uint32(344).int64(m.field_43);
            if (m.field_44 != null && m.hasOwnProperty("field_44"))
                w.uint32(352).int64(m.field_44);
            if (m.field_45 != null && m.hasOwnProperty("field_45"))
                w.uint32(360).int64(m.field_45);
            if (m.field_46 != null && m.hasOwnProperty("field_46"))
                w.uint32(368).int64(m.field_46);
            if (m.field_47 != null && m.hasOwnProperty("field_47"))
                w.uint32(376).int64(m.field_47);
            if (m.field_48 != null && m.hasOwnProperty("field_48"))
                w.uint32(384).int64(m.field_48);
            if (m.field_49 != null && m.hasOwnProperty("field_49"))
                w.uint32(392).int64(m.field_49);
            if (m.field_50 != null && m.hasOwnProperty("field_50"))
                w.uint32(400).int64(m.field_50);
            return w;
        };

        /**
         * Decodes an UnityInfo message from the specified reader or buffer.
         * @function decode
         * @memberof unity_proto.UnityInfo
         * @static
         * @param {$protobuf.Reader|Uint8Array} r Reader or buffer to decode from
         * @param {number} [l] Message length if known beforehand
         * @returns {unity_proto.UnityInfo} UnityInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        UnityInfo.decode = function decode(r, l) {
            if (!(r instanceof $Reader))
                r = $Reader.create(r);
            var c = l === undefined ? r.len : r.pos + l, m = new $root.unity_proto.UnityInfo();
            while (r.pos < c) {
                var t = r.uint32();
                switch (t >>> 3) {
                case 1:
                    m.field_1 = r.string();
                    break;
                case 2:
                    m.field_2 = r.int64();
                    break;
                case 3:
                    m.field_3 = r.int64();
                    break;
                case 4:
                    m.field_4 = r.int64();
                    break;
                case 5:
                    m.field_5 = r.int64();
                    break;
                case 6:
                    m.field_6 = r.int64();
                    break;
                case 7:
                    m.field_7 = r.int64();
                    break;
                case 8:
                    m.field_8 = r.int64();
                    break;
                case 9:
                    m.field_9 = r.int64();
                    break;
                case 10:
                    m.field_10 = r.int64();
                    break;
                case 11:
                    m.field_11 = r.int64();
                    break;
                case 12:
                    m.field_12 = r.int64();
                    break;
                case 13:
                    m.field_13 = r.int64();
                    break;
                case 14:
                    m.field_14 = r.bool();
                    break;
                case 15:
                    m.field_15 = r.int64();
                    break;
                case 16:
                    m.field_16 = r.int64();
                    break;
                case 17:
                    m.field_17 = r.int64();
                    break;
                case 18:
                    m.field_18 = r.int64();
                    break;
                case 19:
                    m.field_19 = r.int64();
                    break;
                case 20:
                    m.field_20 = r.int64();
                    break;
                case 21:
                    m.field_21 = r.int64();
                    break;
                case 22:
                    m.field_22 = r.int64();
                    break;
                case 23:
                    m.field_23 = r.string();
                    break;
                case 24:
                    m.field_24 = r.int64();
                    break;
                case 25:
                    m.field_25 = r.int64();
                    break;
                case 26:
                    m.field_26 = r.int64();
                    break;
                case 27:
                    m.field_27 = r.int64();
                    break;
                case 28:
                    m.field_28 = r.int64();
                    break;
                case 29:
                    m.field_29 = r.int64();
                    break;
                case 30:
                    m.field_30 = r.int64();
                    break;
                case 31:
                    m.field_31 = r.int64();
                    break;
                case 32:
                    m.field_32 = r.bool();
                    break;
                case 33:
                    m.field_33 = r.int64();
                    break;
                case 34:
                    m.field_34 = r.int64();
                    break;
                case 35:
                    m.field_35 = r.int64();
                    break;
                case 36:
                    m.field_36 = r.int64();
                    break;
                case 37:
                    m.field_37 = r.string();
                    break;
                case 38:
                    m.field_38 = r.string();
                    break;
                case 39:
                    m.field_39 = r.string();
                    break;
                case 40:
                    m.field_40 = r.int64();
                    break;
                case 41:
                    m.field_41 = r.string();
                    break;
                case 42:
                    m.field_42 = r.string();
                    break;
                case 43:
                    m.field_43 = r.int64();
                    break;
                case 44:
                    m.field_44 = r.int64();
                    break;
                case 45:
                    m.field_45 = r.int64();
                    break;
                case 46:
                    m.field_46 = r.int64();
                    break;
                case 47:
                    m.field_47 = r.int64();
                    break;
                case 48:
                    m.field_48 = r.int64();
                    break;
                case 49:
                    m.field_49 = r.int64();
                    break;
                case 50:
                    m.field_50 = r.int64();
                    break;
                default:
                    r.skipType(t & 7);
                    break;
                }
            }
            return m;
        };

        return UnityInfo;
    })();

    return unity_proto;
})();

export { $root as default };
