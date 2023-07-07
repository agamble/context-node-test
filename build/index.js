var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/@contextco/context-node/build/index.js
var import_util = __toESM(require("util"), 1);
var os = __toESM(require("os"), 1);
var import_os = __toESM(require("os"), 1);
var import_stream = __toESM(require("stream"), 1);
var import_path = __toESM(require("path"), 1);
var http$1 = __toESM(require("http"), 1);
var import_http = __toESM(require("http"), 1);
var https$1 = __toESM(require("https"), 1);
var import_https = __toESM(require("https"), 1);
var import_url = __toESM(require("url"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_net = __toESM(require("net"), 1);
var import_tls = __toESM(require("tls"), 1);
var import_assert = __toESM(require("assert"), 1);
var import_tty = __toESM(require("tty"), 1);
var import_events = __toESM(require("events"), 1);
var zlib = __toESM(require("zlib"), 1);
var import_crypto = require("crypto");
var KnownMessageRole;
(function(KnownMessageRole2) {
  KnownMessageRole2["System"] = "system";
  KnownMessageRole2["Assistant"] = "assistant";
  KnownMessageRole2["User"] = "user";
})(KnownMessageRole || (KnownMessageRole = {}));
function encodeByteArray(value) {
  const bufferValue = value instanceof Buffer ? value : Buffer.from(value.buffer);
  return bufferValue.toString("base64");
}
function decodeString(value) {
  return Buffer.from(value, "base64");
}
function decodeStringToString(value) {
  return Buffer.from(value, "base64").toString();
}
var XML_ATTRKEY = "$";
var XML_CHARKEY = "_";
function isPrimitiveBody(value, mapperTypeName) {
  return mapperTypeName !== "Composite" && mapperTypeName !== "Dictionary" && (typeof value === "string" || typeof value === "number" || typeof value === "boolean" || (mapperTypeName === null || mapperTypeName === void 0 ? void 0 : mapperTypeName.match(/^(Date|DateTime|DateTimeRfc1123|UnixTime|ByteArray|Base64Url)$/i)) !== null || value === void 0 || value === null);
}
var validateISODuration = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;
function isDuration(value) {
  return validateISODuration.test(value);
}
var validUuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i;
function isValidUuid(uuid) {
  return validUuidRegex.test(uuid);
}
function handleNullableResponseAndWrappableBody(responseObject) {
  const combinedHeadersAndBody = Object.assign(Object.assign({}, responseObject.headers), responseObject.body);
  if (responseObject.hasNullableType && Object.getOwnPropertyNames(combinedHeadersAndBody).length === 0) {
    return responseObject.shouldWrapBody ? { body: null } : null;
  } else {
    return responseObject.shouldWrapBody ? Object.assign(Object.assign({}, responseObject.headers), { body: responseObject.body }) : combinedHeadersAndBody;
  }
}
function flattenResponse(fullResponse, responseSpec) {
  var _a2, _b;
  const parsedHeaders = fullResponse.parsedHeaders;
  if (fullResponse.request.method === "HEAD") {
    return Object.assign(Object.assign({}, parsedHeaders), { body: fullResponse.parsedBody });
  }
  const bodyMapper = responseSpec && responseSpec.bodyMapper;
  const isNullable = Boolean(bodyMapper === null || bodyMapper === void 0 ? void 0 : bodyMapper.nullable);
  const expectedBodyTypeName = bodyMapper === null || bodyMapper === void 0 ? void 0 : bodyMapper.type.name;
  if (expectedBodyTypeName === "Stream") {
    return Object.assign(Object.assign({}, parsedHeaders), { blobBody: fullResponse.blobBody, readableStreamBody: fullResponse.readableStreamBody });
  }
  const modelProperties = expectedBodyTypeName === "Composite" && bodyMapper.type.modelProperties || {};
  const isPageableResponse = Object.keys(modelProperties).some((k) => modelProperties[k].serializedName === "");
  if (expectedBodyTypeName === "Sequence" || isPageableResponse) {
    const arrayResponse = (_a2 = fullResponse.parsedBody) !== null && _a2 !== void 0 ? _a2 : [];
    for (const key of Object.keys(modelProperties)) {
      if (modelProperties[key].serializedName) {
        arrayResponse[key] = (_b = fullResponse.parsedBody) === null || _b === void 0 ? void 0 : _b[key];
      }
    }
    if (parsedHeaders) {
      for (const key of Object.keys(parsedHeaders)) {
        arrayResponse[key] = parsedHeaders[key];
      }
    }
    return isNullable && !fullResponse.parsedBody && !parsedHeaders && Object.getOwnPropertyNames(modelProperties).length === 0 ? null : arrayResponse;
  }
  return handleNullableResponseAndWrappableBody({
    body: fullResponse.parsedBody,
    headers: parsedHeaders,
    hasNullableType: isNullable,
    shouldWrapBody: isPrimitiveBody(fullResponse.parsedBody, expectedBodyTypeName)
  });
}
var SerializerImpl = class {
  constructor(modelMappers = {}, isXML = false) {
    this.modelMappers = modelMappers;
    this.isXML = isXML;
  }
  /**
   * @deprecated Removing the constraints validation on client side.
   */
  validateConstraints(mapper, value, objectName) {
    const failValidation = (constraintName, constraintValue) => {
      throw new Error(`"${objectName}" with value "${value}" should satisfy the constraint "${constraintName}": ${constraintValue}.`);
    };
    if (mapper.constraints && value !== void 0 && value !== null) {
      const { ExclusiveMaximum, ExclusiveMinimum, InclusiveMaximum, InclusiveMinimum, MaxItems, MaxLength, MinItems, MinLength, MultipleOf, Pattern, UniqueItems } = mapper.constraints;
      if (ExclusiveMaximum !== void 0 && value >= ExclusiveMaximum) {
        failValidation("ExclusiveMaximum", ExclusiveMaximum);
      }
      if (ExclusiveMinimum !== void 0 && value <= ExclusiveMinimum) {
        failValidation("ExclusiveMinimum", ExclusiveMinimum);
      }
      if (InclusiveMaximum !== void 0 && value > InclusiveMaximum) {
        failValidation("InclusiveMaximum", InclusiveMaximum);
      }
      if (InclusiveMinimum !== void 0 && value < InclusiveMinimum) {
        failValidation("InclusiveMinimum", InclusiveMinimum);
      }
      if (MaxItems !== void 0 && value.length > MaxItems) {
        failValidation("MaxItems", MaxItems);
      }
      if (MaxLength !== void 0 && value.length > MaxLength) {
        failValidation("MaxLength", MaxLength);
      }
      if (MinItems !== void 0 && value.length < MinItems) {
        failValidation("MinItems", MinItems);
      }
      if (MinLength !== void 0 && value.length < MinLength) {
        failValidation("MinLength", MinLength);
      }
      if (MultipleOf !== void 0 && value % MultipleOf !== 0) {
        failValidation("MultipleOf", MultipleOf);
      }
      if (Pattern) {
        const pattern = typeof Pattern === "string" ? new RegExp(Pattern) : Pattern;
        if (typeof value !== "string" || value.match(pattern) === null) {
          failValidation("Pattern", Pattern);
        }
      }
      if (UniqueItems && value.some((item, i, ar) => ar.indexOf(item) !== i)) {
        failValidation("UniqueItems", UniqueItems);
      }
    }
  }
  /**
   * Serialize the given object based on its metadata defined in the mapper
   *
   * @param mapper - The mapper which defines the metadata of the serializable object
   *
   * @param object - A valid Javascript object to be serialized
   *
   * @param objectName - Name of the serialized object
   *
   * @param options - additional options to serialization
   *
   * @returns A valid serialized Javascript object
   */
  serialize(mapper, object, objectName, options2 = { xml: {} }) {
    var _a2, _b, _c;
    const updatedOptions = {
      xml: {
        rootName: (_a2 = options2.xml.rootName) !== null && _a2 !== void 0 ? _a2 : "",
        includeRoot: (_b = options2.xml.includeRoot) !== null && _b !== void 0 ? _b : false,
        xmlCharKey: (_c = options2.xml.xmlCharKey) !== null && _c !== void 0 ? _c : XML_CHARKEY
      }
    };
    let payload = {};
    const mapperType = mapper.type.name;
    if (!objectName) {
      objectName = mapper.serializedName;
    }
    if (mapperType.match(/^Sequence$/i) !== null) {
      payload = [];
    }
    if (mapper.isConstant) {
      object = mapper.defaultValue;
    }
    const { required, nullable } = mapper;
    if (required && nullable && object === void 0) {
      throw new Error(`${objectName} cannot be undefined.`);
    }
    if (required && !nullable && (object === void 0 || object === null)) {
      throw new Error(`${objectName} cannot be null or undefined.`);
    }
    if (!required && nullable === false && object === null) {
      throw new Error(`${objectName} cannot be null.`);
    }
    if (object === void 0 || object === null) {
      payload = object;
    } else {
      if (mapperType.match(/^any$/i) !== null) {
        payload = object;
      } else if (mapperType.match(/^(Number|String|Boolean|Object|Stream|Uuid)$/i) !== null) {
        payload = serializeBasicTypes(mapperType, objectName, object);
      } else if (mapperType.match(/^Enum$/i) !== null) {
        const enumMapper = mapper;
        payload = serializeEnumType(objectName, enumMapper.type.allowedValues, object);
      } else if (mapperType.match(/^(Date|DateTime|TimeSpan|DateTimeRfc1123|UnixTime)$/i) !== null) {
        payload = serializeDateTypes(mapperType, object, objectName);
      } else if (mapperType.match(/^ByteArray$/i) !== null) {
        payload = serializeByteArrayType(objectName, object);
      } else if (mapperType.match(/^Base64Url$/i) !== null) {
        payload = serializeBase64UrlType(objectName, object);
      } else if (mapperType.match(/^Sequence$/i) !== null) {
        payload = serializeSequenceType(this, mapper, object, objectName, Boolean(this.isXML), updatedOptions);
      } else if (mapperType.match(/^Dictionary$/i) !== null) {
        payload = serializeDictionaryType(this, mapper, object, objectName, Boolean(this.isXML), updatedOptions);
      } else if (mapperType.match(/^Composite$/i) !== null) {
        payload = serializeCompositeType(this, mapper, object, objectName, Boolean(this.isXML), updatedOptions);
      }
    }
    return payload;
  }
  /**
   * Deserialize the given object based on its metadata defined in the mapper
   *
   * @param mapper - The mapper which defines the metadata of the serializable object
   *
   * @param responseBody - A valid Javascript entity to be deserialized
   *
   * @param objectName - Name of the deserialized object
   *
   * @param options - Controls behavior of XML parser and builder.
   *
   * @returns A valid deserialized Javascript object
   */
  deserialize(mapper, responseBody, objectName, options2 = { xml: {} }) {
    var _a2, _b, _c, _d;
    const updatedOptions = {
      xml: {
        rootName: (_a2 = options2.xml.rootName) !== null && _a2 !== void 0 ? _a2 : "",
        includeRoot: (_b = options2.xml.includeRoot) !== null && _b !== void 0 ? _b : false,
        xmlCharKey: (_c = options2.xml.xmlCharKey) !== null && _c !== void 0 ? _c : XML_CHARKEY
      },
      ignoreUnknownProperties: (_d = options2.ignoreUnknownProperties) !== null && _d !== void 0 ? _d : false
    };
    if (responseBody === void 0 || responseBody === null) {
      if (this.isXML && mapper.type.name === "Sequence" && !mapper.xmlIsWrapped) {
        responseBody = [];
      }
      if (mapper.defaultValue !== void 0) {
        responseBody = mapper.defaultValue;
      }
      return responseBody;
    }
    let payload;
    const mapperType = mapper.type.name;
    if (!objectName) {
      objectName = mapper.serializedName;
    }
    if (mapperType.match(/^Composite$/i) !== null) {
      payload = deserializeCompositeType(this, mapper, responseBody, objectName, updatedOptions);
    } else {
      if (this.isXML) {
        const xmlCharKey = updatedOptions.xml.xmlCharKey;
        if (responseBody[XML_ATTRKEY] !== void 0 && responseBody[xmlCharKey] !== void 0) {
          responseBody = responseBody[xmlCharKey];
        }
      }
      if (mapperType.match(/^Number$/i) !== null) {
        payload = parseFloat(responseBody);
        if (isNaN(payload)) {
          payload = responseBody;
        }
      } else if (mapperType.match(/^Boolean$/i) !== null) {
        if (responseBody === "true") {
          payload = true;
        } else if (responseBody === "false") {
          payload = false;
        } else {
          payload = responseBody;
        }
      } else if (mapperType.match(/^(String|Enum|Object|Stream|Uuid|TimeSpan|any)$/i) !== null) {
        payload = responseBody;
      } else if (mapperType.match(/^(Date|DateTime|DateTimeRfc1123)$/i) !== null) {
        payload = new Date(responseBody);
      } else if (mapperType.match(/^UnixTime$/i) !== null) {
        payload = unixTimeToDate(responseBody);
      } else if (mapperType.match(/^ByteArray$/i) !== null) {
        payload = decodeString(responseBody);
      } else if (mapperType.match(/^Base64Url$/i) !== null) {
        payload = base64UrlToByteArray(responseBody);
      } else if (mapperType.match(/^Sequence$/i) !== null) {
        payload = deserializeSequenceType(this, mapper, responseBody, objectName, updatedOptions);
      } else if (mapperType.match(/^Dictionary$/i) !== null) {
        payload = deserializeDictionaryType(this, mapper, responseBody, objectName, updatedOptions);
      }
    }
    if (mapper.isConstant) {
      payload = mapper.defaultValue;
    }
    return payload;
  }
};
function createSerializer(modelMappers = {}, isXML = false) {
  return new SerializerImpl(modelMappers, isXML);
}
function trimEnd(str, ch) {
  let len = str.length;
  while (len - 1 >= 0 && str[len - 1] === ch) {
    --len;
  }
  return str.substr(0, len);
}
function bufferToBase64Url(buffer) {
  if (!buffer) {
    return void 0;
  }
  if (!(buffer instanceof Uint8Array)) {
    throw new Error(`Please provide an input of type Uint8Array for converting to Base64Url.`);
  }
  const str = encodeByteArray(buffer);
  return trimEnd(str, "=").replace(/\+/g, "-").replace(/\//g, "_");
}
function base64UrlToByteArray(str) {
  if (!str) {
    return void 0;
  }
  if (str && typeof str.valueOf() !== "string") {
    throw new Error("Please provide an input of type string for converting to Uint8Array");
  }
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  return decodeString(str);
}
function splitSerializeName(prop) {
  const classes = [];
  let partialclass = "";
  if (prop) {
    const subwords = prop.split(".");
    for (const item of subwords) {
      if (item.charAt(item.length - 1) === "\\") {
        partialclass += item.substr(0, item.length - 1) + ".";
      } else {
        partialclass += item;
        classes.push(partialclass);
        partialclass = "";
      }
    }
  }
  return classes;
}
function dateToUnixTime(d) {
  if (!d) {
    return void 0;
  }
  if (typeof d.valueOf() === "string") {
    d = new Date(d);
  }
  return Math.floor(d.getTime() / 1e3);
}
function unixTimeToDate(n) {
  if (!n) {
    return void 0;
  }
  return new Date(n * 1e3);
}
function serializeBasicTypes(typeName, objectName, value) {
  if (value !== null && value !== void 0) {
    if (typeName.match(/^Number$/i) !== null) {
      if (typeof value !== "number") {
        throw new Error(`${objectName} with value ${value} must be of type number.`);
      }
    } else if (typeName.match(/^String$/i) !== null) {
      if (typeof value.valueOf() !== "string") {
        throw new Error(`${objectName} with value "${value}" must be of type string.`);
      }
    } else if (typeName.match(/^Uuid$/i) !== null) {
      if (!(typeof value.valueOf() === "string" && isValidUuid(value))) {
        throw new Error(`${objectName} with value "${value}" must be of type string and a valid uuid.`);
      }
    } else if (typeName.match(/^Boolean$/i) !== null) {
      if (typeof value !== "boolean") {
        throw new Error(`${objectName} with value ${value} must be of type boolean.`);
      }
    } else if (typeName.match(/^Stream$/i) !== null) {
      const objectType = typeof value;
      if (objectType !== "string" && typeof value.pipe !== "function" && !(value instanceof ArrayBuffer) && !ArrayBuffer.isView(value) && // File objects count as a type of Blob, so we want to use instanceof explicitly
      !((typeof Blob === "function" || typeof Blob === "object") && value instanceof Blob) && objectType !== "function") {
        throw new Error(`${objectName} must be a string, Blob, ArrayBuffer, ArrayBufferView, NodeJS.ReadableStream, or () => NodeJS.ReadableStream.`);
      }
    }
  }
  return value;
}
function serializeEnumType(objectName, allowedValues, value) {
  if (!allowedValues) {
    throw new Error(`Please provide a set of allowedValues to validate ${objectName} as an Enum Type.`);
  }
  const isPresent = allowedValues.some((item) => {
    if (typeof item.valueOf() === "string") {
      return item.toLowerCase() === value.toLowerCase();
    }
    return item === value;
  });
  if (!isPresent) {
    throw new Error(`${value} is not a valid value for ${objectName}. The valid values are: ${JSON.stringify(allowedValues)}.`);
  }
  return value;
}
function serializeByteArrayType(objectName, value) {
  if (value !== void 0 && value !== null) {
    if (!(value instanceof Uint8Array)) {
      throw new Error(`${objectName} must be of type Uint8Array.`);
    }
    value = encodeByteArray(value);
  }
  return value;
}
function serializeBase64UrlType(objectName, value) {
  if (value !== void 0 && value !== null) {
    if (!(value instanceof Uint8Array)) {
      throw new Error(`${objectName} must be of type Uint8Array.`);
    }
    value = bufferToBase64Url(value);
  }
  return value;
}
function serializeDateTypes(typeName, value, objectName) {
  if (value !== void 0 && value !== null) {
    if (typeName.match(/^Date$/i) !== null) {
      if (!(value instanceof Date || typeof value.valueOf() === "string" && !isNaN(Date.parse(value)))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
      }
      value = value instanceof Date ? value.toISOString().substring(0, 10) : new Date(value).toISOString().substring(0, 10);
    } else if (typeName.match(/^DateTime$/i) !== null) {
      if (!(value instanceof Date || typeof value.valueOf() === "string" && !isNaN(Date.parse(value)))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in ISO8601 format.`);
      }
      value = value instanceof Date ? value.toISOString() : new Date(value).toISOString();
    } else if (typeName.match(/^DateTimeRfc1123$/i) !== null) {
      if (!(value instanceof Date || typeof value.valueOf() === "string" && !isNaN(Date.parse(value)))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123 format.`);
      }
      value = value instanceof Date ? value.toUTCString() : new Date(value).toUTCString();
    } else if (typeName.match(/^UnixTime$/i) !== null) {
      if (!(value instanceof Date || typeof value.valueOf() === "string" && !isNaN(Date.parse(value)))) {
        throw new Error(`${objectName} must be an instanceof Date or a string in RFC-1123/ISO8601 format for it to be serialized in UnixTime/Epoch format.`);
      }
      value = dateToUnixTime(value);
    } else if (typeName.match(/^TimeSpan$/i) !== null) {
      if (!isDuration(value)) {
        throw new Error(`${objectName} must be a string in ISO 8601 format. Instead was "${value}".`);
      }
    }
  }
  return value;
}
function serializeSequenceType(serializer2, mapper, object, objectName, isXml, options2) {
  var _a2;
  if (!Array.isArray(object)) {
    throw new Error(`${objectName} must be of type Array.`);
  }
  let elementType = mapper.type.element;
  if (!elementType || typeof elementType !== "object") {
    throw new Error(`element" metadata for an Array must be defined in the mapper and it must of type "object" in ${objectName}.`);
  }
  if (elementType.type.name === "Composite" && elementType.type.className) {
    elementType = (_a2 = serializer2.modelMappers[elementType.type.className]) !== null && _a2 !== void 0 ? _a2 : elementType;
  }
  const tempArray = [];
  for (let i = 0; i < object.length; i++) {
    const serializedValue = serializer2.serialize(elementType, object[i], objectName, options2);
    if (isXml && elementType.xmlNamespace) {
      const xmlnsKey = elementType.xmlNamespacePrefix ? `xmlns:${elementType.xmlNamespacePrefix}` : "xmlns";
      if (elementType.type.name === "Composite") {
        tempArray[i] = Object.assign({}, serializedValue);
        tempArray[i][XML_ATTRKEY] = { [xmlnsKey]: elementType.xmlNamespace };
      } else {
        tempArray[i] = {};
        tempArray[i][options2.xml.xmlCharKey] = serializedValue;
        tempArray[i][XML_ATTRKEY] = { [xmlnsKey]: elementType.xmlNamespace };
      }
    } else {
      tempArray[i] = serializedValue;
    }
  }
  return tempArray;
}
function serializeDictionaryType(serializer2, mapper, object, objectName, isXml, options2) {
  if (typeof object !== "object") {
    throw new Error(`${objectName} must be of type object.`);
  }
  const valueType = mapper.type.value;
  if (!valueType || typeof valueType !== "object") {
    throw new Error(`"value" metadata for a Dictionary must be defined in the mapper and it must of type "object" in ${objectName}.`);
  }
  const tempDictionary = {};
  for (const key of Object.keys(object)) {
    const serializedValue = serializer2.serialize(valueType, object[key], objectName, options2);
    tempDictionary[key] = getXmlObjectValue(valueType, serializedValue, isXml, options2);
  }
  if (isXml && mapper.xmlNamespace) {
    const xmlnsKey = mapper.xmlNamespacePrefix ? `xmlns:${mapper.xmlNamespacePrefix}` : "xmlns";
    const result = tempDictionary;
    result[XML_ATTRKEY] = { [xmlnsKey]: mapper.xmlNamespace };
    return result;
  }
  return tempDictionary;
}
function resolveAdditionalProperties(serializer2, mapper, objectName) {
  const additionalProperties = mapper.type.additionalProperties;
  if (!additionalProperties && mapper.type.className) {
    const modelMapper = resolveReferencedMapper(serializer2, mapper, objectName);
    return modelMapper === null || modelMapper === void 0 ? void 0 : modelMapper.type.additionalProperties;
  }
  return additionalProperties;
}
function resolveReferencedMapper(serializer2, mapper, objectName) {
  const className = mapper.type.className;
  if (!className) {
    throw new Error(`Class name for model "${objectName}" is not provided in the mapper "${JSON.stringify(mapper, void 0, 2)}".`);
  }
  return serializer2.modelMappers[className];
}
function resolveModelProperties(serializer2, mapper, objectName) {
  let modelProps = mapper.type.modelProperties;
  if (!modelProps) {
    const modelMapper = resolveReferencedMapper(serializer2, mapper, objectName);
    if (!modelMapper) {
      throw new Error(`mapper() cannot be null or undefined for model "${mapper.type.className}".`);
    }
    modelProps = modelMapper === null || modelMapper === void 0 ? void 0 : modelMapper.type.modelProperties;
    if (!modelProps) {
      throw new Error(`modelProperties cannot be null or undefined in the mapper "${JSON.stringify(modelMapper)}" of type "${mapper.type.className}" for object "${objectName}".`);
    }
  }
  return modelProps;
}
function serializeCompositeType(serializer2, mapper, object, objectName, isXml, options2) {
  if (getPolymorphicDiscriminatorRecursively(serializer2, mapper)) {
    mapper = getPolymorphicMapper(serializer2, mapper, object, "clientName");
  }
  if (object !== void 0 && object !== null) {
    const payload = {};
    const modelProps = resolveModelProperties(serializer2, mapper, objectName);
    for (const key of Object.keys(modelProps)) {
      const propertyMapper = modelProps[key];
      if (propertyMapper.readOnly) {
        continue;
      }
      let propName;
      let parentObject = payload;
      if (serializer2.isXML) {
        if (propertyMapper.xmlIsWrapped) {
          propName = propertyMapper.xmlName;
        } else {
          propName = propertyMapper.xmlElementName || propertyMapper.xmlName;
        }
      } else {
        const paths = splitSerializeName(propertyMapper.serializedName);
        propName = paths.pop();
        for (const pathName of paths) {
          const childObject = parentObject[pathName];
          if ((childObject === void 0 || childObject === null) && (object[key] !== void 0 && object[key] !== null || propertyMapper.defaultValue !== void 0)) {
            parentObject[pathName] = {};
          }
          parentObject = parentObject[pathName];
        }
      }
      if (parentObject !== void 0 && parentObject !== null) {
        if (isXml && mapper.xmlNamespace) {
          const xmlnsKey = mapper.xmlNamespacePrefix ? `xmlns:${mapper.xmlNamespacePrefix}` : "xmlns";
          parentObject[XML_ATTRKEY] = Object.assign(Object.assign({}, parentObject[XML_ATTRKEY]), { [xmlnsKey]: mapper.xmlNamespace });
        }
        const propertyObjectName = propertyMapper.serializedName !== "" ? objectName + "." + propertyMapper.serializedName : objectName;
        let toSerialize = object[key];
        const polymorphicDiscriminator = getPolymorphicDiscriminatorRecursively(serializer2, mapper);
        if (polymorphicDiscriminator && polymorphicDiscriminator.clientName === key && (toSerialize === void 0 || toSerialize === null)) {
          toSerialize = mapper.serializedName;
        }
        const serializedValue = serializer2.serialize(propertyMapper, toSerialize, propertyObjectName, options2);
        if (serializedValue !== void 0 && propName !== void 0 && propName !== null) {
          const value = getXmlObjectValue(propertyMapper, serializedValue, isXml, options2);
          if (isXml && propertyMapper.xmlIsAttribute) {
            parentObject[XML_ATTRKEY] = parentObject[XML_ATTRKEY] || {};
            parentObject[XML_ATTRKEY][propName] = serializedValue;
          } else if (isXml && propertyMapper.xmlIsWrapped) {
            parentObject[propName] = { [propertyMapper.xmlElementName]: value };
          } else {
            parentObject[propName] = value;
          }
        }
      }
    }
    const additionalPropertiesMapper = resolveAdditionalProperties(serializer2, mapper, objectName);
    if (additionalPropertiesMapper) {
      const propNames = Object.keys(modelProps);
      for (const clientPropName in object) {
        const isAdditionalProperty = propNames.every((pn) => pn !== clientPropName);
        if (isAdditionalProperty) {
          payload[clientPropName] = serializer2.serialize(additionalPropertiesMapper, object[clientPropName], objectName + '["' + clientPropName + '"]', options2);
        }
      }
    }
    return payload;
  }
  return object;
}
function getXmlObjectValue(propertyMapper, serializedValue, isXml, options2) {
  if (!isXml || !propertyMapper.xmlNamespace) {
    return serializedValue;
  }
  const xmlnsKey = propertyMapper.xmlNamespacePrefix ? `xmlns:${propertyMapper.xmlNamespacePrefix}` : "xmlns";
  const xmlNamespace = { [xmlnsKey]: propertyMapper.xmlNamespace };
  if (["Composite"].includes(propertyMapper.type.name)) {
    if (serializedValue[XML_ATTRKEY]) {
      return serializedValue;
    } else {
      const result2 = Object.assign({}, serializedValue);
      result2[XML_ATTRKEY] = xmlNamespace;
      return result2;
    }
  }
  const result = {};
  result[options2.xml.xmlCharKey] = serializedValue;
  result[XML_ATTRKEY] = xmlNamespace;
  return result;
}
function isSpecialXmlProperty(propertyName, options2) {
  return [XML_ATTRKEY, options2.xml.xmlCharKey].includes(propertyName);
}
function deserializeCompositeType(serializer2, mapper, responseBody, objectName, options2) {
  var _a2, _b;
  const xmlCharKey = (_a2 = options2.xml.xmlCharKey) !== null && _a2 !== void 0 ? _a2 : XML_CHARKEY;
  if (getPolymorphicDiscriminatorRecursively(serializer2, mapper)) {
    mapper = getPolymorphicMapper(serializer2, mapper, responseBody, "serializedName");
  }
  const modelProps = resolveModelProperties(serializer2, mapper, objectName);
  let instance = {};
  const handledPropertyNames = [];
  for (const key of Object.keys(modelProps)) {
    const propertyMapper = modelProps[key];
    const paths = splitSerializeName(modelProps[key].serializedName);
    handledPropertyNames.push(paths[0]);
    const { serializedName, xmlName, xmlElementName } = propertyMapper;
    let propertyObjectName = objectName;
    if (serializedName !== "" && serializedName !== void 0) {
      propertyObjectName = objectName + "." + serializedName;
    }
    const headerCollectionPrefix = propertyMapper.headerCollectionPrefix;
    if (headerCollectionPrefix) {
      const dictionary = {};
      for (const headerKey of Object.keys(responseBody)) {
        if (headerKey.startsWith(headerCollectionPrefix)) {
          dictionary[headerKey.substring(headerCollectionPrefix.length)] = serializer2.deserialize(propertyMapper.type.value, responseBody[headerKey], propertyObjectName, options2);
        }
        handledPropertyNames.push(headerKey);
      }
      instance[key] = dictionary;
    } else if (serializer2.isXML) {
      if (propertyMapper.xmlIsAttribute && responseBody[XML_ATTRKEY]) {
        instance[key] = serializer2.deserialize(propertyMapper, responseBody[XML_ATTRKEY][xmlName], propertyObjectName, options2);
      } else if (propertyMapper.xmlIsMsText) {
        if (responseBody[xmlCharKey] !== void 0) {
          instance[key] = responseBody[xmlCharKey];
        } else if (typeof responseBody === "string") {
          instance[key] = responseBody;
        }
      } else {
        const propertyName = xmlElementName || xmlName || serializedName;
        if (propertyMapper.xmlIsWrapped) {
          const wrapped = responseBody[xmlName];
          const elementList = (_b = wrapped === null || wrapped === void 0 ? void 0 : wrapped[xmlElementName]) !== null && _b !== void 0 ? _b : [];
          instance[key] = serializer2.deserialize(propertyMapper, elementList, propertyObjectName, options2);
          handledPropertyNames.push(xmlName);
        } else {
          const property = responseBody[propertyName];
          instance[key] = serializer2.deserialize(propertyMapper, property, propertyObjectName, options2);
          handledPropertyNames.push(propertyName);
        }
      }
    } else {
      let propertyInstance;
      let res = responseBody;
      let steps = 0;
      for (const item of paths) {
        if (!res)
          break;
        steps++;
        res = res[item];
      }
      if (res === null && steps < paths.length) {
        res = void 0;
      }
      propertyInstance = res;
      const polymorphicDiscriminator = mapper.type.polymorphicDiscriminator;
      if (polymorphicDiscriminator && key === polymorphicDiscriminator.clientName && (propertyInstance === void 0 || propertyInstance === null)) {
        propertyInstance = mapper.serializedName;
      }
      let serializedValue;
      if (Array.isArray(responseBody[key]) && modelProps[key].serializedName === "") {
        propertyInstance = responseBody[key];
        const arrayInstance = serializer2.deserialize(propertyMapper, propertyInstance, propertyObjectName, options2);
        for (const [k, v] of Object.entries(instance)) {
          if (!Object.prototype.hasOwnProperty.call(arrayInstance, k)) {
            arrayInstance[k] = v;
          }
        }
        instance = arrayInstance;
      } else if (propertyInstance !== void 0 || propertyMapper.defaultValue !== void 0) {
        serializedValue = serializer2.deserialize(propertyMapper, propertyInstance, propertyObjectName, options2);
        instance[key] = serializedValue;
      }
    }
  }
  const additionalPropertiesMapper = mapper.type.additionalProperties;
  if (additionalPropertiesMapper) {
    const isAdditionalProperty = (responsePropName) => {
      for (const clientPropName in modelProps) {
        const paths = splitSerializeName(modelProps[clientPropName].serializedName);
        if (paths[0] === responsePropName) {
          return false;
        }
      }
      return true;
    };
    for (const responsePropName in responseBody) {
      if (isAdditionalProperty(responsePropName)) {
        instance[responsePropName] = serializer2.deserialize(additionalPropertiesMapper, responseBody[responsePropName], objectName + '["' + responsePropName + '"]', options2);
      }
    }
  } else if (responseBody && !options2.ignoreUnknownProperties) {
    for (const key of Object.keys(responseBody)) {
      if (instance[key] === void 0 && !handledPropertyNames.includes(key) && !isSpecialXmlProperty(key, options2)) {
        instance[key] = responseBody[key];
      }
    }
  }
  return instance;
}
function deserializeDictionaryType(serializer2, mapper, responseBody, objectName, options2) {
  const value = mapper.type.value;
  if (!value || typeof value !== "object") {
    throw new Error(`"value" metadata for a Dictionary must be defined in the mapper and it must of type "object" in ${objectName}`);
  }
  if (responseBody) {
    const tempDictionary = {};
    for (const key of Object.keys(responseBody)) {
      tempDictionary[key] = serializer2.deserialize(value, responseBody[key], objectName, options2);
    }
    return tempDictionary;
  }
  return responseBody;
}
function deserializeSequenceType(serializer2, mapper, responseBody, objectName, options2) {
  var _a2;
  let element = mapper.type.element;
  if (!element || typeof element !== "object") {
    throw new Error(`element" metadata for an Array must be defined in the mapper and it must of type "object" in ${objectName}`);
  }
  if (responseBody) {
    if (!Array.isArray(responseBody)) {
      responseBody = [responseBody];
    }
    if (element.type.name === "Composite" && element.type.className) {
      element = (_a2 = serializer2.modelMappers[element.type.className]) !== null && _a2 !== void 0 ? _a2 : element;
    }
    const tempArray = [];
    for (let i = 0; i < responseBody.length; i++) {
      tempArray[i] = serializer2.deserialize(element, responseBody[i], `${objectName}[${i}]`, options2);
    }
    return tempArray;
  }
  return responseBody;
}
function getIndexDiscriminator(discriminators, discriminatorValue, typeName) {
  const typeNamesToCheck = [typeName];
  while (typeNamesToCheck.length) {
    const currentName = typeNamesToCheck.shift();
    const indexDiscriminator = discriminatorValue === currentName ? discriminatorValue : currentName + "." + discriminatorValue;
    if (Object.prototype.hasOwnProperty.call(discriminators, indexDiscriminator)) {
      return discriminators[indexDiscriminator];
    } else {
      for (const [name, mapper] of Object.entries(discriminators)) {
        if (name.startsWith(currentName + ".") && mapper.type.uberParent === currentName && mapper.type.className) {
          typeNamesToCheck.push(mapper.type.className);
        }
      }
    }
  }
  return void 0;
}
function getPolymorphicMapper(serializer2, mapper, object, polymorphicPropertyName) {
  var _a2;
  const polymorphicDiscriminator = getPolymorphicDiscriminatorRecursively(serializer2, mapper);
  if (polymorphicDiscriminator) {
    let discriminatorName = polymorphicDiscriminator[polymorphicPropertyName];
    if (discriminatorName) {
      if (polymorphicPropertyName === "serializedName") {
        discriminatorName = discriminatorName.replace(/\\/gi, "");
      }
      const discriminatorValue = object[discriminatorName];
      const typeName = (_a2 = mapper.type.uberParent) !== null && _a2 !== void 0 ? _a2 : mapper.type.className;
      if (typeof discriminatorValue === "string" && typeName) {
        const polymorphicMapper = getIndexDiscriminator(serializer2.modelMappers.discriminators, discriminatorValue, typeName);
        if (polymorphicMapper) {
          mapper = polymorphicMapper;
        }
      }
    }
  }
  return mapper;
}
function getPolymorphicDiscriminatorRecursively(serializer2, mapper) {
  return mapper.type.polymorphicDiscriminator || getPolymorphicDiscriminatorSafely(serializer2, mapper.type.uberParent) || getPolymorphicDiscriminatorSafely(serializer2, mapper.type.className);
}
function getPolymorphicDiscriminatorSafely(serializer2, typeName) {
  return typeName && serializer2.modelMappers[typeName] && serializer2.modelMappers[typeName].type.polymorphicDiscriminator;
}
var MapperTypeNames = {
  Base64Url: "Base64Url",
  Boolean: "Boolean",
  ByteArray: "ByteArray",
  Composite: "Composite",
  Date: "Date",
  DateTime: "DateTime",
  DateTimeRfc1123: "DateTimeRfc1123",
  Dictionary: "Dictionary",
  Enum: "Enum",
  Number: "Number",
  Object: "Object",
  Sequence: "Sequence",
  String: "String",
  Stream: "Stream",
  TimeSpan: "TimeSpan",
  UnixTime: "UnixTime"
};
var ValidPhaseNames = /* @__PURE__ */ new Set(["Deserialize", "Serialize", "Retry", "Sign"]);
var HttpPipeline = class {
  constructor(policies) {
    var _a2;
    this._policies = [];
    this._policies = (_a2 = policies === null || policies === void 0 ? void 0 : policies.slice(0)) !== null && _a2 !== void 0 ? _a2 : [];
    this._orderedPolicies = void 0;
  }
  addPolicy(policy, options2 = {}) {
    if (options2.phase && options2.afterPhase) {
      throw new Error("Policies inside a phase cannot specify afterPhase.");
    }
    if (options2.phase && !ValidPhaseNames.has(options2.phase)) {
      throw new Error(`Invalid phase name: ${options2.phase}`);
    }
    if (options2.afterPhase && !ValidPhaseNames.has(options2.afterPhase)) {
      throw new Error(`Invalid afterPhase name: ${options2.afterPhase}`);
    }
    this._policies.push({
      policy,
      options: options2
    });
    this._orderedPolicies = void 0;
  }
  removePolicy(options2) {
    const removedPolicies = [];
    this._policies = this._policies.filter((policyDescriptor) => {
      if (options2.name && policyDescriptor.policy.name === options2.name || options2.phase && policyDescriptor.options.phase === options2.phase) {
        removedPolicies.push(policyDescriptor.policy);
        return false;
      } else {
        return true;
      }
    });
    this._orderedPolicies = void 0;
    return removedPolicies;
  }
  sendRequest(httpClient, request3) {
    const policies = this.getOrderedPolicies();
    const pipeline = policies.reduceRight((next, policy) => {
      return (req) => {
        return policy.sendRequest(req, next);
      };
    }, (req) => httpClient.sendRequest(req));
    return pipeline(request3);
  }
  getOrderedPolicies() {
    if (!this._orderedPolicies) {
      this._orderedPolicies = this.orderPolicies();
    }
    return this._orderedPolicies;
  }
  clone() {
    return new HttpPipeline(this._policies);
  }
  static create() {
    return new HttpPipeline();
  }
  orderPolicies() {
    const result = [];
    const policyMap = /* @__PURE__ */ new Map();
    function createPhase(name) {
      return {
        name,
        policies: /* @__PURE__ */ new Set(),
        hasRun: false,
        hasAfterPolicies: false
      };
    }
    const serializePhase = createPhase("Serialize");
    const noPhase = createPhase("None");
    const deserializePhase = createPhase("Deserialize");
    const retryPhase = createPhase("Retry");
    const signPhase = createPhase("Sign");
    const orderedPhases = [serializePhase, noPhase, deserializePhase, retryPhase, signPhase];
    function getPhase(phase) {
      if (phase === "Retry") {
        return retryPhase;
      } else if (phase === "Serialize") {
        return serializePhase;
      } else if (phase === "Deserialize") {
        return deserializePhase;
      } else if (phase === "Sign") {
        return signPhase;
      } else {
        return noPhase;
      }
    }
    for (const descriptor of this._policies) {
      const policy = descriptor.policy;
      const options2 = descriptor.options;
      const policyName = policy.name;
      if (policyMap.has(policyName)) {
        throw new Error("Duplicate policy names not allowed in pipeline");
      }
      const node2 = {
        policy,
        dependsOn: /* @__PURE__ */ new Set(),
        dependants: /* @__PURE__ */ new Set()
      };
      if (options2.afterPhase) {
        node2.afterPhase = getPhase(options2.afterPhase);
        node2.afterPhase.hasAfterPolicies = true;
      }
      policyMap.set(policyName, node2);
      const phase = getPhase(options2.phase);
      phase.policies.add(node2);
    }
    for (const descriptor of this._policies) {
      const { policy, options: options2 } = descriptor;
      const policyName = policy.name;
      const node2 = policyMap.get(policyName);
      if (!node2) {
        throw new Error(`Missing node for policy ${policyName}`);
      }
      if (options2.afterPolicies) {
        for (const afterPolicyName of options2.afterPolicies) {
          const afterNode = policyMap.get(afterPolicyName);
          if (afterNode) {
            node2.dependsOn.add(afterNode);
            afterNode.dependants.add(node2);
          }
        }
      }
      if (options2.beforePolicies) {
        for (const beforePolicyName of options2.beforePolicies) {
          const beforeNode = policyMap.get(beforePolicyName);
          if (beforeNode) {
            beforeNode.dependsOn.add(node2);
            node2.dependants.add(beforeNode);
          }
        }
      }
    }
    function walkPhase(phase) {
      phase.hasRun = true;
      for (const node2 of phase.policies) {
        if (node2.afterPhase && (!node2.afterPhase.hasRun || node2.afterPhase.policies.size)) {
          continue;
        }
        if (node2.dependsOn.size === 0) {
          result.push(node2.policy);
          for (const dependant of node2.dependants) {
            dependant.dependsOn.delete(node2);
          }
          policyMap.delete(node2.policy.name);
          phase.policies.delete(node2);
        }
      }
    }
    function walkPhases() {
      for (const phase of orderedPhases) {
        walkPhase(phase);
        if (phase.policies.size > 0 && phase !== noPhase) {
          if (!noPhase.hasRun) {
            walkPhase(noPhase);
          }
          return;
        }
        if (phase.hasAfterPolicies) {
          walkPhase(noPhase);
        }
      }
    }
    let iteration = 0;
    while (policyMap.size > 0) {
      iteration++;
      const initialResultLength = result.length;
      walkPhases();
      if (result.length <= initialResultLength && iteration > 1) {
        throw new Error("Cannot satisfy policy dependencies due to requirements cycle.");
      }
    }
    return result;
  }
};
function createEmptyPipeline() {
  return HttpPipeline.create();
}
function log(message, ...args) {
  process.stderr.write(`${import_util.default.format(message, ...args)}${import_os.EOL}`);
}
var debugEnvVariable = typeof process !== "undefined" && process.env && process.env.DEBUG || void 0;
var enabledString;
var enabledNamespaces = [];
var skippedNamespaces = [];
var debuggers = [];
if (debugEnvVariable) {
  enable(debugEnvVariable);
}
var debugObj = Object.assign((namespace) => {
  return createDebugger(namespace);
}, {
  enable,
  enabled,
  disable,
  log
});
function enable(namespaces) {
  enabledString = namespaces;
  enabledNamespaces = [];
  skippedNamespaces = [];
  const wildcard = /\*/g;
  const namespaceList = namespaces.split(",").map((ns) => ns.trim().replace(wildcard, ".*?"));
  for (const ns of namespaceList) {
    if (ns.startsWith("-")) {
      skippedNamespaces.push(new RegExp(`^${ns.substr(1)}$`));
    } else {
      enabledNamespaces.push(new RegExp(`^${ns}$`));
    }
  }
  for (const instance of debuggers) {
    instance.enabled = enabled(instance.namespace);
  }
}
function enabled(namespace) {
  if (namespace.endsWith("*")) {
    return true;
  }
  for (const skipped of skippedNamespaces) {
    if (skipped.test(namespace)) {
      return false;
    }
  }
  for (const enabledNamespace of enabledNamespaces) {
    if (enabledNamespace.test(namespace)) {
      return true;
    }
  }
  return false;
}
function disable() {
  const result = enabledString || "";
  enable("");
  return result;
}
function createDebugger(namespace) {
  const newDebugger = Object.assign(debug2, {
    enabled: enabled(namespace),
    destroy,
    log: debugObj.log,
    namespace,
    extend
  });
  function debug2(...args) {
    if (!newDebugger.enabled) {
      return;
    }
    if (args.length > 0) {
      args[0] = `${namespace} ${args[0]}`;
    }
    newDebugger.log(...args);
  }
  debuggers.push(newDebugger);
  return newDebugger;
}
function destroy() {
  const index = debuggers.indexOf(this);
  if (index >= 0) {
    debuggers.splice(index, 1);
    return true;
  }
  return false;
}
function extend(namespace) {
  const newDebugger = createDebugger(`${this.namespace}:${namespace}`);
  newDebugger.log = this.log;
  return newDebugger;
}
var debug$4 = debugObj;
var registeredLoggers = /* @__PURE__ */ new Set();
var logLevelFromEnv = typeof process !== "undefined" && process.env && process.env.AZURE_LOG_LEVEL || void 0;
var azureLogLevel;
var AzureLogger = debug$4("azure");
AzureLogger.log = (...args) => {
  debug$4.log(...args);
};
var AZURE_LOG_LEVELS = ["verbose", "info", "warning", "error"];
if (logLevelFromEnv) {
  if (isAzureLogLevel(logLevelFromEnv)) {
    setLogLevel(logLevelFromEnv);
  } else {
    console.error(`AZURE_LOG_LEVEL set to unknown log level '${logLevelFromEnv}'; logging is not enabled. Acceptable values: ${AZURE_LOG_LEVELS.join(", ")}.`);
  }
}
function setLogLevel(level) {
  if (level && !isAzureLogLevel(level)) {
    throw new Error(`Unknown log level '${level}'. Acceptable values: ${AZURE_LOG_LEVELS.join(",")}`);
  }
  azureLogLevel = level;
  const enabledNamespaces2 = [];
  for (const logger2 of registeredLoggers) {
    if (shouldEnable(logger2)) {
      enabledNamespaces2.push(logger2.namespace);
    }
  }
  debug$4.enable(enabledNamespaces2.join(","));
}
var levelMap = {
  verbose: 400,
  info: 300,
  warning: 200,
  error: 100
};
function createClientLogger(namespace) {
  const clientRootLogger = AzureLogger.extend(namespace);
  patchLogMethod(AzureLogger, clientRootLogger);
  return {
    error: createLogger(clientRootLogger, "error"),
    warning: createLogger(clientRootLogger, "warning"),
    info: createLogger(clientRootLogger, "info"),
    verbose: createLogger(clientRootLogger, "verbose")
  };
}
function patchLogMethod(parent, child) {
  child.log = (...args) => {
    parent.log(...args);
  };
}
function createLogger(parent, level) {
  const logger2 = Object.assign(parent.extend(level), {
    level
  });
  patchLogMethod(parent, logger2);
  if (shouldEnable(logger2)) {
    const enabledNamespaces2 = debug$4.disable();
    debug$4.enable(enabledNamespaces2 + "," + logger2.namespace);
  }
  registeredLoggers.add(logger2);
  return logger2;
}
function shouldEnable(logger2) {
  return Boolean(azureLogLevel && levelMap[logger2.level] <= levelMap[azureLogLevel]);
}
function isAzureLogLevel(logLevel) {
  return AZURE_LOG_LEVELS.includes(logLevel);
}
var logger$1 = createClientLogger("core-rest-pipeline");
var _a$1;
var isNode = typeof process !== "undefined" && Boolean(process.version) && Boolean((_a$1 = process.versions) === null || _a$1 === void 0 ? void 0 : _a$1.node);
var listenersMap = /* @__PURE__ */ new WeakMap();
var abortedMap = /* @__PURE__ */ new WeakMap();
var AbortSignal = class {
  constructor() {
    this.onabort = null;
    listenersMap.set(this, []);
    abortedMap.set(this, false);
  }
  /**
   * Status of whether aborted or not.
   *
   * @readonly
   */
  get aborted() {
    if (!abortedMap.has(this)) {
      throw new TypeError("Expected `this` to be an instance of AbortSignal.");
    }
    return abortedMap.get(this);
  }
  /**
   * Creates a new AbortSignal instance that will never be aborted.
   *
   * @readonly
   */
  static get none() {
    return new AbortSignal();
  }
  /**
   * Added new "abort" event listener, only support "abort" event.
   *
   * @param _type - Only support "abort" event
   * @param listener - The listener to be added
   */
  addEventListener(_type, listener) {
    if (!listenersMap.has(this)) {
      throw new TypeError("Expected `this` to be an instance of AbortSignal.");
    }
    const listeners = listenersMap.get(this);
    listeners.push(listener);
  }
  /**
   * Remove "abort" event listener, only support "abort" event.
   *
   * @param _type - Only support "abort" event
   * @param listener - The listener to be removed
   */
  removeEventListener(_type, listener) {
    if (!listenersMap.has(this)) {
      throw new TypeError("Expected `this` to be an instance of AbortSignal.");
    }
    const listeners = listenersMap.get(this);
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  /**
   * Dispatches a synthetic event to the AbortSignal.
   */
  dispatchEvent(_event) {
    throw new Error("This is a stub dispatchEvent implementation that should not be used.  It only exists for type-checking purposes.");
  }
};
function abortSignal(signal) {
  if (signal.aborted) {
    return;
  }
  if (signal.onabort) {
    signal.onabort.call(signal);
  }
  const listeners = listenersMap.get(signal);
  if (listeners) {
    listeners.slice().forEach((listener) => {
      listener.call(signal, { type: "abort" });
    });
  }
  abortedMap.set(signal, true);
}
var AbortError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "AbortError";
  }
};
var AbortController = class {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  constructor(parentSignals) {
    this._signal = new AbortSignal();
    if (!parentSignals) {
      return;
    }
    if (!Array.isArray(parentSignals)) {
      parentSignals = arguments;
    }
    for (const parentSignal of parentSignals) {
      if (parentSignal.aborted) {
        this.abort();
      } else {
        parentSignal.addEventListener("abort", () => {
          this.abort();
        });
      }
    }
  }
  /**
   * The AbortSignal associated with this controller that will signal aborted
   * when the abort method is called on this controller.
   *
   * @readonly
   */
  get signal() {
    return this._signal;
  }
  /**
   * Signal that any operations passed this controller's associated abort signal
   * to cancel any remaining work and throw an `AbortError`.
   */
  abort() {
    abortSignal(this._signal);
  }
  /**
   * Creates a new AbortSignal instance that will abort after the provided ms.
   * @param ms - Elapsed time in milliseconds to trigger an abort.
   */
  static timeout(ms2) {
    const signal = new AbortSignal();
    const timer = setTimeout(abortSignal, ms2, signal);
    if (typeof timer.unref === "function") {
      timer.unref();
    }
    return signal;
  }
};
function getRandomIntegerInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  const offset = Math.floor(Math.random() * (max - min + 1));
  return offset + min;
}
function isObject(input) {
  return typeof input === "object" && input !== null && !Array.isArray(input) && !(input instanceof RegExp) && !(input instanceof Date);
}
function isError(e) {
  if (isObject(e)) {
    const hasName = typeof e.name === "string";
    const hasMessage = typeof e.message === "string";
    return hasName && hasMessage;
  }
  return false;
}
function getErrorMessage(e) {
  if (isError(e)) {
    return e.message;
  } else {
    let stringified;
    try {
      if (typeof e === "object" && e) {
        stringified = JSON.stringify(e);
      } else {
        stringified = String(e);
      }
    } catch (err) {
      stringified = "[unable to stringify input]";
    }
    return `Unknown error ${stringified}`;
  }
}
function generateUUID() {
  let uuid = "";
  for (let i = 0; i < 32; i++) {
    const randomNumber = Math.floor(Math.random() * 16);
    if (i === 12) {
      uuid += "4";
    } else if (i === 16) {
      uuid += randomNumber & 3 | 8;
    } else {
      uuid += randomNumber.toString(16);
    }
    if (i === 7 || i === 11 || i === 15 || i === 19) {
      uuid += "-";
    }
  }
  return uuid;
}
var _a;
var uuidFunction = typeof ((_a = globalThis === null || globalThis === void 0 ? void 0 : globalThis.crypto) === null || _a === void 0 ? void 0 : _a.randomUUID) === "function" ? globalThis.crypto.randomUUID.bind(globalThis.crypto) : import_crypto.randomUUID;
if (!uuidFunction) {
  uuidFunction = generateUUID;
}
function randomUUID() {
  return uuidFunction();
}
var RedactedString = "REDACTED";
var defaultAllowedHeaderNames = [
  "x-ms-client-request-id",
  "x-ms-return-client-request-id",
  "x-ms-useragent",
  "x-ms-correlation-request-id",
  "x-ms-request-id",
  "client-request-id",
  "ms-cv",
  "return-client-request-id",
  "traceparent",
  "Access-Control-Allow-Credentials",
  "Access-Control-Allow-Headers",
  "Access-Control-Allow-Methods",
  "Access-Control-Allow-Origin",
  "Access-Control-Expose-Headers",
  "Access-Control-Max-Age",
  "Access-Control-Request-Headers",
  "Access-Control-Request-Method",
  "Origin",
  "Accept",
  "Accept-Encoding",
  "Cache-Control",
  "Connection",
  "Content-Length",
  "Content-Type",
  "Date",
  "ETag",
  "Expires",
  "If-Match",
  "If-Modified-Since",
  "If-None-Match",
  "If-Unmodified-Since",
  "Last-Modified",
  "Pragma",
  "Request-Id",
  "Retry-After",
  "Server",
  "Transfer-Encoding",
  "User-Agent",
  "WWW-Authenticate"
];
var defaultAllowedQueryParameters = ["api-version"];
var Sanitizer = class {
  constructor({ additionalAllowedHeaderNames: allowedHeaderNames = [], additionalAllowedQueryParameters: allowedQueryParameters = [] } = {}) {
    allowedHeaderNames = defaultAllowedHeaderNames.concat(allowedHeaderNames);
    allowedQueryParameters = defaultAllowedQueryParameters.concat(allowedQueryParameters);
    this.allowedHeaderNames = new Set(allowedHeaderNames.map((n) => n.toLowerCase()));
    this.allowedQueryParameters = new Set(allowedQueryParameters.map((p) => p.toLowerCase()));
  }
  sanitize(obj) {
    const seen = /* @__PURE__ */ new Set();
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Error) {
        return Object.assign(Object.assign({}, value), { name: value.name, message: value.message });
      }
      if (key === "headers") {
        return this.sanitizeHeaders(value);
      } else if (key === "url") {
        return this.sanitizeUrl(value);
      } else if (key === "query") {
        return this.sanitizeQuery(value);
      } else if (key === "body") {
        return void 0;
      } else if (key === "response") {
        return void 0;
      } else if (key === "operationSpec") {
        return void 0;
      } else if (Array.isArray(value) || isObject(value)) {
        if (seen.has(value)) {
          return "[Circular]";
        }
        seen.add(value);
      }
      return value;
    }, 2);
  }
  sanitizeHeaders(obj) {
    const sanitized = {};
    for (const key of Object.keys(obj)) {
      if (this.allowedHeaderNames.has(key.toLowerCase())) {
        sanitized[key] = obj[key];
      } else {
        sanitized[key] = RedactedString;
      }
    }
    return sanitized;
  }
  sanitizeQuery(value) {
    if (typeof value !== "object" || value === null) {
      return value;
    }
    const sanitized = {};
    for (const k of Object.keys(value)) {
      if (this.allowedQueryParameters.has(k.toLowerCase())) {
        sanitized[k] = value[k];
      } else {
        sanitized[k] = RedactedString;
      }
    }
    return sanitized;
  }
  sanitizeUrl(value) {
    if (typeof value !== "string" || value === null) {
      return value;
    }
    const url = new URL(value);
    if (!url.search) {
      return value;
    }
    for (const [key] of url.searchParams) {
      if (!this.allowedQueryParameters.has(key.toLowerCase())) {
        url.searchParams.set(key, RedactedString);
      }
    }
    return url.toString();
  }
};
var logPolicyName = "logPolicy";
function logPolicy(options2 = {}) {
  var _a2;
  const logger2 = (_a2 = options2.logger) !== null && _a2 !== void 0 ? _a2 : logger$1.info;
  const sanitizer = new Sanitizer({
    additionalAllowedHeaderNames: options2.additionalAllowedHeaderNames,
    additionalAllowedQueryParameters: options2.additionalAllowedQueryParameters
  });
  return {
    name: logPolicyName,
    async sendRequest(request3, next) {
      if (!logger2.enabled) {
        return next(request3);
      }
      logger2(`Request: ${sanitizer.sanitize(request3)}`);
      const response = await next(request3);
      logger2(`Response status code: ${response.status}`);
      logger2(`Headers: ${sanitizer.sanitize(response.headers)}`);
      return response;
    }
  };
}
var redirectPolicyName = "redirectPolicy";
var allowedRedirect = ["GET", "HEAD"];
function redirectPolicy(options2 = {}) {
  const { maxRetries = 20 } = options2;
  return {
    name: redirectPolicyName,
    async sendRequest(request3, next) {
      const response = await next(request3);
      return handleRedirect(next, response, maxRetries);
    }
  };
}
async function handleRedirect(next, response, maxRetries, currentRetries = 0) {
  const { request: request3, status, headers } = response;
  const locationHeader = headers.get("location");
  if (locationHeader && (status === 300 || status === 301 && allowedRedirect.includes(request3.method) || status === 302 && allowedRedirect.includes(request3.method) || status === 303 && request3.method === "POST" || status === 307) && currentRetries < maxRetries) {
    const url = new URL(locationHeader, request3.url);
    request3.url = url.toString();
    if (status === 303) {
      request3.method = "GET";
      request3.headers.delete("Content-Length");
      delete request3.body;
    }
    request3.headers.delete("Authorization");
    const res = await next(request3);
    return handleRedirect(next, res, maxRetries, currentRetries + 1);
  }
  return response;
}
function getHeaderName() {
  return "User-Agent";
}
function setPlatformSpecificData(map) {
  map.set("Node", process.version);
  map.set("OS", `(${os.arch()}-${os.type()}-${os.release()})`);
}
var SDK_VERSION = "1.11.0";
var DEFAULT_RETRY_POLICY_COUNT = 3;
function getUserAgentString(telemetryInfo) {
  const parts = [];
  for (const [key, value] of telemetryInfo) {
    const token = value ? `${key}/${value}` : key;
    parts.push(token);
  }
  return parts.join(" ");
}
function getUserAgentHeaderName() {
  return getHeaderName();
}
function getUserAgentValue(prefix) {
  const runtimeInfo = /* @__PURE__ */ new Map();
  runtimeInfo.set("core-rest-pipeline", SDK_VERSION);
  setPlatformSpecificData(runtimeInfo);
  const defaultAgent = getUserAgentString(runtimeInfo);
  const userAgentValue = prefix ? `${prefix} ${defaultAgent}` : defaultAgent;
  return userAgentValue;
}
var UserAgentHeaderName = getUserAgentHeaderName();
var userAgentPolicyName = "userAgentPolicy";
function userAgentPolicy(options2 = {}) {
  const userAgentValue = getUserAgentValue(options2.userAgentPrefix);
  return {
    name: userAgentPolicyName,
    async sendRequest(request3, next) {
      if (!request3.headers.has(UserAgentHeaderName)) {
        request3.headers.set(UserAgentHeaderName, userAgentValue);
      }
      return next(request3);
    }
  };
}
var decompressResponsePolicyName = "decompressResponsePolicy";
function decompressResponsePolicy() {
  return {
    name: decompressResponsePolicyName,
    async sendRequest(request3, next) {
      if (request3.method !== "HEAD") {
        request3.headers.set("Accept-Encoding", "gzip,deflate");
      }
      return next(request3);
    }
  };
}
var StandardAbortMessage = "The operation was aborted.";
function delay(delayInMs, value, options2) {
  return new Promise((resolve, reject) => {
    let timer = void 0;
    let onAborted = void 0;
    const rejectOnAbort = () => {
      return reject(new AbortError((options2 === null || options2 === void 0 ? void 0 : options2.abortErrorMsg) ? options2 === null || options2 === void 0 ? void 0 : options2.abortErrorMsg : StandardAbortMessage));
    };
    const removeListeners = () => {
      if ((options2 === null || options2 === void 0 ? void 0 : options2.abortSignal) && onAborted) {
        options2.abortSignal.removeEventListener("abort", onAborted);
      }
    };
    onAborted = () => {
      if (timer) {
        clearTimeout(timer);
      }
      removeListeners();
      return rejectOnAbort();
    };
    if ((options2 === null || options2 === void 0 ? void 0 : options2.abortSignal) && options2.abortSignal.aborted) {
      return rejectOnAbort();
    }
    timer = setTimeout(() => {
      removeListeners();
      resolve(value);
    }, delayInMs);
    if (options2 === null || options2 === void 0 ? void 0 : options2.abortSignal) {
      options2.abortSignal.addEventListener("abort", onAborted);
    }
  });
}
function parseHeaderValueAsNumber(response, headerName) {
  const value = response.headers.get(headerName);
  if (!value)
    return;
  const valueAsNum = Number(value);
  if (Number.isNaN(valueAsNum))
    return;
  return valueAsNum;
}
var RetryAfterHeader = "Retry-After";
var AllRetryAfterHeaders = ["retry-after-ms", "x-ms-retry-after-ms", RetryAfterHeader];
function getRetryAfterInMs(response) {
  if (!(response && [429, 503].includes(response.status)))
    return void 0;
  try {
    for (const header of AllRetryAfterHeaders) {
      const retryAfterValue = parseHeaderValueAsNumber(response, header);
      if (retryAfterValue === 0 || retryAfterValue) {
        const multiplyingFactor = header === RetryAfterHeader ? 1e3 : 1;
        return retryAfterValue * multiplyingFactor;
      }
    }
    const retryAfterHeader = response.headers.get(RetryAfterHeader);
    if (!retryAfterHeader)
      return;
    const date = Date.parse(retryAfterHeader);
    const diff = date - Date.now();
    return Number.isFinite(diff) ? Math.max(0, diff) : void 0;
  } catch (e) {
    return void 0;
  }
}
function isThrottlingRetryResponse(response) {
  return Number.isFinite(getRetryAfterInMs(response));
}
function throttlingRetryStrategy() {
  return {
    name: "throttlingRetryStrategy",
    retry({ response }) {
      const retryAfterInMs = getRetryAfterInMs(response);
      if (!Number.isFinite(retryAfterInMs)) {
        return { skipStrategy: true };
      }
      return {
        retryAfterInMs
      };
    }
  };
}
var DEFAULT_CLIENT_RETRY_INTERVAL = 1e3;
var DEFAULT_CLIENT_MAX_RETRY_INTERVAL = 1e3 * 64;
function exponentialRetryStrategy(options2 = {}) {
  var _a2, _b;
  const retryInterval = (_a2 = options2.retryDelayInMs) !== null && _a2 !== void 0 ? _a2 : DEFAULT_CLIENT_RETRY_INTERVAL;
  const maxRetryInterval = (_b = options2.maxRetryDelayInMs) !== null && _b !== void 0 ? _b : DEFAULT_CLIENT_MAX_RETRY_INTERVAL;
  let retryAfterInMs = retryInterval;
  return {
    name: "exponentialRetryStrategy",
    retry({ retryCount, response, responseError }) {
      const matchedSystemError = isSystemError(responseError);
      const ignoreSystemErrors = matchedSystemError && options2.ignoreSystemErrors;
      const isExponential = isExponentialRetryResponse(response);
      const ignoreExponentialResponse = isExponential && options2.ignoreHttpStatusCodes;
      const unknownResponse = response && (isThrottlingRetryResponse(response) || !isExponential);
      if (unknownResponse || ignoreExponentialResponse || ignoreSystemErrors) {
        return { skipStrategy: true };
      }
      if (responseError && !matchedSystemError && !isExponential) {
        return { errorToThrow: responseError };
      }
      const exponentialDelay = retryAfterInMs * Math.pow(2, retryCount);
      const clampedExponentialDelay = Math.min(maxRetryInterval, exponentialDelay);
      retryAfterInMs = clampedExponentialDelay / 2 + getRandomIntegerInclusive(0, clampedExponentialDelay / 2);
      return { retryAfterInMs };
    }
  };
}
function isExponentialRetryResponse(response) {
  return Boolean(response && response.status !== void 0 && (response.status >= 500 || response.status === 408) && response.status !== 501 && response.status !== 505);
}
function isSystemError(err) {
  if (!err) {
    return false;
  }
  return err.code === "ETIMEDOUT" || err.code === "ESOCKETTIMEDOUT" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "ENOENT";
}
var retryPolicyLogger = createClientLogger("core-rest-pipeline retryPolicy");
var retryPolicyName = "retryPolicy";
function retryPolicy(strategies, options2 = { maxRetries: DEFAULT_RETRY_POLICY_COUNT }) {
  const logger2 = options2.logger || retryPolicyLogger;
  return {
    name: retryPolicyName,
    async sendRequest(request3, next) {
      var _a2, _b;
      let response;
      let responseError;
      let retryCount = -1;
      retryRequest:
        while (true) {
          retryCount += 1;
          response = void 0;
          responseError = void 0;
          try {
            logger2.info(`Retry ${retryCount}: Attempting to send request`, request3.requestId);
            response = await next(request3);
            logger2.info(`Retry ${retryCount}: Received a response from request`, request3.requestId);
          } catch (e) {
            logger2.error(`Retry ${retryCount}: Received an error from request`, request3.requestId);
            responseError = e;
            if (!e || responseError.name !== "RestError") {
              throw e;
            }
            response = responseError.response;
          }
          if ((_a2 = request3.abortSignal) === null || _a2 === void 0 ? void 0 : _a2.aborted) {
            logger2.error(`Retry ${retryCount}: Request aborted.`);
            const abortError = new AbortError();
            throw abortError;
          }
          if (retryCount >= ((_b = options2.maxRetries) !== null && _b !== void 0 ? _b : DEFAULT_RETRY_POLICY_COUNT)) {
            logger2.info(`Retry ${retryCount}: Maximum retries reached. Returning the last received response, or throwing the last received error.`);
            if (responseError) {
              throw responseError;
            } else if (response) {
              return response;
            } else {
              throw new Error("Maximum retries reached with no response or error to throw");
            }
          }
          logger2.info(`Retry ${retryCount}: Processing ${strategies.length} retry strategies.`);
          strategiesLoop:
            for (const strategy of strategies) {
              const strategyLogger = strategy.logger || retryPolicyLogger;
              strategyLogger.info(`Retry ${retryCount}: Processing retry strategy ${strategy.name}.`);
              const modifiers = strategy.retry({
                retryCount,
                response,
                responseError
              });
              if (modifiers.skipStrategy) {
                strategyLogger.info(`Retry ${retryCount}: Skipped.`);
                continue strategiesLoop;
              }
              const { errorToThrow, retryAfterInMs, redirectTo } = modifiers;
              if (errorToThrow) {
                strategyLogger.error(`Retry ${retryCount}: Retry strategy ${strategy.name} throws error:`, errorToThrow);
                throw errorToThrow;
              }
              if (retryAfterInMs || retryAfterInMs === 0) {
                strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} retries after ${retryAfterInMs}`);
                await delay(retryAfterInMs, void 0, { abortSignal: request3.abortSignal });
                continue retryRequest;
              }
              if (redirectTo) {
                strategyLogger.info(`Retry ${retryCount}: Retry strategy ${strategy.name} redirects to ${redirectTo}`);
                request3.url = redirectTo;
                continue retryRequest;
              }
            }
          if (responseError) {
            logger2.info(`None of the retry strategies could work with the received error. Throwing it.`);
            throw responseError;
          }
          if (response) {
            logger2.info(`None of the retry strategies could work with the received response. Returning it.`);
            return response;
          }
        }
    }
  };
}
var defaultRetryPolicyName = "defaultRetryPolicy";
function defaultRetryPolicy(options2 = {}) {
  var _a2;
  return {
    name: defaultRetryPolicyName,
    sendRequest: retryPolicy([throttlingRetryStrategy(), exponentialRetryStrategy(options2)], {
      maxRetries: (_a2 = options2.maxRetries) !== null && _a2 !== void 0 ? _a2 : DEFAULT_RETRY_POLICY_COUNT
    }).sendRequest
  };
}
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var Stream$2 = import_stream.default.Stream;
var util$2 = import_util.default;
var delayed_stream = DelayedStream$1;
function DelayedStream$1() {
  this.source = null;
  this.dataSize = 0;
  this.maxDataSize = 1024 * 1024;
  this.pauseStream = true;
  this._maxDataSizeExceeded = false;
  this._released = false;
  this._bufferedEvents = [];
}
util$2.inherits(DelayedStream$1, Stream$2);
DelayedStream$1.create = function(source, options2) {
  var delayedStream = new this();
  options2 = options2 || {};
  for (var option in options2) {
    delayedStream[option] = options2[option];
  }
  delayedStream.source = source;
  var realEmit = source.emit;
  source.emit = function() {
    delayedStream._handleEmit(arguments);
    return realEmit.apply(source, arguments);
  };
  source.on("error", function() {
  });
  if (delayedStream.pauseStream) {
    source.pause();
  }
  return delayedStream;
};
Object.defineProperty(DelayedStream$1.prototype, "readable", {
  configurable: true,
  enumerable: true,
  get: function() {
    return this.source.readable;
  }
});
DelayedStream$1.prototype.setEncoding = function() {
  return this.source.setEncoding.apply(this.source, arguments);
};
DelayedStream$1.prototype.resume = function() {
  if (!this._released) {
    this.release();
  }
  this.source.resume();
};
DelayedStream$1.prototype.pause = function() {
  this.source.pause();
};
DelayedStream$1.prototype.release = function() {
  this._released = true;
  this._bufferedEvents.forEach(function(args) {
    this.emit.apply(this, args);
  }.bind(this));
  this._bufferedEvents = [];
};
DelayedStream$1.prototype.pipe = function() {
  var r = Stream$2.prototype.pipe.apply(this, arguments);
  this.resume();
  return r;
};
DelayedStream$1.prototype._handleEmit = function(args) {
  if (this._released) {
    this.emit.apply(this, args);
    return;
  }
  if (args[0] === "data") {
    this.dataSize += args[1].length;
    this._checkIfMaxDataSizeExceeded();
  }
  this._bufferedEvents.push(args);
};
DelayedStream$1.prototype._checkIfMaxDataSizeExceeded = function() {
  if (this._maxDataSizeExceeded) {
    return;
  }
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  this._maxDataSizeExceeded = true;
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this.emit("error", new Error(message));
};
var util$1 = import_util.default;
var Stream$1 = import_stream.default.Stream;
var DelayedStream = delayed_stream;
var combined_stream = CombinedStream$1;
function CombinedStream$1() {
  this.writable = false;
  this.readable = true;
  this.dataSize = 0;
  this.maxDataSize = 2 * 1024 * 1024;
  this.pauseStreams = true;
  this._released = false;
  this._streams = [];
  this._currentStream = null;
  this._insideLoop = false;
  this._pendingNext = false;
}
util$1.inherits(CombinedStream$1, Stream$1);
CombinedStream$1.create = function(options2) {
  var combinedStream = new this();
  options2 = options2 || {};
  for (var option in options2) {
    combinedStream[option] = options2[option];
  }
  return combinedStream;
};
CombinedStream$1.isStreamLike = function(stream) {
  return typeof stream !== "function" && typeof stream !== "string" && typeof stream !== "boolean" && typeof stream !== "number" && !Buffer.isBuffer(stream);
};
CombinedStream$1.prototype.append = function(stream) {
  var isStreamLike = CombinedStream$1.isStreamLike(stream);
  if (isStreamLike) {
    if (!(stream instanceof DelayedStream)) {
      var newStream = DelayedStream.create(stream, {
        maxDataSize: Infinity,
        pauseStream: this.pauseStreams
      });
      stream.on("data", this._checkDataSize.bind(this));
      stream = newStream;
    }
    this._handleErrors(stream);
    if (this.pauseStreams) {
      stream.pause();
    }
  }
  this._streams.push(stream);
  return this;
};
CombinedStream$1.prototype.pipe = function(dest, options2) {
  Stream$1.prototype.pipe.call(this, dest, options2);
  this.resume();
  return dest;
};
CombinedStream$1.prototype._getNext = function() {
  this._currentStream = null;
  if (this._insideLoop) {
    this._pendingNext = true;
    return;
  }
  this._insideLoop = true;
  try {
    do {
      this._pendingNext = false;
      this._realGetNext();
    } while (this._pendingNext);
  } finally {
    this._insideLoop = false;
  }
};
CombinedStream$1.prototype._realGetNext = function() {
  var stream = this._streams.shift();
  if (typeof stream == "undefined") {
    this.end();
    return;
  }
  if (typeof stream !== "function") {
    this._pipeNext(stream);
    return;
  }
  var getStream = stream;
  getStream(function(stream2) {
    var isStreamLike = CombinedStream$1.isStreamLike(stream2);
    if (isStreamLike) {
      stream2.on("data", this._checkDataSize.bind(this));
      this._handleErrors(stream2);
    }
    this._pipeNext(stream2);
  }.bind(this));
};
CombinedStream$1.prototype._pipeNext = function(stream) {
  this._currentStream = stream;
  var isStreamLike = CombinedStream$1.isStreamLike(stream);
  if (isStreamLike) {
    stream.on("end", this._getNext.bind(this));
    stream.pipe(this, { end: false });
    return;
  }
  var value = stream;
  this.write(value);
  this._getNext();
};
CombinedStream$1.prototype._handleErrors = function(stream) {
  var self2 = this;
  stream.on("error", function(err) {
    self2._emitError(err);
  });
};
CombinedStream$1.prototype.write = function(data) {
  this.emit("data", data);
};
CombinedStream$1.prototype.pause = function() {
  if (!this.pauseStreams) {
    return;
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.pause == "function")
    this._currentStream.pause();
  this.emit("pause");
};
CombinedStream$1.prototype.resume = function() {
  if (!this._released) {
    this._released = true;
    this.writable = true;
    this._getNext();
  }
  if (this.pauseStreams && this._currentStream && typeof this._currentStream.resume == "function")
    this._currentStream.resume();
  this.emit("resume");
};
CombinedStream$1.prototype.end = function() {
  this._reset();
  this.emit("end");
};
CombinedStream$1.prototype.destroy = function() {
  this._reset();
  this.emit("close");
};
CombinedStream$1.prototype._reset = function() {
  this.writable = false;
  this._streams = [];
  this._currentStream = null;
};
CombinedStream$1.prototype._checkDataSize = function() {
  this._updateDataSize();
  if (this.dataSize <= this.maxDataSize) {
    return;
  }
  var message = "DelayedStream#maxDataSize of " + this.maxDataSize + " bytes exceeded.";
  this._emitError(new Error(message));
};
CombinedStream$1.prototype._updateDataSize = function() {
  this.dataSize = 0;
  var self2 = this;
  this._streams.forEach(function(stream) {
    if (!stream.dataSize) {
      return;
    }
    self2.dataSize += stream.dataSize;
  });
  if (this._currentStream && this._currentStream.dataSize) {
    this.dataSize += this._currentStream.dataSize;
  }
};
CombinedStream$1.prototype._emitError = function(err) {
  this._reset();
  this.emit("error", err);
};
var mimeTypes = {};
var require$$0 = {
  "application/1d-interleaved-parityfec": {
    source: "iana"
  },
  "application/3gpdash-qoe-report+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/3gpp-ims+xml": {
    source: "iana",
    compressible: true
  },
  "application/3gpphal+json": {
    source: "iana",
    compressible: true
  },
  "application/3gpphalforms+json": {
    source: "iana",
    compressible: true
  },
  "application/a2l": {
    source: "iana"
  },
  "application/ace+cbor": {
    source: "iana"
  },
  "application/activemessage": {
    source: "iana"
  },
  "application/activity+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-costmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-directory+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcost+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointcostparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointprop+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-endpointpropparams+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-error+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmap+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-networkmapfilter+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamcontrol+json": {
    source: "iana",
    compressible: true
  },
  "application/alto-updatestreamparams+json": {
    source: "iana",
    compressible: true
  },
  "application/aml": {
    source: "iana"
  },
  "application/andrew-inset": {
    source: "iana",
    extensions: [
      "ez"
    ]
  },
  "application/applefile": {
    source: "iana"
  },
  "application/applixware": {
    source: "apache",
    extensions: [
      "aw"
    ]
  },
  "application/at+jwt": {
    source: "iana"
  },
  "application/atf": {
    source: "iana"
  },
  "application/atfx": {
    source: "iana"
  },
  "application/atom+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atom"
    ]
  },
  "application/atomcat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomcat"
    ]
  },
  "application/atomdeleted+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomdeleted"
    ]
  },
  "application/atomicmail": {
    source: "iana"
  },
  "application/atomsvc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "atomsvc"
    ]
  },
  "application/atsc-dwd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dwd"
    ]
  },
  "application/atsc-dynamic-event-message": {
    source: "iana"
  },
  "application/atsc-held+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "held"
    ]
  },
  "application/atsc-rdt+json": {
    source: "iana",
    compressible: true
  },
  "application/atsc-rsat+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsat"
    ]
  },
  "application/atxml": {
    source: "iana"
  },
  "application/auth-policy+xml": {
    source: "iana",
    compressible: true
  },
  "application/bacnet-xdd+zip": {
    source: "iana",
    compressible: false
  },
  "application/batch-smtp": {
    source: "iana"
  },
  "application/bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/beep+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/calendar+json": {
    source: "iana",
    compressible: true
  },
  "application/calendar+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xcs"
    ]
  },
  "application/call-completion": {
    source: "iana"
  },
  "application/cals-1840": {
    source: "iana"
  },
  "application/captive+json": {
    source: "iana",
    compressible: true
  },
  "application/cbor": {
    source: "iana"
  },
  "application/cbor-seq": {
    source: "iana"
  },
  "application/cccex": {
    source: "iana"
  },
  "application/ccmp+xml": {
    source: "iana",
    compressible: true
  },
  "application/ccxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ccxml"
    ]
  },
  "application/cdfx+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdfx"
    ]
  },
  "application/cdmi-capability": {
    source: "iana",
    extensions: [
      "cdmia"
    ]
  },
  "application/cdmi-container": {
    source: "iana",
    extensions: [
      "cdmic"
    ]
  },
  "application/cdmi-domain": {
    source: "iana",
    extensions: [
      "cdmid"
    ]
  },
  "application/cdmi-object": {
    source: "iana",
    extensions: [
      "cdmio"
    ]
  },
  "application/cdmi-queue": {
    source: "iana",
    extensions: [
      "cdmiq"
    ]
  },
  "application/cdni": {
    source: "iana"
  },
  "application/cea": {
    source: "iana"
  },
  "application/cea-2018+xml": {
    source: "iana",
    compressible: true
  },
  "application/cellml+xml": {
    source: "iana",
    compressible: true
  },
  "application/cfw": {
    source: "iana"
  },
  "application/city+json": {
    source: "iana",
    compressible: true
  },
  "application/clr": {
    source: "iana"
  },
  "application/clue+xml": {
    source: "iana",
    compressible: true
  },
  "application/clue_info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cms": {
    source: "iana"
  },
  "application/cnrp+xml": {
    source: "iana",
    compressible: true
  },
  "application/coap-group+json": {
    source: "iana",
    compressible: true
  },
  "application/coap-payload": {
    source: "iana"
  },
  "application/commonground": {
    source: "iana"
  },
  "application/conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/cose": {
    source: "iana"
  },
  "application/cose-key": {
    source: "iana"
  },
  "application/cose-key-set": {
    source: "iana"
  },
  "application/cpl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cpl"
    ]
  },
  "application/csrattrs": {
    source: "iana"
  },
  "application/csta+xml": {
    source: "iana",
    compressible: true
  },
  "application/cstadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/csvm+json": {
    source: "iana",
    compressible: true
  },
  "application/cu-seeme": {
    source: "apache",
    extensions: [
      "cu"
    ]
  },
  "application/cwt": {
    source: "iana"
  },
  "application/cybercash": {
    source: "iana"
  },
  "application/dart": {
    compressible: true
  },
  "application/dash+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpd"
    ]
  },
  "application/dash-patch+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpp"
    ]
  },
  "application/dashdelta": {
    source: "iana"
  },
  "application/davmount+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "davmount"
    ]
  },
  "application/dca-rft": {
    source: "iana"
  },
  "application/dcd": {
    source: "iana"
  },
  "application/dec-dx": {
    source: "iana"
  },
  "application/dialog-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/dicom": {
    source: "iana"
  },
  "application/dicom+json": {
    source: "iana",
    compressible: true
  },
  "application/dicom+xml": {
    source: "iana",
    compressible: true
  },
  "application/dii": {
    source: "iana"
  },
  "application/dit": {
    source: "iana"
  },
  "application/dns": {
    source: "iana"
  },
  "application/dns+json": {
    source: "iana",
    compressible: true
  },
  "application/dns-message": {
    source: "iana"
  },
  "application/docbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dbk"
    ]
  },
  "application/dots+cbor": {
    source: "iana"
  },
  "application/dskpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/dssc+der": {
    source: "iana",
    extensions: [
      "dssc"
    ]
  },
  "application/dssc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdssc"
    ]
  },
  "application/dvcs": {
    source: "iana"
  },
  "application/ecmascript": {
    source: "iana",
    compressible: true,
    extensions: [
      "es",
      "ecma"
    ]
  },
  "application/edi-consent": {
    source: "iana"
  },
  "application/edi-x12": {
    source: "iana",
    compressible: false
  },
  "application/edifact": {
    source: "iana",
    compressible: false
  },
  "application/efi": {
    source: "iana"
  },
  "application/elm+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/elm+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.cap+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/emergencycalldata.comment+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.control+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.deviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.ecall.msd": {
    source: "iana"
  },
  "application/emergencycalldata.providerinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.serviceinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.subscriberinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/emergencycalldata.veds+xml": {
    source: "iana",
    compressible: true
  },
  "application/emma+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emma"
    ]
  },
  "application/emotionml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "emotionml"
    ]
  },
  "application/encaprtp": {
    source: "iana"
  },
  "application/epp+xml": {
    source: "iana",
    compressible: true
  },
  "application/epub+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "epub"
    ]
  },
  "application/eshop": {
    source: "iana"
  },
  "application/exi": {
    source: "iana",
    extensions: [
      "exi"
    ]
  },
  "application/expect-ct-report+json": {
    source: "iana",
    compressible: true
  },
  "application/express": {
    source: "iana",
    extensions: [
      "exp"
    ]
  },
  "application/fastinfoset": {
    source: "iana"
  },
  "application/fastsoap": {
    source: "iana"
  },
  "application/fdt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fdt"
    ]
  },
  "application/fhir+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fhir+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/fido.trusted-apps+json": {
    compressible: true
  },
  "application/fits": {
    source: "iana"
  },
  "application/flexfec": {
    source: "iana"
  },
  "application/font-sfnt": {
    source: "iana"
  },
  "application/font-tdpfr": {
    source: "iana",
    extensions: [
      "pfr"
    ]
  },
  "application/font-woff": {
    source: "iana",
    compressible: false
  },
  "application/framework-attributes+xml": {
    source: "iana",
    compressible: true
  },
  "application/geo+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "geojson"
    ]
  },
  "application/geo+json-seq": {
    source: "iana"
  },
  "application/geopackage+sqlite3": {
    source: "iana"
  },
  "application/geoxacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/gltf-buffer": {
    source: "iana"
  },
  "application/gml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "gml"
    ]
  },
  "application/gpx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "gpx"
    ]
  },
  "application/gxf": {
    source: "apache",
    extensions: [
      "gxf"
    ]
  },
  "application/gzip": {
    source: "iana",
    compressible: false,
    extensions: [
      "gz"
    ]
  },
  "application/h224": {
    source: "iana"
  },
  "application/held+xml": {
    source: "iana",
    compressible: true
  },
  "application/hjson": {
    extensions: [
      "hjson"
    ]
  },
  "application/http": {
    source: "iana"
  },
  "application/hyperstudio": {
    source: "iana",
    extensions: [
      "stk"
    ]
  },
  "application/ibe-key-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pkg-reply+xml": {
    source: "iana",
    compressible: true
  },
  "application/ibe-pp-data": {
    source: "iana"
  },
  "application/iges": {
    source: "iana"
  },
  "application/im-iscomposing+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/index": {
    source: "iana"
  },
  "application/index.cmd": {
    source: "iana"
  },
  "application/index.obj": {
    source: "iana"
  },
  "application/index.response": {
    source: "iana"
  },
  "application/index.vnd": {
    source: "iana"
  },
  "application/inkml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ink",
      "inkml"
    ]
  },
  "application/iotp": {
    source: "iana"
  },
  "application/ipfix": {
    source: "iana",
    extensions: [
      "ipfix"
    ]
  },
  "application/ipp": {
    source: "iana"
  },
  "application/isup": {
    source: "iana"
  },
  "application/its+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "its"
    ]
  },
  "application/java-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "jar",
      "war",
      "ear"
    ]
  },
  "application/java-serialized-object": {
    source: "apache",
    compressible: false,
    extensions: [
      "ser"
    ]
  },
  "application/java-vm": {
    source: "apache",
    compressible: false,
    extensions: [
      "class"
    ]
  },
  "application/javascript": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "js",
      "mjs"
    ]
  },
  "application/jf2feed+json": {
    source: "iana",
    compressible: true
  },
  "application/jose": {
    source: "iana"
  },
  "application/jose+json": {
    source: "iana",
    compressible: true
  },
  "application/jrd+json": {
    source: "iana",
    compressible: true
  },
  "application/jscalendar+json": {
    source: "iana",
    compressible: true
  },
  "application/json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "json",
      "map"
    ]
  },
  "application/json-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/json-seq": {
    source: "iana"
  },
  "application/json5": {
    extensions: [
      "json5"
    ]
  },
  "application/jsonml+json": {
    source: "apache",
    compressible: true,
    extensions: [
      "jsonml"
    ]
  },
  "application/jwk+json": {
    source: "iana",
    compressible: true
  },
  "application/jwk-set+json": {
    source: "iana",
    compressible: true
  },
  "application/jwt": {
    source: "iana"
  },
  "application/kpml-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/kpml-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/ld+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "jsonld"
    ]
  },
  "application/lgr+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lgr"
    ]
  },
  "application/link-format": {
    source: "iana"
  },
  "application/load-control+xml": {
    source: "iana",
    compressible: true
  },
  "application/lost+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lostxml"
    ]
  },
  "application/lostsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/lpf+zip": {
    source: "iana",
    compressible: false
  },
  "application/lxf": {
    source: "iana"
  },
  "application/mac-binhex40": {
    source: "iana",
    extensions: [
      "hqx"
    ]
  },
  "application/mac-compactpro": {
    source: "apache",
    extensions: [
      "cpt"
    ]
  },
  "application/macwriteii": {
    source: "iana"
  },
  "application/mads+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mads"
    ]
  },
  "application/manifest+json": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "webmanifest"
    ]
  },
  "application/marc": {
    source: "iana",
    extensions: [
      "mrc"
    ]
  },
  "application/marcxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mrcx"
    ]
  },
  "application/mathematica": {
    source: "iana",
    extensions: [
      "ma",
      "nb",
      "mb"
    ]
  },
  "application/mathml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mathml"
    ]
  },
  "application/mathml-content+xml": {
    source: "iana",
    compressible: true
  },
  "application/mathml-presentation+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-associated-procedure-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-deregister+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-envelope+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-msk-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-protection-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-reception-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-register-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-schedule+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbms-user-service-description+xml": {
    source: "iana",
    compressible: true
  },
  "application/mbox": {
    source: "iana",
    extensions: [
      "mbox"
    ]
  },
  "application/media-policy-dataset+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpf"
    ]
  },
  "application/media_control+xml": {
    source: "iana",
    compressible: true
  },
  "application/mediaservercontrol+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mscml"
    ]
  },
  "application/merge-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/metalink+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "metalink"
    ]
  },
  "application/metalink4+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "meta4"
    ]
  },
  "application/mets+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mets"
    ]
  },
  "application/mf4": {
    source: "iana"
  },
  "application/mikey": {
    source: "iana"
  },
  "application/mipc": {
    source: "iana"
  },
  "application/missing-blocks+cbor-seq": {
    source: "iana"
  },
  "application/mmt-aei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "maei"
    ]
  },
  "application/mmt-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musd"
    ]
  },
  "application/mods+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mods"
    ]
  },
  "application/moss-keys": {
    source: "iana"
  },
  "application/moss-signature": {
    source: "iana"
  },
  "application/mosskey-data": {
    source: "iana"
  },
  "application/mosskey-request": {
    source: "iana"
  },
  "application/mp21": {
    source: "iana",
    extensions: [
      "m21",
      "mp21"
    ]
  },
  "application/mp4": {
    source: "iana",
    extensions: [
      "mp4s",
      "m4p"
    ]
  },
  "application/mpeg4-generic": {
    source: "iana"
  },
  "application/mpeg4-iod": {
    source: "iana"
  },
  "application/mpeg4-iod-xmt": {
    source: "iana"
  },
  "application/mrb-consumer+xml": {
    source: "iana",
    compressible: true
  },
  "application/mrb-publish+xml": {
    source: "iana",
    compressible: true
  },
  "application/msc-ivr+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msc-mixer+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/msword": {
    source: "iana",
    compressible: false,
    extensions: [
      "doc",
      "dot"
    ]
  },
  "application/mud+json": {
    source: "iana",
    compressible: true
  },
  "application/multipart-core": {
    source: "iana"
  },
  "application/mxf": {
    source: "iana",
    extensions: [
      "mxf"
    ]
  },
  "application/n-quads": {
    source: "iana",
    extensions: [
      "nq"
    ]
  },
  "application/n-triples": {
    source: "iana",
    extensions: [
      "nt"
    ]
  },
  "application/nasdata": {
    source: "iana"
  },
  "application/news-checkgroups": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-groupinfo": {
    source: "iana",
    charset: "US-ASCII"
  },
  "application/news-transmission": {
    source: "iana"
  },
  "application/nlsml+xml": {
    source: "iana",
    compressible: true
  },
  "application/node": {
    source: "iana",
    extensions: [
      "cjs"
    ]
  },
  "application/nss": {
    source: "iana"
  },
  "application/oauth-authz-req+jwt": {
    source: "iana"
  },
  "application/oblivious-dns-message": {
    source: "iana"
  },
  "application/ocsp-request": {
    source: "iana"
  },
  "application/ocsp-response": {
    source: "iana"
  },
  "application/octet-stream": {
    source: "iana",
    compressible: false,
    extensions: [
      "bin",
      "dms",
      "lrf",
      "mar",
      "so",
      "dist",
      "distz",
      "pkg",
      "bpk",
      "dump",
      "elc",
      "deploy",
      "exe",
      "dll",
      "deb",
      "dmg",
      "iso",
      "img",
      "msi",
      "msp",
      "msm",
      "buffer"
    ]
  },
  "application/oda": {
    source: "iana",
    extensions: [
      "oda"
    ]
  },
  "application/odm+xml": {
    source: "iana",
    compressible: true
  },
  "application/odx": {
    source: "iana"
  },
  "application/oebps-package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "opf"
    ]
  },
  "application/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogx"
    ]
  },
  "application/omdoc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "omdoc"
    ]
  },
  "application/onenote": {
    source: "apache",
    extensions: [
      "onetoc",
      "onetoc2",
      "onetmp",
      "onepkg"
    ]
  },
  "application/opc-nodeset+xml": {
    source: "iana",
    compressible: true
  },
  "application/oscore": {
    source: "iana"
  },
  "application/oxps": {
    source: "iana",
    extensions: [
      "oxps"
    ]
  },
  "application/p21": {
    source: "iana"
  },
  "application/p21+zip": {
    source: "iana",
    compressible: false
  },
  "application/p2p-overlay+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "relo"
    ]
  },
  "application/parityfec": {
    source: "iana"
  },
  "application/passport": {
    source: "iana"
  },
  "application/patch-ops-error+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xer"
    ]
  },
  "application/pdf": {
    source: "iana",
    compressible: false,
    extensions: [
      "pdf"
    ]
  },
  "application/pdx": {
    source: "iana"
  },
  "application/pem-certificate-chain": {
    source: "iana"
  },
  "application/pgp-encrypted": {
    source: "iana",
    compressible: false,
    extensions: [
      "pgp"
    ]
  },
  "application/pgp-keys": {
    source: "iana",
    extensions: [
      "asc"
    ]
  },
  "application/pgp-signature": {
    source: "iana",
    extensions: [
      "asc",
      "sig"
    ]
  },
  "application/pics-rules": {
    source: "apache",
    extensions: [
      "prf"
    ]
  },
  "application/pidf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pidf-diff+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/pkcs10": {
    source: "iana",
    extensions: [
      "p10"
    ]
  },
  "application/pkcs12": {
    source: "iana"
  },
  "application/pkcs7-mime": {
    source: "iana",
    extensions: [
      "p7m",
      "p7c"
    ]
  },
  "application/pkcs7-signature": {
    source: "iana",
    extensions: [
      "p7s"
    ]
  },
  "application/pkcs8": {
    source: "iana",
    extensions: [
      "p8"
    ]
  },
  "application/pkcs8-encrypted": {
    source: "iana"
  },
  "application/pkix-attr-cert": {
    source: "iana",
    extensions: [
      "ac"
    ]
  },
  "application/pkix-cert": {
    source: "iana",
    extensions: [
      "cer"
    ]
  },
  "application/pkix-crl": {
    source: "iana",
    extensions: [
      "crl"
    ]
  },
  "application/pkix-pkipath": {
    source: "iana",
    extensions: [
      "pkipath"
    ]
  },
  "application/pkixcmp": {
    source: "iana",
    extensions: [
      "pki"
    ]
  },
  "application/pls+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pls"
    ]
  },
  "application/poc-settings+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/postscript": {
    source: "iana",
    compressible: true,
    extensions: [
      "ai",
      "eps",
      "ps"
    ]
  },
  "application/ppsp-tracker+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+json": {
    source: "iana",
    compressible: true
  },
  "application/problem+xml": {
    source: "iana",
    compressible: true
  },
  "application/provenance+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "provx"
    ]
  },
  "application/prs.alvestrand.titrax-sheet": {
    source: "iana"
  },
  "application/prs.cww": {
    source: "iana",
    extensions: [
      "cww"
    ]
  },
  "application/prs.cyn": {
    source: "iana",
    charset: "7-BIT"
  },
  "application/prs.hpub+zip": {
    source: "iana",
    compressible: false
  },
  "application/prs.nprend": {
    source: "iana"
  },
  "application/prs.plucker": {
    source: "iana"
  },
  "application/prs.rdf-xml-crypt": {
    source: "iana"
  },
  "application/prs.xsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/pskc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "pskcxml"
    ]
  },
  "application/pvd+json": {
    source: "iana",
    compressible: true
  },
  "application/qsig": {
    source: "iana"
  },
  "application/raml+yaml": {
    compressible: true,
    extensions: [
      "raml"
    ]
  },
  "application/raptorfec": {
    source: "iana"
  },
  "application/rdap+json": {
    source: "iana",
    compressible: true
  },
  "application/rdf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rdf",
      "owl"
    ]
  },
  "application/reginfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rif"
    ]
  },
  "application/relax-ng-compact-syntax": {
    source: "iana",
    extensions: [
      "rnc"
    ]
  },
  "application/remote-printing": {
    source: "iana"
  },
  "application/reputon+json": {
    source: "iana",
    compressible: true
  },
  "application/resource-lists+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rl"
    ]
  },
  "application/resource-lists-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rld"
    ]
  },
  "application/rfc+xml": {
    source: "iana",
    compressible: true
  },
  "application/riscos": {
    source: "iana"
  },
  "application/rlmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/rls-services+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rs"
    ]
  },
  "application/route-apd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rapd"
    ]
  },
  "application/route-s-tsid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sls"
    ]
  },
  "application/route-usd+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rusd"
    ]
  },
  "application/rpki-ghostbusters": {
    source: "iana",
    extensions: [
      "gbr"
    ]
  },
  "application/rpki-manifest": {
    source: "iana",
    extensions: [
      "mft"
    ]
  },
  "application/rpki-publication": {
    source: "iana"
  },
  "application/rpki-roa": {
    source: "iana",
    extensions: [
      "roa"
    ]
  },
  "application/rpki-updown": {
    source: "iana"
  },
  "application/rsd+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rsd"
    ]
  },
  "application/rss+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "rss"
    ]
  },
  "application/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "application/rtploopback": {
    source: "iana"
  },
  "application/rtx": {
    source: "iana"
  },
  "application/samlassertion+xml": {
    source: "iana",
    compressible: true
  },
  "application/samlmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/sarif+json": {
    source: "iana",
    compressible: true
  },
  "application/sarif-external-properties+json": {
    source: "iana",
    compressible: true
  },
  "application/sbe": {
    source: "iana"
  },
  "application/sbml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sbml"
    ]
  },
  "application/scaip+xml": {
    source: "iana",
    compressible: true
  },
  "application/scim+json": {
    source: "iana",
    compressible: true
  },
  "application/scvp-cv-request": {
    source: "iana",
    extensions: [
      "scq"
    ]
  },
  "application/scvp-cv-response": {
    source: "iana",
    extensions: [
      "scs"
    ]
  },
  "application/scvp-vp-request": {
    source: "iana",
    extensions: [
      "spq"
    ]
  },
  "application/scvp-vp-response": {
    source: "iana",
    extensions: [
      "spp"
    ]
  },
  "application/sdp": {
    source: "iana",
    extensions: [
      "sdp"
    ]
  },
  "application/secevent+jwt": {
    source: "iana"
  },
  "application/senml+cbor": {
    source: "iana"
  },
  "application/senml+json": {
    source: "iana",
    compressible: true
  },
  "application/senml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "senmlx"
    ]
  },
  "application/senml-etch+cbor": {
    source: "iana"
  },
  "application/senml-etch+json": {
    source: "iana",
    compressible: true
  },
  "application/senml-exi": {
    source: "iana"
  },
  "application/sensml+cbor": {
    source: "iana"
  },
  "application/sensml+json": {
    source: "iana",
    compressible: true
  },
  "application/sensml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sensmlx"
    ]
  },
  "application/sensml-exi": {
    source: "iana"
  },
  "application/sep+xml": {
    source: "iana",
    compressible: true
  },
  "application/sep-exi": {
    source: "iana"
  },
  "application/session-info": {
    source: "iana"
  },
  "application/set-payment": {
    source: "iana"
  },
  "application/set-payment-initiation": {
    source: "iana",
    extensions: [
      "setpay"
    ]
  },
  "application/set-registration": {
    source: "iana"
  },
  "application/set-registration-initiation": {
    source: "iana",
    extensions: [
      "setreg"
    ]
  },
  "application/sgml": {
    source: "iana"
  },
  "application/sgml-open-catalog": {
    source: "iana"
  },
  "application/shf+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "shf"
    ]
  },
  "application/sieve": {
    source: "iana",
    extensions: [
      "siv",
      "sieve"
    ]
  },
  "application/simple-filter+xml": {
    source: "iana",
    compressible: true
  },
  "application/simple-message-summary": {
    source: "iana"
  },
  "application/simplesymbolcontainer": {
    source: "iana"
  },
  "application/sipc": {
    source: "iana"
  },
  "application/slate": {
    source: "iana"
  },
  "application/smil": {
    source: "iana"
  },
  "application/smil+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "smi",
      "smil"
    ]
  },
  "application/smpte336m": {
    source: "iana"
  },
  "application/soap+fastinfoset": {
    source: "iana"
  },
  "application/soap+xml": {
    source: "iana",
    compressible: true
  },
  "application/sparql-query": {
    source: "iana",
    extensions: [
      "rq"
    ]
  },
  "application/sparql-results+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "srx"
    ]
  },
  "application/spdx+json": {
    source: "iana",
    compressible: true
  },
  "application/spirits-event+xml": {
    source: "iana",
    compressible: true
  },
  "application/sql": {
    source: "iana"
  },
  "application/srgs": {
    source: "iana",
    extensions: [
      "gram"
    ]
  },
  "application/srgs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "grxml"
    ]
  },
  "application/sru+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sru"
    ]
  },
  "application/ssdl+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ssdl"
    ]
  },
  "application/ssml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ssml"
    ]
  },
  "application/stix+json": {
    source: "iana",
    compressible: true
  },
  "application/swid+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "swidtag"
    ]
  },
  "application/tamp-apex-update": {
    source: "iana"
  },
  "application/tamp-apex-update-confirm": {
    source: "iana"
  },
  "application/tamp-community-update": {
    source: "iana"
  },
  "application/tamp-community-update-confirm": {
    source: "iana"
  },
  "application/tamp-error": {
    source: "iana"
  },
  "application/tamp-sequence-adjust": {
    source: "iana"
  },
  "application/tamp-sequence-adjust-confirm": {
    source: "iana"
  },
  "application/tamp-status-query": {
    source: "iana"
  },
  "application/tamp-status-response": {
    source: "iana"
  },
  "application/tamp-update": {
    source: "iana"
  },
  "application/tamp-update-confirm": {
    source: "iana"
  },
  "application/tar": {
    compressible: true
  },
  "application/taxii+json": {
    source: "iana",
    compressible: true
  },
  "application/td+json": {
    source: "iana",
    compressible: true
  },
  "application/tei+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tei",
      "teicorpus"
    ]
  },
  "application/tetra_isi": {
    source: "iana"
  },
  "application/thraud+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "tfi"
    ]
  },
  "application/timestamp-query": {
    source: "iana"
  },
  "application/timestamp-reply": {
    source: "iana"
  },
  "application/timestamped-data": {
    source: "iana",
    extensions: [
      "tsd"
    ]
  },
  "application/tlsrpt+gzip": {
    source: "iana"
  },
  "application/tlsrpt+json": {
    source: "iana",
    compressible: true
  },
  "application/tnauthlist": {
    source: "iana"
  },
  "application/token-introspection+jwt": {
    source: "iana"
  },
  "application/toml": {
    compressible: true,
    extensions: [
      "toml"
    ]
  },
  "application/trickle-ice-sdpfrag": {
    source: "iana"
  },
  "application/trig": {
    source: "iana",
    extensions: [
      "trig"
    ]
  },
  "application/ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttml"
    ]
  },
  "application/tve-trigger": {
    source: "iana"
  },
  "application/tzif": {
    source: "iana"
  },
  "application/tzif-leap": {
    source: "iana"
  },
  "application/ubjson": {
    compressible: false,
    extensions: [
      "ubj"
    ]
  },
  "application/ulpfec": {
    source: "iana"
  },
  "application/urc-grpsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/urc-ressheet+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "rsheet"
    ]
  },
  "application/urc-targetdesc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "td"
    ]
  },
  "application/urc-uisocketdesc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vcard+json": {
    source: "iana",
    compressible: true
  },
  "application/vcard+xml": {
    source: "iana",
    compressible: true
  },
  "application/vemmi": {
    source: "iana"
  },
  "application/vividence.scriptfile": {
    source: "apache"
  },
  "application/vnd.1000minds.decision-model+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "1km"
    ]
  },
  "application/vnd.3gpp-prose+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-prose-pc3ch+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp-v2x-local-service-information": {
    source: "iana"
  },
  "application/vnd.3gpp.5gnas": {
    source: "iana"
  },
  "application/vnd.3gpp.access-transfer-events+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.bsf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gmop+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.gtpc": {
    source: "iana"
  },
  "application/vnd.3gpp.interworking-data": {
    source: "iana"
  },
  "application/vnd.3gpp.lpp": {
    source: "iana"
  },
  "application/vnd.3gpp.mc-signalling-ear": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-payload": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-signalling": {
    source: "iana"
  },
  "application/vnd.3gpp.mcdata-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcdata-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-floor-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-signed+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-ue-init-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcptt-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-command+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-affiliation-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-location-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-mbms-usage-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-service-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-transmission-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-ue-config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mcvideo-user-profile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.mid-call+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ngap": {
    source: "iana"
  },
  "application/vnd.3gpp.pfcp": {
    source: "iana"
  },
  "application/vnd.3gpp.pic-bw-large": {
    source: "iana",
    extensions: [
      "plb"
    ]
  },
  "application/vnd.3gpp.pic-bw-small": {
    source: "iana",
    extensions: [
      "psb"
    ]
  },
  "application/vnd.3gpp.pic-bw-var": {
    source: "iana",
    extensions: [
      "pvb"
    ]
  },
  "application/vnd.3gpp.s1ap": {
    source: "iana"
  },
  "application/vnd.3gpp.sms": {
    source: "iana"
  },
  "application/vnd.3gpp.sms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-ext+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.srvcc-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.state-and-event-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp.ussd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.bcmcsinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.3gpp2.sms": {
    source: "iana"
  },
  "application/vnd.3gpp2.tcap": {
    source: "iana",
    extensions: [
      "tcap"
    ]
  },
  "application/vnd.3lightssoftware.imagescal": {
    source: "iana"
  },
  "application/vnd.3m.post-it-notes": {
    source: "iana",
    extensions: [
      "pwn"
    ]
  },
  "application/vnd.accpac.simply.aso": {
    source: "iana",
    extensions: [
      "aso"
    ]
  },
  "application/vnd.accpac.simply.imp": {
    source: "iana",
    extensions: [
      "imp"
    ]
  },
  "application/vnd.acucobol": {
    source: "iana",
    extensions: [
      "acu"
    ]
  },
  "application/vnd.acucorp": {
    source: "iana",
    extensions: [
      "atc",
      "acutc"
    ]
  },
  "application/vnd.adobe.air-application-installer-package+zip": {
    source: "apache",
    compressible: false,
    extensions: [
      "air"
    ]
  },
  "application/vnd.adobe.flash.movie": {
    source: "iana"
  },
  "application/vnd.adobe.formscentral.fcdt": {
    source: "iana",
    extensions: [
      "fcdt"
    ]
  },
  "application/vnd.adobe.fxp": {
    source: "iana",
    extensions: [
      "fxp",
      "fxpl"
    ]
  },
  "application/vnd.adobe.partial-upload": {
    source: "iana"
  },
  "application/vnd.adobe.xdp+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdp"
    ]
  },
  "application/vnd.adobe.xfdf": {
    source: "iana",
    extensions: [
      "xfdf"
    ]
  },
  "application/vnd.aether.imp": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata": {
    source: "iana"
  },
  "application/vnd.afpc.afplinedata-pagedef": {
    source: "iana"
  },
  "application/vnd.afpc.cmoca-cmresource": {
    source: "iana"
  },
  "application/vnd.afpc.foca-charset": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codedfont": {
    source: "iana"
  },
  "application/vnd.afpc.foca-codepage": {
    source: "iana"
  },
  "application/vnd.afpc.modca": {
    source: "iana"
  },
  "application/vnd.afpc.modca-cmtable": {
    source: "iana"
  },
  "application/vnd.afpc.modca-formdef": {
    source: "iana"
  },
  "application/vnd.afpc.modca-mediummap": {
    source: "iana"
  },
  "application/vnd.afpc.modca-objectcontainer": {
    source: "iana"
  },
  "application/vnd.afpc.modca-overlay": {
    source: "iana"
  },
  "application/vnd.afpc.modca-pagesegment": {
    source: "iana"
  },
  "application/vnd.age": {
    source: "iana",
    extensions: [
      "age"
    ]
  },
  "application/vnd.ah-barcode": {
    source: "iana"
  },
  "application/vnd.ahead.space": {
    source: "iana",
    extensions: [
      "ahead"
    ]
  },
  "application/vnd.airzip.filesecure.azf": {
    source: "iana",
    extensions: [
      "azf"
    ]
  },
  "application/vnd.airzip.filesecure.azs": {
    source: "iana",
    extensions: [
      "azs"
    ]
  },
  "application/vnd.amadeus+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.amazon.ebook": {
    source: "apache",
    extensions: [
      "azw"
    ]
  },
  "application/vnd.amazon.mobi8-ebook": {
    source: "iana"
  },
  "application/vnd.americandynamics.acc": {
    source: "iana",
    extensions: [
      "acc"
    ]
  },
  "application/vnd.amiga.ami": {
    source: "iana",
    extensions: [
      "ami"
    ]
  },
  "application/vnd.amundsen.maze+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.android.ota": {
    source: "iana"
  },
  "application/vnd.android.package-archive": {
    source: "apache",
    compressible: false,
    extensions: [
      "apk"
    ]
  },
  "application/vnd.anki": {
    source: "iana"
  },
  "application/vnd.anser-web-certificate-issue-initiation": {
    source: "iana",
    extensions: [
      "cii"
    ]
  },
  "application/vnd.anser-web-funds-transfer-initiation": {
    source: "apache",
    extensions: [
      "fti"
    ]
  },
  "application/vnd.antix.game-component": {
    source: "iana",
    extensions: [
      "atx"
    ]
  },
  "application/vnd.apache.arrow.file": {
    source: "iana"
  },
  "application/vnd.apache.arrow.stream": {
    source: "iana"
  },
  "application/vnd.apache.thrift.binary": {
    source: "iana"
  },
  "application/vnd.apache.thrift.compact": {
    source: "iana"
  },
  "application/vnd.apache.thrift.json": {
    source: "iana"
  },
  "application/vnd.api+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.aplextor.warrp+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apothekende.reservation+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.apple.installer+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mpkg"
    ]
  },
  "application/vnd.apple.keynote": {
    source: "iana",
    extensions: [
      "key"
    ]
  },
  "application/vnd.apple.mpegurl": {
    source: "iana",
    extensions: [
      "m3u8"
    ]
  },
  "application/vnd.apple.numbers": {
    source: "iana",
    extensions: [
      "numbers"
    ]
  },
  "application/vnd.apple.pages": {
    source: "iana",
    extensions: [
      "pages"
    ]
  },
  "application/vnd.apple.pkpass": {
    compressible: false,
    extensions: [
      "pkpass"
    ]
  },
  "application/vnd.arastra.swi": {
    source: "iana"
  },
  "application/vnd.aristanetworks.swi": {
    source: "iana",
    extensions: [
      "swi"
    ]
  },
  "application/vnd.artisan+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.artsquare": {
    source: "iana"
  },
  "application/vnd.astraea-software.iota": {
    source: "iana",
    extensions: [
      "iota"
    ]
  },
  "application/vnd.audiograph": {
    source: "iana",
    extensions: [
      "aep"
    ]
  },
  "application/vnd.autopackage": {
    source: "iana"
  },
  "application/vnd.avalon+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.avistar+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.balsamiq.bmml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmml"
    ]
  },
  "application/vnd.balsamiq.bmpr": {
    source: "iana"
  },
  "application/vnd.banana-accounting": {
    source: "iana"
  },
  "application/vnd.bbf.usp.error": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg": {
    source: "iana"
  },
  "application/vnd.bbf.usp.msg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bekitzur-stech+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.bint.med-content": {
    source: "iana"
  },
  "application/vnd.biopax.rdf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.blink-idb-value-wrapper": {
    source: "iana"
  },
  "application/vnd.blueice.multipass": {
    source: "iana",
    extensions: [
      "mpm"
    ]
  },
  "application/vnd.bluetooth.ep.oob": {
    source: "iana"
  },
  "application/vnd.bluetooth.le.oob": {
    source: "iana"
  },
  "application/vnd.bmi": {
    source: "iana",
    extensions: [
      "bmi"
    ]
  },
  "application/vnd.bpf": {
    source: "iana"
  },
  "application/vnd.bpf3": {
    source: "iana"
  },
  "application/vnd.businessobjects": {
    source: "iana",
    extensions: [
      "rep"
    ]
  },
  "application/vnd.byu.uapi+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cab-jscript": {
    source: "iana"
  },
  "application/vnd.canon-cpdl": {
    source: "iana"
  },
  "application/vnd.canon-lips": {
    source: "iana"
  },
  "application/vnd.capasystems-pg+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cendio.thinlinc.clientconf": {
    source: "iana"
  },
  "application/vnd.century-systems.tcp_stream": {
    source: "iana"
  },
  "application/vnd.chemdraw+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "cdxml"
    ]
  },
  "application/vnd.chess-pgn": {
    source: "iana"
  },
  "application/vnd.chipnuts.karaoke-mmd": {
    source: "iana",
    extensions: [
      "mmd"
    ]
  },
  "application/vnd.ciedi": {
    source: "iana"
  },
  "application/vnd.cinderella": {
    source: "iana",
    extensions: [
      "cdy"
    ]
  },
  "application/vnd.cirpack.isdn-ext": {
    source: "iana"
  },
  "application/vnd.citationstyles.style+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "csl"
    ]
  },
  "application/vnd.claymore": {
    source: "iana",
    extensions: [
      "cla"
    ]
  },
  "application/vnd.cloanto.rp9": {
    source: "iana",
    extensions: [
      "rp9"
    ]
  },
  "application/vnd.clonk.c4group": {
    source: "iana",
    extensions: [
      "c4g",
      "c4d",
      "c4f",
      "c4p",
      "c4u"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config": {
    source: "iana",
    extensions: [
      "c11amc"
    ]
  },
  "application/vnd.cluetrust.cartomobile-config-pkg": {
    source: "iana",
    extensions: [
      "c11amz"
    ]
  },
  "application/vnd.coffeescript": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.document-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.presentation-template": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet": {
    source: "iana"
  },
  "application/vnd.collabio.xodocuments.spreadsheet-template": {
    source: "iana"
  },
  "application/vnd.collection+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.doc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.collection.next+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.comicbook+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.comicbook-rar": {
    source: "iana"
  },
  "application/vnd.commerce-battelle": {
    source: "iana"
  },
  "application/vnd.commonspace": {
    source: "iana",
    extensions: [
      "csp"
    ]
  },
  "application/vnd.contact.cmsg": {
    source: "iana",
    extensions: [
      "cdbcmsg"
    ]
  },
  "application/vnd.coreos.ignition+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cosmocaller": {
    source: "iana",
    extensions: [
      "cmc"
    ]
  },
  "application/vnd.crick.clicker": {
    source: "iana",
    extensions: [
      "clkx"
    ]
  },
  "application/vnd.crick.clicker.keyboard": {
    source: "iana",
    extensions: [
      "clkk"
    ]
  },
  "application/vnd.crick.clicker.palette": {
    source: "iana",
    extensions: [
      "clkp"
    ]
  },
  "application/vnd.crick.clicker.template": {
    source: "iana",
    extensions: [
      "clkt"
    ]
  },
  "application/vnd.crick.clicker.wordbank": {
    source: "iana",
    extensions: [
      "clkw"
    ]
  },
  "application/vnd.criticaltools.wbs+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wbs"
    ]
  },
  "application/vnd.cryptii.pipe+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.crypto-shade-file": {
    source: "iana"
  },
  "application/vnd.cryptomator.encrypted": {
    source: "iana"
  },
  "application/vnd.cryptomator.vault": {
    source: "iana"
  },
  "application/vnd.ctc-posml": {
    source: "iana",
    extensions: [
      "pml"
    ]
  },
  "application/vnd.ctct.ws+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cups-pdf": {
    source: "iana"
  },
  "application/vnd.cups-postscript": {
    source: "iana"
  },
  "application/vnd.cups-ppd": {
    source: "iana",
    extensions: [
      "ppd"
    ]
  },
  "application/vnd.cups-raster": {
    source: "iana"
  },
  "application/vnd.cups-raw": {
    source: "iana"
  },
  "application/vnd.curl": {
    source: "iana"
  },
  "application/vnd.curl.car": {
    source: "apache",
    extensions: [
      "car"
    ]
  },
  "application/vnd.curl.pcurl": {
    source: "apache",
    extensions: [
      "pcurl"
    ]
  },
  "application/vnd.cyan.dean.root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cybank": {
    source: "iana"
  },
  "application/vnd.cyclonedx+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.cyclonedx+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.d2l.coursepackage1p0+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.d3m-dataset": {
    source: "iana"
  },
  "application/vnd.d3m-problem": {
    source: "iana"
  },
  "application/vnd.dart": {
    source: "iana",
    compressible: true,
    extensions: [
      "dart"
    ]
  },
  "application/vnd.data-vision.rdz": {
    source: "iana",
    extensions: [
      "rdz"
    ]
  },
  "application/vnd.datapackage+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dataresource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dbf": {
    source: "iana",
    extensions: [
      "dbf"
    ]
  },
  "application/vnd.debian.binary-package": {
    source: "iana"
  },
  "application/vnd.dece.data": {
    source: "iana",
    extensions: [
      "uvf",
      "uvvf",
      "uvd",
      "uvvd"
    ]
  },
  "application/vnd.dece.ttml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uvt",
      "uvvt"
    ]
  },
  "application/vnd.dece.unspecified": {
    source: "iana",
    extensions: [
      "uvx",
      "uvvx"
    ]
  },
  "application/vnd.dece.zip": {
    source: "iana",
    extensions: [
      "uvz",
      "uvvz"
    ]
  },
  "application/vnd.denovo.fcselayout-link": {
    source: "iana",
    extensions: [
      "fe_launch"
    ]
  },
  "application/vnd.desmume.movie": {
    source: "iana"
  },
  "application/vnd.dir-bi.plate-dl-nosuffix": {
    source: "iana"
  },
  "application/vnd.dm.delegation+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dna": {
    source: "iana",
    extensions: [
      "dna"
    ]
  },
  "application/vnd.document+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dolby.mlp": {
    source: "apache",
    extensions: [
      "mlp"
    ]
  },
  "application/vnd.dolby.mobile.1": {
    source: "iana"
  },
  "application/vnd.dolby.mobile.2": {
    source: "iana"
  },
  "application/vnd.doremir.scorecloud-binary-document": {
    source: "iana"
  },
  "application/vnd.dpgraph": {
    source: "iana",
    extensions: [
      "dpg"
    ]
  },
  "application/vnd.dreamfactory": {
    source: "iana",
    extensions: [
      "dfac"
    ]
  },
  "application/vnd.drive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ds-keypoint": {
    source: "apache",
    extensions: [
      "kpxx"
    ]
  },
  "application/vnd.dtg.local": {
    source: "iana"
  },
  "application/vnd.dtg.local.flash": {
    source: "iana"
  },
  "application/vnd.dtg.local.html": {
    source: "iana"
  },
  "application/vnd.dvb.ait": {
    source: "iana",
    extensions: [
      "ait"
    ]
  },
  "application/vnd.dvb.dvbisl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.dvbj": {
    source: "iana"
  },
  "application/vnd.dvb.esgcontainer": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcdftnotifaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgaccess2": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcesgpdd": {
    source: "iana"
  },
  "application/vnd.dvb.ipdcroaming": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-base": {
    source: "iana"
  },
  "application/vnd.dvb.iptv.alfec-enhancement": {
    source: "iana"
  },
  "application/vnd.dvb.notif-aggregate-root+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-container+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-generic+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-msglist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-ia-registration-response+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.notif-init+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.dvb.pfr": {
    source: "iana"
  },
  "application/vnd.dvb.service": {
    source: "iana",
    extensions: [
      "svc"
    ]
  },
  "application/vnd.dxr": {
    source: "iana"
  },
  "application/vnd.dynageo": {
    source: "iana",
    extensions: [
      "geo"
    ]
  },
  "application/vnd.dzr": {
    source: "iana"
  },
  "application/vnd.easykaraoke.cdgdownload": {
    source: "iana"
  },
  "application/vnd.ecdis-update": {
    source: "iana"
  },
  "application/vnd.ecip.rlp": {
    source: "iana"
  },
  "application/vnd.eclipse.ditto+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ecowin.chart": {
    source: "iana",
    extensions: [
      "mag"
    ]
  },
  "application/vnd.ecowin.filerequest": {
    source: "iana"
  },
  "application/vnd.ecowin.fileupdate": {
    source: "iana"
  },
  "application/vnd.ecowin.series": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesrequest": {
    source: "iana"
  },
  "application/vnd.ecowin.seriesupdate": {
    source: "iana"
  },
  "application/vnd.efi.img": {
    source: "iana"
  },
  "application/vnd.efi.iso": {
    source: "iana"
  },
  "application/vnd.emclient.accessrequest+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.enliven": {
    source: "iana",
    extensions: [
      "nml"
    ]
  },
  "application/vnd.enphase.envoy": {
    source: "iana"
  },
  "application/vnd.eprints.data+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.epson.esf": {
    source: "iana",
    extensions: [
      "esf"
    ]
  },
  "application/vnd.epson.msf": {
    source: "iana",
    extensions: [
      "msf"
    ]
  },
  "application/vnd.epson.quickanime": {
    source: "iana",
    extensions: [
      "qam"
    ]
  },
  "application/vnd.epson.salt": {
    source: "iana",
    extensions: [
      "slt"
    ]
  },
  "application/vnd.epson.ssf": {
    source: "iana",
    extensions: [
      "ssf"
    ]
  },
  "application/vnd.ericsson.quickcall": {
    source: "iana"
  },
  "application/vnd.espass-espass+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.eszigno3+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "es3",
      "et3"
    ]
  },
  "application/vnd.etsi.aoc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.asic-e+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.asic-s+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.etsi.cug+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvcommand+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-bc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-cod+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsad-npvr+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvservice+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvsync+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.iptvueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mcid+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.mheg5": {
    source: "iana"
  },
  "application/vnd.etsi.overload-control-policy-dataset+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.pstn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.sci+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.simservs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.timestamp-token": {
    source: "iana"
  },
  "application/vnd.etsi.tsl+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.etsi.tsl.der": {
    source: "iana"
  },
  "application/vnd.eu.kasparian.car+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.eudora.data": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.profile": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.settings": {
    source: "iana"
  },
  "application/vnd.evolv.ecig.theme": {
    source: "iana"
  },
  "application/vnd.exstream-empower+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.exstream-package": {
    source: "iana"
  },
  "application/vnd.ezpix-album": {
    source: "iana",
    extensions: [
      "ez2"
    ]
  },
  "application/vnd.ezpix-package": {
    source: "iana",
    extensions: [
      "ez3"
    ]
  },
  "application/vnd.f-secure.mobile": {
    source: "iana"
  },
  "application/vnd.familysearch.gedcom+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.fastcopy-disk-image": {
    source: "iana"
  },
  "application/vnd.fdf": {
    source: "iana",
    extensions: [
      "fdf"
    ]
  },
  "application/vnd.fdsn.mseed": {
    source: "iana",
    extensions: [
      "mseed"
    ]
  },
  "application/vnd.fdsn.seed": {
    source: "iana",
    extensions: [
      "seed",
      "dataless"
    ]
  },
  "application/vnd.ffsns": {
    source: "iana"
  },
  "application/vnd.ficlab.flb+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.filmit.zfc": {
    source: "iana"
  },
  "application/vnd.fints": {
    source: "iana"
  },
  "application/vnd.firemonkeys.cloudcell": {
    source: "iana"
  },
  "application/vnd.flographit": {
    source: "iana",
    extensions: [
      "gph"
    ]
  },
  "application/vnd.fluxtime.clip": {
    source: "iana",
    extensions: [
      "ftc"
    ]
  },
  "application/vnd.font-fontforge-sfd": {
    source: "iana"
  },
  "application/vnd.framemaker": {
    source: "iana",
    extensions: [
      "fm",
      "frame",
      "maker",
      "book"
    ]
  },
  "application/vnd.frogans.fnc": {
    source: "iana",
    extensions: [
      "fnc"
    ]
  },
  "application/vnd.frogans.ltf": {
    source: "iana",
    extensions: [
      "ltf"
    ]
  },
  "application/vnd.fsc.weblaunch": {
    source: "iana",
    extensions: [
      "fsc"
    ]
  },
  "application/vnd.fujifilm.fb.docuworks": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.binder": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujifilm.fb.jfi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fujitsu.oasys": {
    source: "iana",
    extensions: [
      "oas"
    ]
  },
  "application/vnd.fujitsu.oasys2": {
    source: "iana",
    extensions: [
      "oa2"
    ]
  },
  "application/vnd.fujitsu.oasys3": {
    source: "iana",
    extensions: [
      "oa3"
    ]
  },
  "application/vnd.fujitsu.oasysgp": {
    source: "iana",
    extensions: [
      "fg5"
    ]
  },
  "application/vnd.fujitsu.oasysprs": {
    source: "iana",
    extensions: [
      "bh2"
    ]
  },
  "application/vnd.fujixerox.art-ex": {
    source: "iana"
  },
  "application/vnd.fujixerox.art4": {
    source: "iana"
  },
  "application/vnd.fujixerox.ddd": {
    source: "iana",
    extensions: [
      "ddd"
    ]
  },
  "application/vnd.fujixerox.docuworks": {
    source: "iana",
    extensions: [
      "xdw"
    ]
  },
  "application/vnd.fujixerox.docuworks.binder": {
    source: "iana",
    extensions: [
      "xbd"
    ]
  },
  "application/vnd.fujixerox.docuworks.container": {
    source: "iana"
  },
  "application/vnd.fujixerox.hbpl": {
    source: "iana"
  },
  "application/vnd.fut-misnet": {
    source: "iana"
  },
  "application/vnd.futoin+cbor": {
    source: "iana"
  },
  "application/vnd.futoin+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.fuzzysheet": {
    source: "iana",
    extensions: [
      "fzs"
    ]
  },
  "application/vnd.genomatix.tuxedo": {
    source: "iana",
    extensions: [
      "txd"
    ]
  },
  "application/vnd.gentics.grd+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geo+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geocube+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.geogebra.file": {
    source: "iana",
    extensions: [
      "ggb"
    ]
  },
  "application/vnd.geogebra.slides": {
    source: "iana"
  },
  "application/vnd.geogebra.tool": {
    source: "iana",
    extensions: [
      "ggt"
    ]
  },
  "application/vnd.geometry-explorer": {
    source: "iana",
    extensions: [
      "gex",
      "gre"
    ]
  },
  "application/vnd.geonext": {
    source: "iana",
    extensions: [
      "gxt"
    ]
  },
  "application/vnd.geoplan": {
    source: "iana",
    extensions: [
      "g2w"
    ]
  },
  "application/vnd.geospace": {
    source: "iana",
    extensions: [
      "g3w"
    ]
  },
  "application/vnd.gerber": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt": {
    source: "iana"
  },
  "application/vnd.globalplatform.card-content-mgt-response": {
    source: "iana"
  },
  "application/vnd.gmx": {
    source: "iana",
    extensions: [
      "gmx"
    ]
  },
  "application/vnd.google-apps.document": {
    compressible: false,
    extensions: [
      "gdoc"
    ]
  },
  "application/vnd.google-apps.presentation": {
    compressible: false,
    extensions: [
      "gslides"
    ]
  },
  "application/vnd.google-apps.spreadsheet": {
    compressible: false,
    extensions: [
      "gsheet"
    ]
  },
  "application/vnd.google-earth.kml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "kml"
    ]
  },
  "application/vnd.google-earth.kmz": {
    source: "iana",
    compressible: false,
    extensions: [
      "kmz"
    ]
  },
  "application/vnd.gov.sk.e-form+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.gov.sk.e-form+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.gov.sk.xmldatacontainer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.grafeq": {
    source: "iana",
    extensions: [
      "gqf",
      "gqs"
    ]
  },
  "application/vnd.gridmp": {
    source: "iana"
  },
  "application/vnd.groove-account": {
    source: "iana",
    extensions: [
      "gac"
    ]
  },
  "application/vnd.groove-help": {
    source: "iana",
    extensions: [
      "ghf"
    ]
  },
  "application/vnd.groove-identity-message": {
    source: "iana",
    extensions: [
      "gim"
    ]
  },
  "application/vnd.groove-injector": {
    source: "iana",
    extensions: [
      "grv"
    ]
  },
  "application/vnd.groove-tool-message": {
    source: "iana",
    extensions: [
      "gtm"
    ]
  },
  "application/vnd.groove-tool-template": {
    source: "iana",
    extensions: [
      "tpl"
    ]
  },
  "application/vnd.groove-vcard": {
    source: "iana",
    extensions: [
      "vcg"
    ]
  },
  "application/vnd.hal+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hal+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "hal"
    ]
  },
  "application/vnd.handheld-entertainment+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zmm"
    ]
  },
  "application/vnd.hbci": {
    source: "iana",
    extensions: [
      "hbci"
    ]
  },
  "application/vnd.hc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hcl-bireports": {
    source: "iana"
  },
  "application/vnd.hdt": {
    source: "iana"
  },
  "application/vnd.heroku+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hhe.lesson-player": {
    source: "iana",
    extensions: [
      "les"
    ]
  },
  "application/vnd.hl7cda+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hl7v2+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.hp-hpgl": {
    source: "iana",
    extensions: [
      "hpgl"
    ]
  },
  "application/vnd.hp-hpid": {
    source: "iana",
    extensions: [
      "hpid"
    ]
  },
  "application/vnd.hp-hps": {
    source: "iana",
    extensions: [
      "hps"
    ]
  },
  "application/vnd.hp-jlyt": {
    source: "iana",
    extensions: [
      "jlt"
    ]
  },
  "application/vnd.hp-pcl": {
    source: "iana",
    extensions: [
      "pcl"
    ]
  },
  "application/vnd.hp-pclxl": {
    source: "iana",
    extensions: [
      "pclxl"
    ]
  },
  "application/vnd.httphone": {
    source: "iana"
  },
  "application/vnd.hydrostatix.sof-data": {
    source: "iana",
    extensions: [
      "sfd-hdstx"
    ]
  },
  "application/vnd.hyper+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyper-item+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hyperdrive+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.hzn-3d-crossword": {
    source: "iana"
  },
  "application/vnd.ibm.afplinedata": {
    source: "iana"
  },
  "application/vnd.ibm.electronic-media": {
    source: "iana"
  },
  "application/vnd.ibm.minipay": {
    source: "iana",
    extensions: [
      "mpy"
    ]
  },
  "application/vnd.ibm.modcap": {
    source: "iana",
    extensions: [
      "afp",
      "listafp",
      "list3820"
    ]
  },
  "application/vnd.ibm.rights-management": {
    source: "iana",
    extensions: [
      "irm"
    ]
  },
  "application/vnd.ibm.secure-container": {
    source: "iana",
    extensions: [
      "sc"
    ]
  },
  "application/vnd.iccprofile": {
    source: "iana",
    extensions: [
      "icc",
      "icm"
    ]
  },
  "application/vnd.ieee.1905": {
    source: "iana"
  },
  "application/vnd.igloader": {
    source: "iana",
    extensions: [
      "igl"
    ]
  },
  "application/vnd.imagemeter.folder+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.imagemeter.image+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.immervision-ivp": {
    source: "iana",
    extensions: [
      "ivp"
    ]
  },
  "application/vnd.immervision-ivu": {
    source: "iana",
    extensions: [
      "ivu"
    ]
  },
  "application/vnd.ims.imsccv1p1": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p2": {
    source: "iana"
  },
  "application/vnd.ims.imsccv1p3": {
    source: "iana"
  },
  "application/vnd.ims.lis.v2.result+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolconsumerprofile+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolproxy.id+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ims.lti.v2.toolsettings.simple+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informedcontrol.rms+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.informix-visionary": {
    source: "iana"
  },
  "application/vnd.infotech.project": {
    source: "iana"
  },
  "application/vnd.infotech.project+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.innopath.wamp.notification": {
    source: "iana"
  },
  "application/vnd.insors.igm": {
    source: "iana",
    extensions: [
      "igm"
    ]
  },
  "application/vnd.intercon.formnet": {
    source: "iana",
    extensions: [
      "xpw",
      "xpx"
    ]
  },
  "application/vnd.intergeo": {
    source: "iana",
    extensions: [
      "i2g"
    ]
  },
  "application/vnd.intertrust.digibox": {
    source: "iana"
  },
  "application/vnd.intertrust.nncp": {
    source: "iana"
  },
  "application/vnd.intu.qbo": {
    source: "iana",
    extensions: [
      "qbo"
    ]
  },
  "application/vnd.intu.qfx": {
    source: "iana",
    extensions: [
      "qfx"
    ]
  },
  "application/vnd.iptc.g2.catalogitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.conceptitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.knowledgeitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.newsmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.packageitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.iptc.g2.planningitem+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ipunplugged.rcprofile": {
    source: "iana",
    extensions: [
      "rcprofile"
    ]
  },
  "application/vnd.irepository.package+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "irp"
    ]
  },
  "application/vnd.is-xpr": {
    source: "iana",
    extensions: [
      "xpr"
    ]
  },
  "application/vnd.isac.fcs": {
    source: "iana",
    extensions: [
      "fcs"
    ]
  },
  "application/vnd.iso11783-10+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.jam": {
    source: "iana",
    extensions: [
      "jam"
    ]
  },
  "application/vnd.japannet-directory-service": {
    source: "iana"
  },
  "application/vnd.japannet-jpnstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-payment-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-registration": {
    source: "iana"
  },
  "application/vnd.japannet-registration-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-setstore-wakeup": {
    source: "iana"
  },
  "application/vnd.japannet-verification": {
    source: "iana"
  },
  "application/vnd.japannet-verification-wakeup": {
    source: "iana"
  },
  "application/vnd.jcp.javame.midlet-rms": {
    source: "iana",
    extensions: [
      "rms"
    ]
  },
  "application/vnd.jisp": {
    source: "iana",
    extensions: [
      "jisp"
    ]
  },
  "application/vnd.joost.joda-archive": {
    source: "iana",
    extensions: [
      "joda"
    ]
  },
  "application/vnd.jsk.isdn-ngn": {
    source: "iana"
  },
  "application/vnd.kahootz": {
    source: "iana",
    extensions: [
      "ktz",
      "ktr"
    ]
  },
  "application/vnd.kde.karbon": {
    source: "iana",
    extensions: [
      "karbon"
    ]
  },
  "application/vnd.kde.kchart": {
    source: "iana",
    extensions: [
      "chrt"
    ]
  },
  "application/vnd.kde.kformula": {
    source: "iana",
    extensions: [
      "kfo"
    ]
  },
  "application/vnd.kde.kivio": {
    source: "iana",
    extensions: [
      "flw"
    ]
  },
  "application/vnd.kde.kontour": {
    source: "iana",
    extensions: [
      "kon"
    ]
  },
  "application/vnd.kde.kpresenter": {
    source: "iana",
    extensions: [
      "kpr",
      "kpt"
    ]
  },
  "application/vnd.kde.kspread": {
    source: "iana",
    extensions: [
      "ksp"
    ]
  },
  "application/vnd.kde.kword": {
    source: "iana",
    extensions: [
      "kwd",
      "kwt"
    ]
  },
  "application/vnd.kenameaapp": {
    source: "iana",
    extensions: [
      "htke"
    ]
  },
  "application/vnd.kidspiration": {
    source: "iana",
    extensions: [
      "kia"
    ]
  },
  "application/vnd.kinar": {
    source: "iana",
    extensions: [
      "kne",
      "knp"
    ]
  },
  "application/vnd.koan": {
    source: "iana",
    extensions: [
      "skp",
      "skd",
      "skt",
      "skm"
    ]
  },
  "application/vnd.kodak-descriptor": {
    source: "iana",
    extensions: [
      "sse"
    ]
  },
  "application/vnd.las": {
    source: "iana"
  },
  "application/vnd.las.las+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.las.las+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lasxml"
    ]
  },
  "application/vnd.laszip": {
    source: "iana"
  },
  "application/vnd.leap+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.liberty-request+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.llamagraphics.life-balance.desktop": {
    source: "iana",
    extensions: [
      "lbd"
    ]
  },
  "application/vnd.llamagraphics.life-balance.exchange+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "lbe"
    ]
  },
  "application/vnd.logipipe.circuit+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.loom": {
    source: "iana"
  },
  "application/vnd.lotus-1-2-3": {
    source: "iana",
    extensions: [
      "123"
    ]
  },
  "application/vnd.lotus-approach": {
    source: "iana",
    extensions: [
      "apr"
    ]
  },
  "application/vnd.lotus-freelance": {
    source: "iana",
    extensions: [
      "pre"
    ]
  },
  "application/vnd.lotus-notes": {
    source: "iana",
    extensions: [
      "nsf"
    ]
  },
  "application/vnd.lotus-organizer": {
    source: "iana",
    extensions: [
      "org"
    ]
  },
  "application/vnd.lotus-screencam": {
    source: "iana",
    extensions: [
      "scm"
    ]
  },
  "application/vnd.lotus-wordpro": {
    source: "iana",
    extensions: [
      "lwp"
    ]
  },
  "application/vnd.macports.portpkg": {
    source: "iana",
    extensions: [
      "portpkg"
    ]
  },
  "application/vnd.mapbox-vector-tile": {
    source: "iana",
    extensions: [
      "mvt"
    ]
  },
  "application/vnd.marlin.drm.actiontoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.conftoken+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.license+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.marlin.drm.mdcf": {
    source: "iana"
  },
  "application/vnd.mason+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.maxar.archive.3tz+zip": {
    source: "iana",
    compressible: false
  },
  "application/vnd.maxmind.maxmind-db": {
    source: "iana"
  },
  "application/vnd.mcd": {
    source: "iana",
    extensions: [
      "mcd"
    ]
  },
  "application/vnd.medcalcdata": {
    source: "iana",
    extensions: [
      "mc1"
    ]
  },
  "application/vnd.mediastation.cdkey": {
    source: "iana",
    extensions: [
      "cdkey"
    ]
  },
  "application/vnd.meridian-slingshot": {
    source: "iana"
  },
  "application/vnd.mfer": {
    source: "iana",
    extensions: [
      "mwf"
    ]
  },
  "application/vnd.mfmp": {
    source: "iana",
    extensions: [
      "mfm"
    ]
  },
  "application/vnd.micro+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.micrografx.flo": {
    source: "iana",
    extensions: [
      "flo"
    ]
  },
  "application/vnd.micrografx.igx": {
    source: "iana",
    extensions: [
      "igx"
    ]
  },
  "application/vnd.microsoft.portable-executable": {
    source: "iana"
  },
  "application/vnd.microsoft.windows.thumbnail-cache": {
    source: "iana"
  },
  "application/vnd.miele+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.mif": {
    source: "iana",
    extensions: [
      "mif"
    ]
  },
  "application/vnd.minisoft-hp3000-save": {
    source: "iana"
  },
  "application/vnd.mitsubishi.misty-guard.trustweb": {
    source: "iana"
  },
  "application/vnd.mobius.daf": {
    source: "iana",
    extensions: [
      "daf"
    ]
  },
  "application/vnd.mobius.dis": {
    source: "iana",
    extensions: [
      "dis"
    ]
  },
  "application/vnd.mobius.mbk": {
    source: "iana",
    extensions: [
      "mbk"
    ]
  },
  "application/vnd.mobius.mqy": {
    source: "iana",
    extensions: [
      "mqy"
    ]
  },
  "application/vnd.mobius.msl": {
    source: "iana",
    extensions: [
      "msl"
    ]
  },
  "application/vnd.mobius.plc": {
    source: "iana",
    extensions: [
      "plc"
    ]
  },
  "application/vnd.mobius.txf": {
    source: "iana",
    extensions: [
      "txf"
    ]
  },
  "application/vnd.mophun.application": {
    source: "iana",
    extensions: [
      "mpn"
    ]
  },
  "application/vnd.mophun.certificate": {
    source: "iana",
    extensions: [
      "mpc"
    ]
  },
  "application/vnd.motorola.flexsuite": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.adsi": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.fis": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.gotap": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.kmr": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.ttc": {
    source: "iana"
  },
  "application/vnd.motorola.flexsuite.wem": {
    source: "iana"
  },
  "application/vnd.motorola.iprm": {
    source: "iana"
  },
  "application/vnd.mozilla.xul+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xul"
    ]
  },
  "application/vnd.ms-3mfdocument": {
    source: "iana"
  },
  "application/vnd.ms-artgalry": {
    source: "iana",
    extensions: [
      "cil"
    ]
  },
  "application/vnd.ms-asf": {
    source: "iana"
  },
  "application/vnd.ms-cab-compressed": {
    source: "iana",
    extensions: [
      "cab"
    ]
  },
  "application/vnd.ms-color.iccprofile": {
    source: "apache"
  },
  "application/vnd.ms-excel": {
    source: "iana",
    compressible: false,
    extensions: [
      "xls",
      "xlm",
      "xla",
      "xlc",
      "xlt",
      "xlw"
    ]
  },
  "application/vnd.ms-excel.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlam"
    ]
  },
  "application/vnd.ms-excel.sheet.binary.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsb"
    ]
  },
  "application/vnd.ms-excel.sheet.macroenabled.12": {
    source: "iana",
    extensions: [
      "xlsm"
    ]
  },
  "application/vnd.ms-excel.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "xltm"
    ]
  },
  "application/vnd.ms-fontobject": {
    source: "iana",
    compressible: true,
    extensions: [
      "eot"
    ]
  },
  "application/vnd.ms-htmlhelp": {
    source: "iana",
    extensions: [
      "chm"
    ]
  },
  "application/vnd.ms-ims": {
    source: "iana",
    extensions: [
      "ims"
    ]
  },
  "application/vnd.ms-lrm": {
    source: "iana",
    extensions: [
      "lrm"
    ]
  },
  "application/vnd.ms-office.activex+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-officetheme": {
    source: "iana",
    extensions: [
      "thmx"
    ]
  },
  "application/vnd.ms-opentype": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-outlook": {
    compressible: false,
    extensions: [
      "msg"
    ]
  },
  "application/vnd.ms-package.obfuscated-opentype": {
    source: "apache"
  },
  "application/vnd.ms-pki.seccat": {
    source: "apache",
    extensions: [
      "cat"
    ]
  },
  "application/vnd.ms-pki.stl": {
    source: "apache",
    extensions: [
      "stl"
    ]
  },
  "application/vnd.ms-playready.initiator+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-powerpoint": {
    source: "iana",
    compressible: false,
    extensions: [
      "ppt",
      "pps",
      "pot"
    ]
  },
  "application/vnd.ms-powerpoint.addin.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppam"
    ]
  },
  "application/vnd.ms-powerpoint.presentation.macroenabled.12": {
    source: "iana",
    extensions: [
      "pptm"
    ]
  },
  "application/vnd.ms-powerpoint.slide.macroenabled.12": {
    source: "iana",
    extensions: [
      "sldm"
    ]
  },
  "application/vnd.ms-powerpoint.slideshow.macroenabled.12": {
    source: "iana",
    extensions: [
      "ppsm"
    ]
  },
  "application/vnd.ms-powerpoint.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "potm"
    ]
  },
  "application/vnd.ms-printdevicecapabilities+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-printing.printticket+xml": {
    source: "apache",
    compressible: true
  },
  "application/vnd.ms-printschematicket+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ms-project": {
    source: "iana",
    extensions: [
      "mpp",
      "mpt"
    ]
  },
  "application/vnd.ms-tnef": {
    source: "iana"
  },
  "application/vnd.ms-windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.nwprinting.oob": {
    source: "iana"
  },
  "application/vnd.ms-windows.printerpairing": {
    source: "iana"
  },
  "application/vnd.ms-windows.wsd.oob": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.lic-resp": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-chlg-req": {
    source: "iana"
  },
  "application/vnd.ms-wmdrm.meter-resp": {
    source: "iana"
  },
  "application/vnd.ms-word.document.macroenabled.12": {
    source: "iana",
    extensions: [
      "docm"
    ]
  },
  "application/vnd.ms-word.template.macroenabled.12": {
    source: "iana",
    extensions: [
      "dotm"
    ]
  },
  "application/vnd.ms-works": {
    source: "iana",
    extensions: [
      "wps",
      "wks",
      "wcm",
      "wdb"
    ]
  },
  "application/vnd.ms-wpl": {
    source: "iana",
    extensions: [
      "wpl"
    ]
  },
  "application/vnd.ms-xpsdocument": {
    source: "iana",
    compressible: false,
    extensions: [
      "xps"
    ]
  },
  "application/vnd.msa-disk-image": {
    source: "iana"
  },
  "application/vnd.mseq": {
    source: "iana",
    extensions: [
      "mseq"
    ]
  },
  "application/vnd.msign": {
    source: "iana"
  },
  "application/vnd.multiad.creator": {
    source: "iana"
  },
  "application/vnd.multiad.creator.cif": {
    source: "iana"
  },
  "application/vnd.music-niff": {
    source: "iana"
  },
  "application/vnd.musician": {
    source: "iana",
    extensions: [
      "mus"
    ]
  },
  "application/vnd.muvee.style": {
    source: "iana",
    extensions: [
      "msty"
    ]
  },
  "application/vnd.mynfc": {
    source: "iana",
    extensions: [
      "taglet"
    ]
  },
  "application/vnd.nacamar.ybrid+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.ncd.control": {
    source: "iana"
  },
  "application/vnd.ncd.reference": {
    source: "iana"
  },
  "application/vnd.nearst.inv+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nebumind.line": {
    source: "iana"
  },
  "application/vnd.nervana": {
    source: "iana"
  },
  "application/vnd.netfpx": {
    source: "iana"
  },
  "application/vnd.neurolanguage.nlu": {
    source: "iana",
    extensions: [
      "nlu"
    ]
  },
  "application/vnd.nimn": {
    source: "iana"
  },
  "application/vnd.nintendo.nitro.rom": {
    source: "iana"
  },
  "application/vnd.nintendo.snes.rom": {
    source: "iana"
  },
  "application/vnd.nitf": {
    source: "iana",
    extensions: [
      "ntf",
      "nitf"
    ]
  },
  "application/vnd.noblenet-directory": {
    source: "iana",
    extensions: [
      "nnd"
    ]
  },
  "application/vnd.noblenet-sealer": {
    source: "iana",
    extensions: [
      "nns"
    ]
  },
  "application/vnd.noblenet-web": {
    source: "iana",
    extensions: [
      "nnw"
    ]
  },
  "application/vnd.nokia.catalogs": {
    source: "iana"
  },
  "application/vnd.nokia.conml+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.conml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.iptv.config+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.isds-radio-presets": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.landmark+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.landmarkcollection+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.n-gage.ac+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "ac"
    ]
  },
  "application/vnd.nokia.n-gage.data": {
    source: "iana",
    extensions: [
      "ngdat"
    ]
  },
  "application/vnd.nokia.n-gage.symbian.install": {
    source: "iana",
    extensions: [
      "n-gage"
    ]
  },
  "application/vnd.nokia.ncd": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+wbxml": {
    source: "iana"
  },
  "application/vnd.nokia.pcd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.nokia.radio-preset": {
    source: "iana",
    extensions: [
      "rpst"
    ]
  },
  "application/vnd.nokia.radio-presets": {
    source: "iana",
    extensions: [
      "rpss"
    ]
  },
  "application/vnd.novadigm.edm": {
    source: "iana",
    extensions: [
      "edm"
    ]
  },
  "application/vnd.novadigm.edx": {
    source: "iana",
    extensions: [
      "edx"
    ]
  },
  "application/vnd.novadigm.ext": {
    source: "iana",
    extensions: [
      "ext"
    ]
  },
  "application/vnd.ntt-local.content-share": {
    source: "iana"
  },
  "application/vnd.ntt-local.file-transfer": {
    source: "iana"
  },
  "application/vnd.ntt-local.ogw_remote-access": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_remote": {
    source: "iana"
  },
  "application/vnd.ntt-local.sip-ta_tcp_stream": {
    source: "iana"
  },
  "application/vnd.oasis.opendocument.chart": {
    source: "iana",
    extensions: [
      "odc"
    ]
  },
  "application/vnd.oasis.opendocument.chart-template": {
    source: "iana",
    extensions: [
      "otc"
    ]
  },
  "application/vnd.oasis.opendocument.database": {
    source: "iana",
    extensions: [
      "odb"
    ]
  },
  "application/vnd.oasis.opendocument.formula": {
    source: "iana",
    extensions: [
      "odf"
    ]
  },
  "application/vnd.oasis.opendocument.formula-template": {
    source: "iana",
    extensions: [
      "odft"
    ]
  },
  "application/vnd.oasis.opendocument.graphics": {
    source: "iana",
    compressible: false,
    extensions: [
      "odg"
    ]
  },
  "application/vnd.oasis.opendocument.graphics-template": {
    source: "iana",
    extensions: [
      "otg"
    ]
  },
  "application/vnd.oasis.opendocument.image": {
    source: "iana",
    extensions: [
      "odi"
    ]
  },
  "application/vnd.oasis.opendocument.image-template": {
    source: "iana",
    extensions: [
      "oti"
    ]
  },
  "application/vnd.oasis.opendocument.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "odp"
    ]
  },
  "application/vnd.oasis.opendocument.presentation-template": {
    source: "iana",
    extensions: [
      "otp"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "ods"
    ]
  },
  "application/vnd.oasis.opendocument.spreadsheet-template": {
    source: "iana",
    extensions: [
      "ots"
    ]
  },
  "application/vnd.oasis.opendocument.text": {
    source: "iana",
    compressible: false,
    extensions: [
      "odt"
    ]
  },
  "application/vnd.oasis.opendocument.text-master": {
    source: "iana",
    extensions: [
      "odm"
    ]
  },
  "application/vnd.oasis.opendocument.text-template": {
    source: "iana",
    extensions: [
      "ott"
    ]
  },
  "application/vnd.oasis.opendocument.text-web": {
    source: "iana",
    extensions: [
      "oth"
    ]
  },
  "application/vnd.obn": {
    source: "iana"
  },
  "application/vnd.ocf+cbor": {
    source: "iana"
  },
  "application/vnd.oci.image.manifest.v1+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oftn.l10n+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessdownload+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.contentaccessstreaming+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.cspg-hexbinary": {
    source: "iana"
  },
  "application/vnd.oipf.dae.svg+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.dae.xhtml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.mippvcontrolmessage+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.pae.gem": {
    source: "iana"
  },
  "application/vnd.oipf.spdiscovery+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.spdlist+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.ueprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oipf.userprofile+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.olpc-sugar": {
    source: "iana",
    extensions: [
      "xo"
    ]
  },
  "application/vnd.oma-scws-config": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-request": {
    source: "iana"
  },
  "application/vnd.oma-scws-http-response": {
    source: "iana"
  },
  "application/vnd.oma.bcast.associated-procedure-parameter+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.drm-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.imd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.ltkm": {
    source: "iana"
  },
  "application/vnd.oma.bcast.notification+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.provisioningtrigger": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgboot": {
    source: "iana"
  },
  "application/vnd.oma.bcast.sgdd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sgdu": {
    source: "iana"
  },
  "application/vnd.oma.bcast.simple-symbol-container": {
    source: "iana"
  },
  "application/vnd.oma.bcast.smartcard-trigger+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.sprov+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.bcast.stkm": {
    source: "iana"
  },
  "application/vnd.oma.cab-address-book+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-feature-handler+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-pcc+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-subs-invite+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.cab-user-prefs+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.dcd": {
    source: "iana"
  },
  "application/vnd.oma.dcdc": {
    source: "iana"
  },
  "application/vnd.oma.dd2+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dd2"
    ]
  },
  "application/vnd.oma.drm.risd+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.group-usage-list+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+cbor": {
    source: "iana"
  },
  "application/vnd.oma.lwm2m+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.lwm2m+tlv": {
    source: "iana"
  },
  "application/vnd.oma.pal+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.detailed-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.final-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.groups+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.invocation-descriptor+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.poc.optimized-progress-report+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.push": {
    source: "iana"
  },
  "application/vnd.oma.scidm.messages+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oma.xcap-directory+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.omads-email+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-file+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omads-folder+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.omaloc-supl-init": {
    source: "iana"
  },
  "application/vnd.onepager": {
    source: "iana"
  },
  "application/vnd.onepagertamp": {
    source: "iana"
  },
  "application/vnd.onepagertamx": {
    source: "iana"
  },
  "application/vnd.onepagertat": {
    source: "iana"
  },
  "application/vnd.onepagertatp": {
    source: "iana"
  },
  "application/vnd.onepagertatx": {
    source: "iana"
  },
  "application/vnd.openblox.game+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "obgx"
    ]
  },
  "application/vnd.openblox.game-binary": {
    source: "iana"
  },
  "application/vnd.openeye.oeb": {
    source: "iana"
  },
  "application/vnd.openofficeorg.extension": {
    source: "apache",
    extensions: [
      "oxt"
    ]
  },
  "application/vnd.openstreetmap.data+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osm"
    ]
  },
  "application/vnd.opentimestamps.ots": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.custom-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.customxmlproperties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawing+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chart+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.chartshapes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramcolors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramdata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramlayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.drawingml.diagramstyle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.extended-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.commentauthors+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.handoutmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesmaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.notesslide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    source: "iana",
    compressible: false,
    extensions: [
      "pptx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.presprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide": {
    source: "iana",
    extensions: [
      "sldx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slide+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidelayout+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slidemaster+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow": {
    source: "iana",
    extensions: [
      "ppsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideshow.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.slideupdateinfo+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tablestyles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.tags+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template": {
    source: "iana",
    extensions: [
      "potx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.presentationml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.presentationml.viewprops+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.calcchain+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.chartsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.connections+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.dialogsheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.externallink+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcachedefinition+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivotcacherecords+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.pivottable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.querytable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionheaders+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.revisionlog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sharedstrings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    source: "iana",
    compressible: false,
    extensions: [
      "xlsx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheetmetadata+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.table+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.tablesinglecells+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template": {
    source: "iana",
    extensions: [
      "xltx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.usernames+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.volatiledependencies+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.theme+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.themeoverride+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.vmldrawing": {
    source: "iana"
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    source: "iana",
    compressible: false,
    extensions: [
      "docx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.glossary+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.endnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.fonttable+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.footnotes+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template": {
    source: "iana",
    extensions: [
      "dotx"
    ]
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.template.main+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.websettings+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.core-properties+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.digital-signature-xmlsignature+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.openxmlformats-package.relationships+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oracle.resource+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.orange.indata": {
    source: "iana"
  },
  "application/vnd.osa.netdeploy": {
    source: "iana"
  },
  "application/vnd.osgeo.mapguide.package": {
    source: "iana",
    extensions: [
      "mgp"
    ]
  },
  "application/vnd.osgi.bundle": {
    source: "iana"
  },
  "application/vnd.osgi.dp": {
    source: "iana",
    extensions: [
      "dp"
    ]
  },
  "application/vnd.osgi.subsystem": {
    source: "iana",
    extensions: [
      "esa"
    ]
  },
  "application/vnd.otps.ct-kip+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.oxli.countgraph": {
    source: "iana"
  },
  "application/vnd.pagerduty+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.palm": {
    source: "iana",
    extensions: [
      "pdb",
      "pqa",
      "oprc"
    ]
  },
  "application/vnd.panoply": {
    source: "iana"
  },
  "application/vnd.paos.xml": {
    source: "iana"
  },
  "application/vnd.patentdive": {
    source: "iana"
  },
  "application/vnd.patientecommsdoc": {
    source: "iana"
  },
  "application/vnd.pawaafile": {
    source: "iana",
    extensions: [
      "paw"
    ]
  },
  "application/vnd.pcos": {
    source: "iana"
  },
  "application/vnd.pg.format": {
    source: "iana",
    extensions: [
      "str"
    ]
  },
  "application/vnd.pg.osasli": {
    source: "iana",
    extensions: [
      "ei6"
    ]
  },
  "application/vnd.piaccess.application-licence": {
    source: "iana"
  },
  "application/vnd.picsel": {
    source: "iana",
    extensions: [
      "efif"
    ]
  },
  "application/vnd.pmi.widget": {
    source: "iana",
    extensions: [
      "wg"
    ]
  },
  "application/vnd.poc.group-advertisement+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.pocketlearn": {
    source: "iana",
    extensions: [
      "plf"
    ]
  },
  "application/vnd.powerbuilder6": {
    source: "iana",
    extensions: [
      "pbd"
    ]
  },
  "application/vnd.powerbuilder6-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder7": {
    source: "iana"
  },
  "application/vnd.powerbuilder7-s": {
    source: "iana"
  },
  "application/vnd.powerbuilder75": {
    source: "iana"
  },
  "application/vnd.powerbuilder75-s": {
    source: "iana"
  },
  "application/vnd.preminet": {
    source: "iana"
  },
  "application/vnd.previewsystems.box": {
    source: "iana",
    extensions: [
      "box"
    ]
  },
  "application/vnd.proteus.magazine": {
    source: "iana",
    extensions: [
      "mgz"
    ]
  },
  "application/vnd.psfs": {
    source: "iana"
  },
  "application/vnd.publishare-delta-tree": {
    source: "iana",
    extensions: [
      "qps"
    ]
  },
  "application/vnd.pvi.ptid1": {
    source: "iana",
    extensions: [
      "ptid"
    ]
  },
  "application/vnd.pwg-multiplexed": {
    source: "iana"
  },
  "application/vnd.pwg-xhtml-print+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.qualcomm.brew-app-res": {
    source: "iana"
  },
  "application/vnd.quarantainenet": {
    source: "iana"
  },
  "application/vnd.quark.quarkxpress": {
    source: "iana",
    extensions: [
      "qxd",
      "qxt",
      "qwd",
      "qwt",
      "qxl",
      "qxb"
    ]
  },
  "application/vnd.quobject-quoxdocument": {
    source: "iana"
  },
  "application/vnd.radisys.moml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-conn+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-audit-stream+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-conf+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-base+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-detect+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-fax-sendrecv+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-group+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-speech+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.radisys.msml-dialog-transform+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rainstor.data": {
    source: "iana"
  },
  "application/vnd.rapid": {
    source: "iana"
  },
  "application/vnd.rar": {
    source: "iana",
    extensions: [
      "rar"
    ]
  },
  "application/vnd.realvnc.bed": {
    source: "iana",
    extensions: [
      "bed"
    ]
  },
  "application/vnd.recordare.musicxml": {
    source: "iana",
    extensions: [
      "mxl"
    ]
  },
  "application/vnd.recordare.musicxml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "musicxml"
    ]
  },
  "application/vnd.renlearn.rlprint": {
    source: "iana"
  },
  "application/vnd.resilient.logic": {
    source: "iana"
  },
  "application/vnd.restful+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.rig.cryptonote": {
    source: "iana",
    extensions: [
      "cryptonote"
    ]
  },
  "application/vnd.rim.cod": {
    source: "apache",
    extensions: [
      "cod"
    ]
  },
  "application/vnd.rn-realmedia": {
    source: "apache",
    extensions: [
      "rm"
    ]
  },
  "application/vnd.rn-realmedia-vbr": {
    source: "apache",
    extensions: [
      "rmvb"
    ]
  },
  "application/vnd.route66.link66+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "link66"
    ]
  },
  "application/vnd.rs-274x": {
    source: "iana"
  },
  "application/vnd.ruckus.download": {
    source: "iana"
  },
  "application/vnd.s3sms": {
    source: "iana"
  },
  "application/vnd.sailingtracker.track": {
    source: "iana",
    extensions: [
      "st"
    ]
  },
  "application/vnd.sar": {
    source: "iana"
  },
  "application/vnd.sbm.cid": {
    source: "iana"
  },
  "application/vnd.sbm.mid2": {
    source: "iana"
  },
  "application/vnd.scribus": {
    source: "iana"
  },
  "application/vnd.sealed.3df": {
    source: "iana"
  },
  "application/vnd.sealed.csf": {
    source: "iana"
  },
  "application/vnd.sealed.doc": {
    source: "iana"
  },
  "application/vnd.sealed.eml": {
    source: "iana"
  },
  "application/vnd.sealed.mht": {
    source: "iana"
  },
  "application/vnd.sealed.net": {
    source: "iana"
  },
  "application/vnd.sealed.ppt": {
    source: "iana"
  },
  "application/vnd.sealed.tiff": {
    source: "iana"
  },
  "application/vnd.sealed.xls": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.html": {
    source: "iana"
  },
  "application/vnd.sealedmedia.softseal.pdf": {
    source: "iana"
  },
  "application/vnd.seemail": {
    source: "iana",
    extensions: [
      "see"
    ]
  },
  "application/vnd.seis+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.sema": {
    source: "iana",
    extensions: [
      "sema"
    ]
  },
  "application/vnd.semd": {
    source: "iana",
    extensions: [
      "semd"
    ]
  },
  "application/vnd.semf": {
    source: "iana",
    extensions: [
      "semf"
    ]
  },
  "application/vnd.shade-save-file": {
    source: "iana"
  },
  "application/vnd.shana.informed.formdata": {
    source: "iana",
    extensions: [
      "ifm"
    ]
  },
  "application/vnd.shana.informed.formtemplate": {
    source: "iana",
    extensions: [
      "itp"
    ]
  },
  "application/vnd.shana.informed.interchange": {
    source: "iana",
    extensions: [
      "iif"
    ]
  },
  "application/vnd.shana.informed.package": {
    source: "iana",
    extensions: [
      "ipk"
    ]
  },
  "application/vnd.shootproof+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shopkick+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.shp": {
    source: "iana"
  },
  "application/vnd.shx": {
    source: "iana"
  },
  "application/vnd.sigrok.session": {
    source: "iana"
  },
  "application/vnd.simtech-mindmapper": {
    source: "iana",
    extensions: [
      "twd",
      "twds"
    ]
  },
  "application/vnd.siren+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.smaf": {
    source: "iana",
    extensions: [
      "mmf"
    ]
  },
  "application/vnd.smart.notebook": {
    source: "iana"
  },
  "application/vnd.smart.teacher": {
    source: "iana",
    extensions: [
      "teacher"
    ]
  },
  "application/vnd.snesdev-page-table": {
    source: "iana"
  },
  "application/vnd.software602.filler.form+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "fo"
    ]
  },
  "application/vnd.software602.filler.form-xml-zip": {
    source: "iana"
  },
  "application/vnd.solent.sdkm+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "sdkm",
      "sdkd"
    ]
  },
  "application/vnd.spotfire.dxp": {
    source: "iana",
    extensions: [
      "dxp"
    ]
  },
  "application/vnd.spotfire.sfs": {
    source: "iana",
    extensions: [
      "sfs"
    ]
  },
  "application/vnd.sqlite3": {
    source: "iana"
  },
  "application/vnd.sss-cod": {
    source: "iana"
  },
  "application/vnd.sss-dtf": {
    source: "iana"
  },
  "application/vnd.sss-ntf": {
    source: "iana"
  },
  "application/vnd.stardivision.calc": {
    source: "apache",
    extensions: [
      "sdc"
    ]
  },
  "application/vnd.stardivision.draw": {
    source: "apache",
    extensions: [
      "sda"
    ]
  },
  "application/vnd.stardivision.impress": {
    source: "apache",
    extensions: [
      "sdd"
    ]
  },
  "application/vnd.stardivision.math": {
    source: "apache",
    extensions: [
      "smf"
    ]
  },
  "application/vnd.stardivision.writer": {
    source: "apache",
    extensions: [
      "sdw",
      "vor"
    ]
  },
  "application/vnd.stardivision.writer-global": {
    source: "apache",
    extensions: [
      "sgl"
    ]
  },
  "application/vnd.stepmania.package": {
    source: "iana",
    extensions: [
      "smzip"
    ]
  },
  "application/vnd.stepmania.stepchart": {
    source: "iana",
    extensions: [
      "sm"
    ]
  },
  "application/vnd.street-stream": {
    source: "iana"
  },
  "application/vnd.sun.wadl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wadl"
    ]
  },
  "application/vnd.sun.xml.calc": {
    source: "apache",
    extensions: [
      "sxc"
    ]
  },
  "application/vnd.sun.xml.calc.template": {
    source: "apache",
    extensions: [
      "stc"
    ]
  },
  "application/vnd.sun.xml.draw": {
    source: "apache",
    extensions: [
      "sxd"
    ]
  },
  "application/vnd.sun.xml.draw.template": {
    source: "apache",
    extensions: [
      "std"
    ]
  },
  "application/vnd.sun.xml.impress": {
    source: "apache",
    extensions: [
      "sxi"
    ]
  },
  "application/vnd.sun.xml.impress.template": {
    source: "apache",
    extensions: [
      "sti"
    ]
  },
  "application/vnd.sun.xml.math": {
    source: "apache",
    extensions: [
      "sxm"
    ]
  },
  "application/vnd.sun.xml.writer": {
    source: "apache",
    extensions: [
      "sxw"
    ]
  },
  "application/vnd.sun.xml.writer.global": {
    source: "apache",
    extensions: [
      "sxg"
    ]
  },
  "application/vnd.sun.xml.writer.template": {
    source: "apache",
    extensions: [
      "stw"
    ]
  },
  "application/vnd.sus-calendar": {
    source: "iana",
    extensions: [
      "sus",
      "susp"
    ]
  },
  "application/vnd.svd": {
    source: "iana",
    extensions: [
      "svd"
    ]
  },
  "application/vnd.swiftview-ics": {
    source: "iana"
  },
  "application/vnd.sycle+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.syft+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.symbian.install": {
    source: "apache",
    extensions: [
      "sis",
      "sisx"
    ]
  },
  "application/vnd.syncml+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xsm"
    ]
  },
  "application/vnd.syncml.dm+wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "bdm"
    ]
  },
  "application/vnd.syncml.dm+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "xdm"
    ]
  },
  "application/vnd.syncml.dm.notification": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmddf+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "ddf"
    ]
  },
  "application/vnd.syncml.dmtnds+wbxml": {
    source: "iana"
  },
  "application/vnd.syncml.dmtnds+xml": {
    source: "iana",
    charset: "UTF-8",
    compressible: true
  },
  "application/vnd.syncml.ds.notification": {
    source: "iana"
  },
  "application/vnd.tableschema+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tao.intent-module-archive": {
    source: "iana",
    extensions: [
      "tao"
    ]
  },
  "application/vnd.tcpdump.pcap": {
    source: "iana",
    extensions: [
      "pcap",
      "cap",
      "dmp"
    ]
  },
  "application/vnd.think-cell.ppttc+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tmd.mediaflex.api+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.tml": {
    source: "iana"
  },
  "application/vnd.tmobile-livetv": {
    source: "iana",
    extensions: [
      "tmo"
    ]
  },
  "application/vnd.tri.onesource": {
    source: "iana"
  },
  "application/vnd.trid.tpt": {
    source: "iana",
    extensions: [
      "tpt"
    ]
  },
  "application/vnd.triscape.mxs": {
    source: "iana",
    extensions: [
      "mxs"
    ]
  },
  "application/vnd.trueapp": {
    source: "iana",
    extensions: [
      "tra"
    ]
  },
  "application/vnd.truedoc": {
    source: "iana"
  },
  "application/vnd.ubisoft.webplayer": {
    source: "iana"
  },
  "application/vnd.ufdl": {
    source: "iana",
    extensions: [
      "ufd",
      "ufdl"
    ]
  },
  "application/vnd.uiq.theme": {
    source: "iana",
    extensions: [
      "utz"
    ]
  },
  "application/vnd.umajin": {
    source: "iana",
    extensions: [
      "umj"
    ]
  },
  "application/vnd.unity": {
    source: "iana",
    extensions: [
      "unityweb"
    ]
  },
  "application/vnd.uoml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "uoml"
    ]
  },
  "application/vnd.uplanet.alert": {
    source: "iana"
  },
  "application/vnd.uplanet.alert-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice": {
    source: "iana"
  },
  "application/vnd.uplanet.bearer-choice-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop": {
    source: "iana"
  },
  "application/vnd.uplanet.cacheop-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.channel": {
    source: "iana"
  },
  "application/vnd.uplanet.channel-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.list": {
    source: "iana"
  },
  "application/vnd.uplanet.list-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd": {
    source: "iana"
  },
  "application/vnd.uplanet.listcmd-wbxml": {
    source: "iana"
  },
  "application/vnd.uplanet.signal": {
    source: "iana"
  },
  "application/vnd.uri-map": {
    source: "iana"
  },
  "application/vnd.valve.source.material": {
    source: "iana"
  },
  "application/vnd.vcx": {
    source: "iana",
    extensions: [
      "vcx"
    ]
  },
  "application/vnd.vd-study": {
    source: "iana"
  },
  "application/vnd.vectorworks": {
    source: "iana"
  },
  "application/vnd.vel+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.verimatrix.vcas": {
    source: "iana"
  },
  "application/vnd.veritone.aion+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.veryant.thin": {
    source: "iana"
  },
  "application/vnd.ves.encrypted": {
    source: "iana"
  },
  "application/vnd.vidsoft.vidconference": {
    source: "iana"
  },
  "application/vnd.visio": {
    source: "iana",
    extensions: [
      "vsd",
      "vst",
      "vss",
      "vsw"
    ]
  },
  "application/vnd.visionary": {
    source: "iana",
    extensions: [
      "vis"
    ]
  },
  "application/vnd.vividence.scriptfile": {
    source: "iana"
  },
  "application/vnd.vsf": {
    source: "iana",
    extensions: [
      "vsf"
    ]
  },
  "application/vnd.wap.sic": {
    source: "iana"
  },
  "application/vnd.wap.slc": {
    source: "iana"
  },
  "application/vnd.wap.wbxml": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "wbxml"
    ]
  },
  "application/vnd.wap.wmlc": {
    source: "iana",
    extensions: [
      "wmlc"
    ]
  },
  "application/vnd.wap.wmlscriptc": {
    source: "iana",
    extensions: [
      "wmlsc"
    ]
  },
  "application/vnd.webturbo": {
    source: "iana",
    extensions: [
      "wtb"
    ]
  },
  "application/vnd.wfa.dpp": {
    source: "iana"
  },
  "application/vnd.wfa.p2p": {
    source: "iana"
  },
  "application/vnd.wfa.wsc": {
    source: "iana"
  },
  "application/vnd.windows.devicepairing": {
    source: "iana"
  },
  "application/vnd.wmc": {
    source: "iana"
  },
  "application/vnd.wmf.bootstrap": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica": {
    source: "iana"
  },
  "application/vnd.wolfram.mathematica.package": {
    source: "iana"
  },
  "application/vnd.wolfram.player": {
    source: "iana",
    extensions: [
      "nbp"
    ]
  },
  "application/vnd.wordperfect": {
    source: "iana",
    extensions: [
      "wpd"
    ]
  },
  "application/vnd.wqd": {
    source: "iana",
    extensions: [
      "wqd"
    ]
  },
  "application/vnd.wrq-hp3000-labelled": {
    source: "iana"
  },
  "application/vnd.wt.stf": {
    source: "iana",
    extensions: [
      "stf"
    ]
  },
  "application/vnd.wv.csp+wbxml": {
    source: "iana"
  },
  "application/vnd.wv.csp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.wv.ssp+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xacml+json": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xara": {
    source: "iana",
    extensions: [
      "xar"
    ]
  },
  "application/vnd.xfdl": {
    source: "iana",
    extensions: [
      "xfdl"
    ]
  },
  "application/vnd.xfdl.webform": {
    source: "iana"
  },
  "application/vnd.xmi+xml": {
    source: "iana",
    compressible: true
  },
  "application/vnd.xmpie.cpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.dpkg": {
    source: "iana"
  },
  "application/vnd.xmpie.plan": {
    source: "iana"
  },
  "application/vnd.xmpie.ppkg": {
    source: "iana"
  },
  "application/vnd.xmpie.xlim": {
    source: "iana"
  },
  "application/vnd.yamaha.hv-dic": {
    source: "iana",
    extensions: [
      "hvd"
    ]
  },
  "application/vnd.yamaha.hv-script": {
    source: "iana",
    extensions: [
      "hvs"
    ]
  },
  "application/vnd.yamaha.hv-voice": {
    source: "iana",
    extensions: [
      "hvp"
    ]
  },
  "application/vnd.yamaha.openscoreformat": {
    source: "iana",
    extensions: [
      "osf"
    ]
  },
  "application/vnd.yamaha.openscoreformat.osfpvg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "osfpvg"
    ]
  },
  "application/vnd.yamaha.remote-setup": {
    source: "iana"
  },
  "application/vnd.yamaha.smaf-audio": {
    source: "iana",
    extensions: [
      "saf"
    ]
  },
  "application/vnd.yamaha.smaf-phrase": {
    source: "iana",
    extensions: [
      "spf"
    ]
  },
  "application/vnd.yamaha.through-ngn": {
    source: "iana"
  },
  "application/vnd.yamaha.tunnel-udpencap": {
    source: "iana"
  },
  "application/vnd.yaoweme": {
    source: "iana"
  },
  "application/vnd.yellowriver-custom-menu": {
    source: "iana",
    extensions: [
      "cmp"
    ]
  },
  "application/vnd.youtube.yt": {
    source: "iana"
  },
  "application/vnd.zul": {
    source: "iana",
    extensions: [
      "zir",
      "zirz"
    ]
  },
  "application/vnd.zzazz.deck+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "zaz"
    ]
  },
  "application/voicexml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "vxml"
    ]
  },
  "application/voucher-cms+json": {
    source: "iana",
    compressible: true
  },
  "application/vq-rtcpxr": {
    source: "iana"
  },
  "application/wasm": {
    source: "iana",
    compressible: true,
    extensions: [
      "wasm"
    ]
  },
  "application/watcherinfo+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wif"
    ]
  },
  "application/webpush-options+json": {
    source: "iana",
    compressible: true
  },
  "application/whoispp-query": {
    source: "iana"
  },
  "application/whoispp-response": {
    source: "iana"
  },
  "application/widget": {
    source: "iana",
    extensions: [
      "wgt"
    ]
  },
  "application/winhlp": {
    source: "apache",
    extensions: [
      "hlp"
    ]
  },
  "application/wita": {
    source: "iana"
  },
  "application/wordperfect5.1": {
    source: "iana"
  },
  "application/wsdl+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wsdl"
    ]
  },
  "application/wspolicy+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "wspolicy"
    ]
  },
  "application/x-7z-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "7z"
    ]
  },
  "application/x-abiword": {
    source: "apache",
    extensions: [
      "abw"
    ]
  },
  "application/x-ace-compressed": {
    source: "apache",
    extensions: [
      "ace"
    ]
  },
  "application/x-amf": {
    source: "apache"
  },
  "application/x-apple-diskimage": {
    source: "apache",
    extensions: [
      "dmg"
    ]
  },
  "application/x-arj": {
    compressible: false,
    extensions: [
      "arj"
    ]
  },
  "application/x-authorware-bin": {
    source: "apache",
    extensions: [
      "aab",
      "x32",
      "u32",
      "vox"
    ]
  },
  "application/x-authorware-map": {
    source: "apache",
    extensions: [
      "aam"
    ]
  },
  "application/x-authorware-seg": {
    source: "apache",
    extensions: [
      "aas"
    ]
  },
  "application/x-bcpio": {
    source: "apache",
    extensions: [
      "bcpio"
    ]
  },
  "application/x-bdoc": {
    compressible: false,
    extensions: [
      "bdoc"
    ]
  },
  "application/x-bittorrent": {
    source: "apache",
    extensions: [
      "torrent"
    ]
  },
  "application/x-blorb": {
    source: "apache",
    extensions: [
      "blb",
      "blorb"
    ]
  },
  "application/x-bzip": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz"
    ]
  },
  "application/x-bzip2": {
    source: "apache",
    compressible: false,
    extensions: [
      "bz2",
      "boz"
    ]
  },
  "application/x-cbr": {
    source: "apache",
    extensions: [
      "cbr",
      "cba",
      "cbt",
      "cbz",
      "cb7"
    ]
  },
  "application/x-cdlink": {
    source: "apache",
    extensions: [
      "vcd"
    ]
  },
  "application/x-cfs-compressed": {
    source: "apache",
    extensions: [
      "cfs"
    ]
  },
  "application/x-chat": {
    source: "apache",
    extensions: [
      "chat"
    ]
  },
  "application/x-chess-pgn": {
    source: "apache",
    extensions: [
      "pgn"
    ]
  },
  "application/x-chrome-extension": {
    extensions: [
      "crx"
    ]
  },
  "application/x-cocoa": {
    source: "nginx",
    extensions: [
      "cco"
    ]
  },
  "application/x-compress": {
    source: "apache"
  },
  "application/x-conference": {
    source: "apache",
    extensions: [
      "nsc"
    ]
  },
  "application/x-cpio": {
    source: "apache",
    extensions: [
      "cpio"
    ]
  },
  "application/x-csh": {
    source: "apache",
    extensions: [
      "csh"
    ]
  },
  "application/x-deb": {
    compressible: false
  },
  "application/x-debian-package": {
    source: "apache",
    extensions: [
      "deb",
      "udeb"
    ]
  },
  "application/x-dgc-compressed": {
    source: "apache",
    extensions: [
      "dgc"
    ]
  },
  "application/x-director": {
    source: "apache",
    extensions: [
      "dir",
      "dcr",
      "dxr",
      "cst",
      "cct",
      "cxt",
      "w3d",
      "fgd",
      "swa"
    ]
  },
  "application/x-doom": {
    source: "apache",
    extensions: [
      "wad"
    ]
  },
  "application/x-dtbncx+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "ncx"
    ]
  },
  "application/x-dtbook+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "dtb"
    ]
  },
  "application/x-dtbresource+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "res"
    ]
  },
  "application/x-dvi": {
    source: "apache",
    compressible: false,
    extensions: [
      "dvi"
    ]
  },
  "application/x-envoy": {
    source: "apache",
    extensions: [
      "evy"
    ]
  },
  "application/x-eva": {
    source: "apache",
    extensions: [
      "eva"
    ]
  },
  "application/x-font-bdf": {
    source: "apache",
    extensions: [
      "bdf"
    ]
  },
  "application/x-font-dos": {
    source: "apache"
  },
  "application/x-font-framemaker": {
    source: "apache"
  },
  "application/x-font-ghostscript": {
    source: "apache",
    extensions: [
      "gsf"
    ]
  },
  "application/x-font-libgrx": {
    source: "apache"
  },
  "application/x-font-linux-psf": {
    source: "apache",
    extensions: [
      "psf"
    ]
  },
  "application/x-font-pcf": {
    source: "apache",
    extensions: [
      "pcf"
    ]
  },
  "application/x-font-snf": {
    source: "apache",
    extensions: [
      "snf"
    ]
  },
  "application/x-font-speedo": {
    source: "apache"
  },
  "application/x-font-sunos-news": {
    source: "apache"
  },
  "application/x-font-type1": {
    source: "apache",
    extensions: [
      "pfa",
      "pfb",
      "pfm",
      "afm"
    ]
  },
  "application/x-font-vfont": {
    source: "apache"
  },
  "application/x-freearc": {
    source: "apache",
    extensions: [
      "arc"
    ]
  },
  "application/x-futuresplash": {
    source: "apache",
    extensions: [
      "spl"
    ]
  },
  "application/x-gca-compressed": {
    source: "apache",
    extensions: [
      "gca"
    ]
  },
  "application/x-glulx": {
    source: "apache",
    extensions: [
      "ulx"
    ]
  },
  "application/x-gnumeric": {
    source: "apache",
    extensions: [
      "gnumeric"
    ]
  },
  "application/x-gramps-xml": {
    source: "apache",
    extensions: [
      "gramps"
    ]
  },
  "application/x-gtar": {
    source: "apache",
    extensions: [
      "gtar"
    ]
  },
  "application/x-gzip": {
    source: "apache"
  },
  "application/x-hdf": {
    source: "apache",
    extensions: [
      "hdf"
    ]
  },
  "application/x-httpd-php": {
    compressible: true,
    extensions: [
      "php"
    ]
  },
  "application/x-install-instructions": {
    source: "apache",
    extensions: [
      "install"
    ]
  },
  "application/x-iso9660-image": {
    source: "apache",
    extensions: [
      "iso"
    ]
  },
  "application/x-iwork-keynote-sffkey": {
    extensions: [
      "key"
    ]
  },
  "application/x-iwork-numbers-sffnumbers": {
    extensions: [
      "numbers"
    ]
  },
  "application/x-iwork-pages-sffpages": {
    extensions: [
      "pages"
    ]
  },
  "application/x-java-archive-diff": {
    source: "nginx",
    extensions: [
      "jardiff"
    ]
  },
  "application/x-java-jnlp-file": {
    source: "apache",
    compressible: false,
    extensions: [
      "jnlp"
    ]
  },
  "application/x-javascript": {
    compressible: true
  },
  "application/x-keepass2": {
    extensions: [
      "kdbx"
    ]
  },
  "application/x-latex": {
    source: "apache",
    compressible: false,
    extensions: [
      "latex"
    ]
  },
  "application/x-lua-bytecode": {
    extensions: [
      "luac"
    ]
  },
  "application/x-lzh-compressed": {
    source: "apache",
    extensions: [
      "lzh",
      "lha"
    ]
  },
  "application/x-makeself": {
    source: "nginx",
    extensions: [
      "run"
    ]
  },
  "application/x-mie": {
    source: "apache",
    extensions: [
      "mie"
    ]
  },
  "application/x-mobipocket-ebook": {
    source: "apache",
    extensions: [
      "prc",
      "mobi"
    ]
  },
  "application/x-mpegurl": {
    compressible: false
  },
  "application/x-ms-application": {
    source: "apache",
    extensions: [
      "application"
    ]
  },
  "application/x-ms-shortcut": {
    source: "apache",
    extensions: [
      "lnk"
    ]
  },
  "application/x-ms-wmd": {
    source: "apache",
    extensions: [
      "wmd"
    ]
  },
  "application/x-ms-wmz": {
    source: "apache",
    extensions: [
      "wmz"
    ]
  },
  "application/x-ms-xbap": {
    source: "apache",
    extensions: [
      "xbap"
    ]
  },
  "application/x-msaccess": {
    source: "apache",
    extensions: [
      "mdb"
    ]
  },
  "application/x-msbinder": {
    source: "apache",
    extensions: [
      "obd"
    ]
  },
  "application/x-mscardfile": {
    source: "apache",
    extensions: [
      "crd"
    ]
  },
  "application/x-msclip": {
    source: "apache",
    extensions: [
      "clp"
    ]
  },
  "application/x-msdos-program": {
    extensions: [
      "exe"
    ]
  },
  "application/x-msdownload": {
    source: "apache",
    extensions: [
      "exe",
      "dll",
      "com",
      "bat",
      "msi"
    ]
  },
  "application/x-msmediaview": {
    source: "apache",
    extensions: [
      "mvb",
      "m13",
      "m14"
    ]
  },
  "application/x-msmetafile": {
    source: "apache",
    extensions: [
      "wmf",
      "wmz",
      "emf",
      "emz"
    ]
  },
  "application/x-msmoney": {
    source: "apache",
    extensions: [
      "mny"
    ]
  },
  "application/x-mspublisher": {
    source: "apache",
    extensions: [
      "pub"
    ]
  },
  "application/x-msschedule": {
    source: "apache",
    extensions: [
      "scd"
    ]
  },
  "application/x-msterminal": {
    source: "apache",
    extensions: [
      "trm"
    ]
  },
  "application/x-mswrite": {
    source: "apache",
    extensions: [
      "wri"
    ]
  },
  "application/x-netcdf": {
    source: "apache",
    extensions: [
      "nc",
      "cdf"
    ]
  },
  "application/x-ns-proxy-autoconfig": {
    compressible: true,
    extensions: [
      "pac"
    ]
  },
  "application/x-nzb": {
    source: "apache",
    extensions: [
      "nzb"
    ]
  },
  "application/x-perl": {
    source: "nginx",
    extensions: [
      "pl",
      "pm"
    ]
  },
  "application/x-pilot": {
    source: "nginx",
    extensions: [
      "prc",
      "pdb"
    ]
  },
  "application/x-pkcs12": {
    source: "apache",
    compressible: false,
    extensions: [
      "p12",
      "pfx"
    ]
  },
  "application/x-pkcs7-certificates": {
    source: "apache",
    extensions: [
      "p7b",
      "spc"
    ]
  },
  "application/x-pkcs7-certreqresp": {
    source: "apache",
    extensions: [
      "p7r"
    ]
  },
  "application/x-pki-message": {
    source: "iana"
  },
  "application/x-rar-compressed": {
    source: "apache",
    compressible: false,
    extensions: [
      "rar"
    ]
  },
  "application/x-redhat-package-manager": {
    source: "nginx",
    extensions: [
      "rpm"
    ]
  },
  "application/x-research-info-systems": {
    source: "apache",
    extensions: [
      "ris"
    ]
  },
  "application/x-sea": {
    source: "nginx",
    extensions: [
      "sea"
    ]
  },
  "application/x-sh": {
    source: "apache",
    compressible: true,
    extensions: [
      "sh"
    ]
  },
  "application/x-shar": {
    source: "apache",
    extensions: [
      "shar"
    ]
  },
  "application/x-shockwave-flash": {
    source: "apache",
    compressible: false,
    extensions: [
      "swf"
    ]
  },
  "application/x-silverlight-app": {
    source: "apache",
    extensions: [
      "xap"
    ]
  },
  "application/x-sql": {
    source: "apache",
    extensions: [
      "sql"
    ]
  },
  "application/x-stuffit": {
    source: "apache",
    compressible: false,
    extensions: [
      "sit"
    ]
  },
  "application/x-stuffitx": {
    source: "apache",
    extensions: [
      "sitx"
    ]
  },
  "application/x-subrip": {
    source: "apache",
    extensions: [
      "srt"
    ]
  },
  "application/x-sv4cpio": {
    source: "apache",
    extensions: [
      "sv4cpio"
    ]
  },
  "application/x-sv4crc": {
    source: "apache",
    extensions: [
      "sv4crc"
    ]
  },
  "application/x-t3vm-image": {
    source: "apache",
    extensions: [
      "t3"
    ]
  },
  "application/x-tads": {
    source: "apache",
    extensions: [
      "gam"
    ]
  },
  "application/x-tar": {
    source: "apache",
    compressible: true,
    extensions: [
      "tar"
    ]
  },
  "application/x-tcl": {
    source: "apache",
    extensions: [
      "tcl",
      "tk"
    ]
  },
  "application/x-tex": {
    source: "apache",
    extensions: [
      "tex"
    ]
  },
  "application/x-tex-tfm": {
    source: "apache",
    extensions: [
      "tfm"
    ]
  },
  "application/x-texinfo": {
    source: "apache",
    extensions: [
      "texinfo",
      "texi"
    ]
  },
  "application/x-tgif": {
    source: "apache",
    extensions: [
      "obj"
    ]
  },
  "application/x-ustar": {
    source: "apache",
    extensions: [
      "ustar"
    ]
  },
  "application/x-virtualbox-hdd": {
    compressible: true,
    extensions: [
      "hdd"
    ]
  },
  "application/x-virtualbox-ova": {
    compressible: true,
    extensions: [
      "ova"
    ]
  },
  "application/x-virtualbox-ovf": {
    compressible: true,
    extensions: [
      "ovf"
    ]
  },
  "application/x-virtualbox-vbox": {
    compressible: true,
    extensions: [
      "vbox"
    ]
  },
  "application/x-virtualbox-vbox-extpack": {
    compressible: false,
    extensions: [
      "vbox-extpack"
    ]
  },
  "application/x-virtualbox-vdi": {
    compressible: true,
    extensions: [
      "vdi"
    ]
  },
  "application/x-virtualbox-vhd": {
    compressible: true,
    extensions: [
      "vhd"
    ]
  },
  "application/x-virtualbox-vmdk": {
    compressible: true,
    extensions: [
      "vmdk"
    ]
  },
  "application/x-wais-source": {
    source: "apache",
    extensions: [
      "src"
    ]
  },
  "application/x-web-app-manifest+json": {
    compressible: true,
    extensions: [
      "webapp"
    ]
  },
  "application/x-www-form-urlencoded": {
    source: "iana",
    compressible: true
  },
  "application/x-x509-ca-cert": {
    source: "iana",
    extensions: [
      "der",
      "crt",
      "pem"
    ]
  },
  "application/x-x509-ca-ra-cert": {
    source: "iana"
  },
  "application/x-x509-next-ca-cert": {
    source: "iana"
  },
  "application/x-xfig": {
    source: "apache",
    extensions: [
      "fig"
    ]
  },
  "application/x-xliff+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/x-xpinstall": {
    source: "apache",
    compressible: false,
    extensions: [
      "xpi"
    ]
  },
  "application/x-xz": {
    source: "apache",
    extensions: [
      "xz"
    ]
  },
  "application/x-zmachine": {
    source: "apache",
    extensions: [
      "z1",
      "z2",
      "z3",
      "z4",
      "z5",
      "z6",
      "z7",
      "z8"
    ]
  },
  "application/x400-bp": {
    source: "iana"
  },
  "application/xacml+xml": {
    source: "iana",
    compressible: true
  },
  "application/xaml+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xaml"
    ]
  },
  "application/xcap-att+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xav"
    ]
  },
  "application/xcap-caps+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xca"
    ]
  },
  "application/xcap-diff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xdf"
    ]
  },
  "application/xcap-el+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xel"
    ]
  },
  "application/xcap-error+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcap-ns+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xns"
    ]
  },
  "application/xcon-conference-info+xml": {
    source: "iana",
    compressible: true
  },
  "application/xcon-conference-info-diff+xml": {
    source: "iana",
    compressible: true
  },
  "application/xenc+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xenc"
    ]
  },
  "application/xhtml+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xhtml",
      "xht"
    ]
  },
  "application/xhtml-voice+xml": {
    source: "apache",
    compressible: true
  },
  "application/xliff+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xlf"
    ]
  },
  "application/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml",
      "xsl",
      "xsd",
      "rng"
    ]
  },
  "application/xml-dtd": {
    source: "iana",
    compressible: true,
    extensions: [
      "dtd"
    ]
  },
  "application/xml-external-parsed-entity": {
    source: "iana"
  },
  "application/xml-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/xmpp+xml": {
    source: "iana",
    compressible: true
  },
  "application/xop+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xop"
    ]
  },
  "application/xproc+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xpl"
    ]
  },
  "application/xslt+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xsl",
      "xslt"
    ]
  },
  "application/xspf+xml": {
    source: "apache",
    compressible: true,
    extensions: [
      "xspf"
    ]
  },
  "application/xv+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "mxml",
      "xhvml",
      "xvml",
      "xvm"
    ]
  },
  "application/yang": {
    source: "iana",
    extensions: [
      "yang"
    ]
  },
  "application/yang-data+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-data+xml": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+json": {
    source: "iana",
    compressible: true
  },
  "application/yang-patch+xml": {
    source: "iana",
    compressible: true
  },
  "application/yin+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "yin"
    ]
  },
  "application/zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "zip"
    ]
  },
  "application/zlib": {
    source: "iana"
  },
  "application/zstd": {
    source: "iana"
  },
  "audio/1d-interleaved-parityfec": {
    source: "iana"
  },
  "audio/32kadpcm": {
    source: "iana"
  },
  "audio/3gpp": {
    source: "iana",
    compressible: false,
    extensions: [
      "3gpp"
    ]
  },
  "audio/3gpp2": {
    source: "iana"
  },
  "audio/aac": {
    source: "iana"
  },
  "audio/ac3": {
    source: "iana"
  },
  "audio/adpcm": {
    source: "apache",
    extensions: [
      "adp"
    ]
  },
  "audio/amr": {
    source: "iana",
    extensions: [
      "amr"
    ]
  },
  "audio/amr-wb": {
    source: "iana"
  },
  "audio/amr-wb+": {
    source: "iana"
  },
  "audio/aptx": {
    source: "iana"
  },
  "audio/asc": {
    source: "iana"
  },
  "audio/atrac-advanced-lossless": {
    source: "iana"
  },
  "audio/atrac-x": {
    source: "iana"
  },
  "audio/atrac3": {
    source: "iana"
  },
  "audio/basic": {
    source: "iana",
    compressible: false,
    extensions: [
      "au",
      "snd"
    ]
  },
  "audio/bv16": {
    source: "iana"
  },
  "audio/bv32": {
    source: "iana"
  },
  "audio/clearmode": {
    source: "iana"
  },
  "audio/cn": {
    source: "iana"
  },
  "audio/dat12": {
    source: "iana"
  },
  "audio/dls": {
    source: "iana"
  },
  "audio/dsr-es201108": {
    source: "iana"
  },
  "audio/dsr-es202050": {
    source: "iana"
  },
  "audio/dsr-es202211": {
    source: "iana"
  },
  "audio/dsr-es202212": {
    source: "iana"
  },
  "audio/dv": {
    source: "iana"
  },
  "audio/dvi4": {
    source: "iana"
  },
  "audio/eac3": {
    source: "iana"
  },
  "audio/encaprtp": {
    source: "iana"
  },
  "audio/evrc": {
    source: "iana"
  },
  "audio/evrc-qcp": {
    source: "iana"
  },
  "audio/evrc0": {
    source: "iana"
  },
  "audio/evrc1": {
    source: "iana"
  },
  "audio/evrcb": {
    source: "iana"
  },
  "audio/evrcb0": {
    source: "iana"
  },
  "audio/evrcb1": {
    source: "iana"
  },
  "audio/evrcnw": {
    source: "iana"
  },
  "audio/evrcnw0": {
    source: "iana"
  },
  "audio/evrcnw1": {
    source: "iana"
  },
  "audio/evrcwb": {
    source: "iana"
  },
  "audio/evrcwb0": {
    source: "iana"
  },
  "audio/evrcwb1": {
    source: "iana"
  },
  "audio/evs": {
    source: "iana"
  },
  "audio/flexfec": {
    source: "iana"
  },
  "audio/fwdred": {
    source: "iana"
  },
  "audio/g711-0": {
    source: "iana"
  },
  "audio/g719": {
    source: "iana"
  },
  "audio/g722": {
    source: "iana"
  },
  "audio/g7221": {
    source: "iana"
  },
  "audio/g723": {
    source: "iana"
  },
  "audio/g726-16": {
    source: "iana"
  },
  "audio/g726-24": {
    source: "iana"
  },
  "audio/g726-32": {
    source: "iana"
  },
  "audio/g726-40": {
    source: "iana"
  },
  "audio/g728": {
    source: "iana"
  },
  "audio/g729": {
    source: "iana"
  },
  "audio/g7291": {
    source: "iana"
  },
  "audio/g729d": {
    source: "iana"
  },
  "audio/g729e": {
    source: "iana"
  },
  "audio/gsm": {
    source: "iana"
  },
  "audio/gsm-efr": {
    source: "iana"
  },
  "audio/gsm-hr-08": {
    source: "iana"
  },
  "audio/ilbc": {
    source: "iana"
  },
  "audio/ip-mr_v2.5": {
    source: "iana"
  },
  "audio/isac": {
    source: "apache"
  },
  "audio/l16": {
    source: "iana"
  },
  "audio/l20": {
    source: "iana"
  },
  "audio/l24": {
    source: "iana",
    compressible: false
  },
  "audio/l8": {
    source: "iana"
  },
  "audio/lpc": {
    source: "iana"
  },
  "audio/melp": {
    source: "iana"
  },
  "audio/melp1200": {
    source: "iana"
  },
  "audio/melp2400": {
    source: "iana"
  },
  "audio/melp600": {
    source: "iana"
  },
  "audio/mhas": {
    source: "iana"
  },
  "audio/midi": {
    source: "apache",
    extensions: [
      "mid",
      "midi",
      "kar",
      "rmi"
    ]
  },
  "audio/mobile-xmf": {
    source: "iana",
    extensions: [
      "mxmf"
    ]
  },
  "audio/mp3": {
    compressible: false,
    extensions: [
      "mp3"
    ]
  },
  "audio/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "m4a",
      "mp4a"
    ]
  },
  "audio/mp4a-latm": {
    source: "iana"
  },
  "audio/mpa": {
    source: "iana"
  },
  "audio/mpa-robust": {
    source: "iana"
  },
  "audio/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpga",
      "mp2",
      "mp2a",
      "mp3",
      "m2a",
      "m3a"
    ]
  },
  "audio/mpeg4-generic": {
    source: "iana"
  },
  "audio/musepack": {
    source: "apache"
  },
  "audio/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "oga",
      "ogg",
      "spx",
      "opus"
    ]
  },
  "audio/opus": {
    source: "iana"
  },
  "audio/parityfec": {
    source: "iana"
  },
  "audio/pcma": {
    source: "iana"
  },
  "audio/pcma-wb": {
    source: "iana"
  },
  "audio/pcmu": {
    source: "iana"
  },
  "audio/pcmu-wb": {
    source: "iana"
  },
  "audio/prs.sid": {
    source: "iana"
  },
  "audio/qcelp": {
    source: "iana"
  },
  "audio/raptorfec": {
    source: "iana"
  },
  "audio/red": {
    source: "iana"
  },
  "audio/rtp-enc-aescm128": {
    source: "iana"
  },
  "audio/rtp-midi": {
    source: "iana"
  },
  "audio/rtploopback": {
    source: "iana"
  },
  "audio/rtx": {
    source: "iana"
  },
  "audio/s3m": {
    source: "apache",
    extensions: [
      "s3m"
    ]
  },
  "audio/scip": {
    source: "iana"
  },
  "audio/silk": {
    source: "apache",
    extensions: [
      "sil"
    ]
  },
  "audio/smv": {
    source: "iana"
  },
  "audio/smv-qcp": {
    source: "iana"
  },
  "audio/smv0": {
    source: "iana"
  },
  "audio/sofa": {
    source: "iana"
  },
  "audio/sp-midi": {
    source: "iana"
  },
  "audio/speex": {
    source: "iana"
  },
  "audio/t140c": {
    source: "iana"
  },
  "audio/t38": {
    source: "iana"
  },
  "audio/telephone-event": {
    source: "iana"
  },
  "audio/tetra_acelp": {
    source: "iana"
  },
  "audio/tetra_acelp_bb": {
    source: "iana"
  },
  "audio/tone": {
    source: "iana"
  },
  "audio/tsvcis": {
    source: "iana"
  },
  "audio/uemclip": {
    source: "iana"
  },
  "audio/ulpfec": {
    source: "iana"
  },
  "audio/usac": {
    source: "iana"
  },
  "audio/vdvi": {
    source: "iana"
  },
  "audio/vmr-wb": {
    source: "iana"
  },
  "audio/vnd.3gpp.iufp": {
    source: "iana"
  },
  "audio/vnd.4sb": {
    source: "iana"
  },
  "audio/vnd.audiokoz": {
    source: "iana"
  },
  "audio/vnd.celp": {
    source: "iana"
  },
  "audio/vnd.cisco.nse": {
    source: "iana"
  },
  "audio/vnd.cmles.radio-events": {
    source: "iana"
  },
  "audio/vnd.cns.anp1": {
    source: "iana"
  },
  "audio/vnd.cns.inf1": {
    source: "iana"
  },
  "audio/vnd.dece.audio": {
    source: "iana",
    extensions: [
      "uva",
      "uvva"
    ]
  },
  "audio/vnd.digital-winds": {
    source: "iana",
    extensions: [
      "eol"
    ]
  },
  "audio/vnd.dlna.adts": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.1": {
    source: "iana"
  },
  "audio/vnd.dolby.heaac.2": {
    source: "iana"
  },
  "audio/vnd.dolby.mlp": {
    source: "iana"
  },
  "audio/vnd.dolby.mps": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2x": {
    source: "iana"
  },
  "audio/vnd.dolby.pl2z": {
    source: "iana"
  },
  "audio/vnd.dolby.pulse.1": {
    source: "iana"
  },
  "audio/vnd.dra": {
    source: "iana",
    extensions: [
      "dra"
    ]
  },
  "audio/vnd.dts": {
    source: "iana",
    extensions: [
      "dts"
    ]
  },
  "audio/vnd.dts.hd": {
    source: "iana",
    extensions: [
      "dtshd"
    ]
  },
  "audio/vnd.dts.uhd": {
    source: "iana"
  },
  "audio/vnd.dvb.file": {
    source: "iana"
  },
  "audio/vnd.everad.plj": {
    source: "iana"
  },
  "audio/vnd.hns.audio": {
    source: "iana"
  },
  "audio/vnd.lucent.voice": {
    source: "iana",
    extensions: [
      "lvp"
    ]
  },
  "audio/vnd.ms-playready.media.pya": {
    source: "iana",
    extensions: [
      "pya"
    ]
  },
  "audio/vnd.nokia.mobile-xmf": {
    source: "iana"
  },
  "audio/vnd.nortel.vbk": {
    source: "iana"
  },
  "audio/vnd.nuera.ecelp4800": {
    source: "iana",
    extensions: [
      "ecelp4800"
    ]
  },
  "audio/vnd.nuera.ecelp7470": {
    source: "iana",
    extensions: [
      "ecelp7470"
    ]
  },
  "audio/vnd.nuera.ecelp9600": {
    source: "iana",
    extensions: [
      "ecelp9600"
    ]
  },
  "audio/vnd.octel.sbc": {
    source: "iana"
  },
  "audio/vnd.presonus.multitrack": {
    source: "iana"
  },
  "audio/vnd.qcelp": {
    source: "iana"
  },
  "audio/vnd.rhetorex.32kadpcm": {
    source: "iana"
  },
  "audio/vnd.rip": {
    source: "iana",
    extensions: [
      "rip"
    ]
  },
  "audio/vnd.rn-realaudio": {
    compressible: false
  },
  "audio/vnd.sealedmedia.softseal.mpeg": {
    source: "iana"
  },
  "audio/vnd.vmx.cvsd": {
    source: "iana"
  },
  "audio/vnd.wave": {
    compressible: false
  },
  "audio/vorbis": {
    source: "iana",
    compressible: false
  },
  "audio/vorbis-config": {
    source: "iana"
  },
  "audio/wav": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/wave": {
    compressible: false,
    extensions: [
      "wav"
    ]
  },
  "audio/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "weba"
    ]
  },
  "audio/x-aac": {
    source: "apache",
    compressible: false,
    extensions: [
      "aac"
    ]
  },
  "audio/x-aiff": {
    source: "apache",
    extensions: [
      "aif",
      "aiff",
      "aifc"
    ]
  },
  "audio/x-caf": {
    source: "apache",
    compressible: false,
    extensions: [
      "caf"
    ]
  },
  "audio/x-flac": {
    source: "apache",
    extensions: [
      "flac"
    ]
  },
  "audio/x-m4a": {
    source: "nginx",
    extensions: [
      "m4a"
    ]
  },
  "audio/x-matroska": {
    source: "apache",
    extensions: [
      "mka"
    ]
  },
  "audio/x-mpegurl": {
    source: "apache",
    extensions: [
      "m3u"
    ]
  },
  "audio/x-ms-wax": {
    source: "apache",
    extensions: [
      "wax"
    ]
  },
  "audio/x-ms-wma": {
    source: "apache",
    extensions: [
      "wma"
    ]
  },
  "audio/x-pn-realaudio": {
    source: "apache",
    extensions: [
      "ram",
      "ra"
    ]
  },
  "audio/x-pn-realaudio-plugin": {
    source: "apache",
    extensions: [
      "rmp"
    ]
  },
  "audio/x-realaudio": {
    source: "nginx",
    extensions: [
      "ra"
    ]
  },
  "audio/x-tta": {
    source: "apache"
  },
  "audio/x-wav": {
    source: "apache",
    extensions: [
      "wav"
    ]
  },
  "audio/xm": {
    source: "apache",
    extensions: [
      "xm"
    ]
  },
  "chemical/x-cdx": {
    source: "apache",
    extensions: [
      "cdx"
    ]
  },
  "chemical/x-cif": {
    source: "apache",
    extensions: [
      "cif"
    ]
  },
  "chemical/x-cmdf": {
    source: "apache",
    extensions: [
      "cmdf"
    ]
  },
  "chemical/x-cml": {
    source: "apache",
    extensions: [
      "cml"
    ]
  },
  "chemical/x-csml": {
    source: "apache",
    extensions: [
      "csml"
    ]
  },
  "chemical/x-pdb": {
    source: "apache"
  },
  "chemical/x-xyz": {
    source: "apache",
    extensions: [
      "xyz"
    ]
  },
  "font/collection": {
    source: "iana",
    extensions: [
      "ttc"
    ]
  },
  "font/otf": {
    source: "iana",
    compressible: true,
    extensions: [
      "otf"
    ]
  },
  "font/sfnt": {
    source: "iana"
  },
  "font/ttf": {
    source: "iana",
    compressible: true,
    extensions: [
      "ttf"
    ]
  },
  "font/woff": {
    source: "iana",
    extensions: [
      "woff"
    ]
  },
  "font/woff2": {
    source: "iana",
    extensions: [
      "woff2"
    ]
  },
  "image/aces": {
    source: "iana",
    extensions: [
      "exr"
    ]
  },
  "image/apng": {
    compressible: false,
    extensions: [
      "apng"
    ]
  },
  "image/avci": {
    source: "iana",
    extensions: [
      "avci"
    ]
  },
  "image/avcs": {
    source: "iana",
    extensions: [
      "avcs"
    ]
  },
  "image/avif": {
    source: "iana",
    compressible: false,
    extensions: [
      "avif"
    ]
  },
  "image/bmp": {
    source: "iana",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/cgm": {
    source: "iana",
    extensions: [
      "cgm"
    ]
  },
  "image/dicom-rle": {
    source: "iana",
    extensions: [
      "drle"
    ]
  },
  "image/emf": {
    source: "iana",
    extensions: [
      "emf"
    ]
  },
  "image/fits": {
    source: "iana",
    extensions: [
      "fits"
    ]
  },
  "image/g3fax": {
    source: "iana",
    extensions: [
      "g3"
    ]
  },
  "image/gif": {
    source: "iana",
    compressible: false,
    extensions: [
      "gif"
    ]
  },
  "image/heic": {
    source: "iana",
    extensions: [
      "heic"
    ]
  },
  "image/heic-sequence": {
    source: "iana",
    extensions: [
      "heics"
    ]
  },
  "image/heif": {
    source: "iana",
    extensions: [
      "heif"
    ]
  },
  "image/heif-sequence": {
    source: "iana",
    extensions: [
      "heifs"
    ]
  },
  "image/hej2k": {
    source: "iana",
    extensions: [
      "hej2"
    ]
  },
  "image/hsj2": {
    source: "iana",
    extensions: [
      "hsj2"
    ]
  },
  "image/ief": {
    source: "iana",
    extensions: [
      "ief"
    ]
  },
  "image/jls": {
    source: "iana",
    extensions: [
      "jls"
    ]
  },
  "image/jp2": {
    source: "iana",
    compressible: false,
    extensions: [
      "jp2",
      "jpg2"
    ]
  },
  "image/jpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpeg",
      "jpg",
      "jpe"
    ]
  },
  "image/jph": {
    source: "iana",
    extensions: [
      "jph"
    ]
  },
  "image/jphc": {
    source: "iana",
    extensions: [
      "jhc"
    ]
  },
  "image/jpm": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpm"
    ]
  },
  "image/jpx": {
    source: "iana",
    compressible: false,
    extensions: [
      "jpx",
      "jpf"
    ]
  },
  "image/jxr": {
    source: "iana",
    extensions: [
      "jxr"
    ]
  },
  "image/jxra": {
    source: "iana",
    extensions: [
      "jxra"
    ]
  },
  "image/jxrs": {
    source: "iana",
    extensions: [
      "jxrs"
    ]
  },
  "image/jxs": {
    source: "iana",
    extensions: [
      "jxs"
    ]
  },
  "image/jxsc": {
    source: "iana",
    extensions: [
      "jxsc"
    ]
  },
  "image/jxsi": {
    source: "iana",
    extensions: [
      "jxsi"
    ]
  },
  "image/jxss": {
    source: "iana",
    extensions: [
      "jxss"
    ]
  },
  "image/ktx": {
    source: "iana",
    extensions: [
      "ktx"
    ]
  },
  "image/ktx2": {
    source: "iana",
    extensions: [
      "ktx2"
    ]
  },
  "image/naplps": {
    source: "iana"
  },
  "image/pjpeg": {
    compressible: false
  },
  "image/png": {
    source: "iana",
    compressible: false,
    extensions: [
      "png"
    ]
  },
  "image/prs.btif": {
    source: "iana",
    extensions: [
      "btif"
    ]
  },
  "image/prs.pti": {
    source: "iana",
    extensions: [
      "pti"
    ]
  },
  "image/pwg-raster": {
    source: "iana"
  },
  "image/sgi": {
    source: "apache",
    extensions: [
      "sgi"
    ]
  },
  "image/svg+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "svg",
      "svgz"
    ]
  },
  "image/t38": {
    source: "iana",
    extensions: [
      "t38"
    ]
  },
  "image/tiff": {
    source: "iana",
    compressible: false,
    extensions: [
      "tif",
      "tiff"
    ]
  },
  "image/tiff-fx": {
    source: "iana",
    extensions: [
      "tfx"
    ]
  },
  "image/vnd.adobe.photoshop": {
    source: "iana",
    compressible: true,
    extensions: [
      "psd"
    ]
  },
  "image/vnd.airzip.accelerator.azv": {
    source: "iana",
    extensions: [
      "azv"
    ]
  },
  "image/vnd.cns.inf2": {
    source: "iana"
  },
  "image/vnd.dece.graphic": {
    source: "iana",
    extensions: [
      "uvi",
      "uvvi",
      "uvg",
      "uvvg"
    ]
  },
  "image/vnd.djvu": {
    source: "iana",
    extensions: [
      "djvu",
      "djv"
    ]
  },
  "image/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "image/vnd.dwg": {
    source: "iana",
    extensions: [
      "dwg"
    ]
  },
  "image/vnd.dxf": {
    source: "iana",
    extensions: [
      "dxf"
    ]
  },
  "image/vnd.fastbidsheet": {
    source: "iana",
    extensions: [
      "fbs"
    ]
  },
  "image/vnd.fpx": {
    source: "iana",
    extensions: [
      "fpx"
    ]
  },
  "image/vnd.fst": {
    source: "iana",
    extensions: [
      "fst"
    ]
  },
  "image/vnd.fujixerox.edmics-mmr": {
    source: "iana",
    extensions: [
      "mmr"
    ]
  },
  "image/vnd.fujixerox.edmics-rlc": {
    source: "iana",
    extensions: [
      "rlc"
    ]
  },
  "image/vnd.globalgraphics.pgb": {
    source: "iana"
  },
  "image/vnd.microsoft.icon": {
    source: "iana",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/vnd.mix": {
    source: "iana"
  },
  "image/vnd.mozilla.apng": {
    source: "iana"
  },
  "image/vnd.ms-dds": {
    compressible: true,
    extensions: [
      "dds"
    ]
  },
  "image/vnd.ms-modi": {
    source: "iana",
    extensions: [
      "mdi"
    ]
  },
  "image/vnd.ms-photo": {
    source: "apache",
    extensions: [
      "wdp"
    ]
  },
  "image/vnd.net-fpx": {
    source: "iana",
    extensions: [
      "npx"
    ]
  },
  "image/vnd.pco.b16": {
    source: "iana",
    extensions: [
      "b16"
    ]
  },
  "image/vnd.radiance": {
    source: "iana"
  },
  "image/vnd.sealed.png": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.gif": {
    source: "iana"
  },
  "image/vnd.sealedmedia.softseal.jpg": {
    source: "iana"
  },
  "image/vnd.svf": {
    source: "iana"
  },
  "image/vnd.tencent.tap": {
    source: "iana",
    extensions: [
      "tap"
    ]
  },
  "image/vnd.valve.source.texture": {
    source: "iana",
    extensions: [
      "vtf"
    ]
  },
  "image/vnd.wap.wbmp": {
    source: "iana",
    extensions: [
      "wbmp"
    ]
  },
  "image/vnd.xiff": {
    source: "iana",
    extensions: [
      "xif"
    ]
  },
  "image/vnd.zbrush.pcx": {
    source: "iana",
    extensions: [
      "pcx"
    ]
  },
  "image/webp": {
    source: "apache",
    extensions: [
      "webp"
    ]
  },
  "image/wmf": {
    source: "iana",
    extensions: [
      "wmf"
    ]
  },
  "image/x-3ds": {
    source: "apache",
    extensions: [
      "3ds"
    ]
  },
  "image/x-cmu-raster": {
    source: "apache",
    extensions: [
      "ras"
    ]
  },
  "image/x-cmx": {
    source: "apache",
    extensions: [
      "cmx"
    ]
  },
  "image/x-freehand": {
    source: "apache",
    extensions: [
      "fh",
      "fhc",
      "fh4",
      "fh5",
      "fh7"
    ]
  },
  "image/x-icon": {
    source: "apache",
    compressible: true,
    extensions: [
      "ico"
    ]
  },
  "image/x-jng": {
    source: "nginx",
    extensions: [
      "jng"
    ]
  },
  "image/x-mrsid-image": {
    source: "apache",
    extensions: [
      "sid"
    ]
  },
  "image/x-ms-bmp": {
    source: "nginx",
    compressible: true,
    extensions: [
      "bmp"
    ]
  },
  "image/x-pcx": {
    source: "apache",
    extensions: [
      "pcx"
    ]
  },
  "image/x-pict": {
    source: "apache",
    extensions: [
      "pic",
      "pct"
    ]
  },
  "image/x-portable-anymap": {
    source: "apache",
    extensions: [
      "pnm"
    ]
  },
  "image/x-portable-bitmap": {
    source: "apache",
    extensions: [
      "pbm"
    ]
  },
  "image/x-portable-graymap": {
    source: "apache",
    extensions: [
      "pgm"
    ]
  },
  "image/x-portable-pixmap": {
    source: "apache",
    extensions: [
      "ppm"
    ]
  },
  "image/x-rgb": {
    source: "apache",
    extensions: [
      "rgb"
    ]
  },
  "image/x-tga": {
    source: "apache",
    extensions: [
      "tga"
    ]
  },
  "image/x-xbitmap": {
    source: "apache",
    extensions: [
      "xbm"
    ]
  },
  "image/x-xcf": {
    compressible: false
  },
  "image/x-xpixmap": {
    source: "apache",
    extensions: [
      "xpm"
    ]
  },
  "image/x-xwindowdump": {
    source: "apache",
    extensions: [
      "xwd"
    ]
  },
  "message/cpim": {
    source: "iana"
  },
  "message/delivery-status": {
    source: "iana"
  },
  "message/disposition-notification": {
    source: "iana",
    extensions: [
      "disposition-notification"
    ]
  },
  "message/external-body": {
    source: "iana"
  },
  "message/feedback-report": {
    source: "iana"
  },
  "message/global": {
    source: "iana",
    extensions: [
      "u8msg"
    ]
  },
  "message/global-delivery-status": {
    source: "iana",
    extensions: [
      "u8dsn"
    ]
  },
  "message/global-disposition-notification": {
    source: "iana",
    extensions: [
      "u8mdn"
    ]
  },
  "message/global-headers": {
    source: "iana",
    extensions: [
      "u8hdr"
    ]
  },
  "message/http": {
    source: "iana",
    compressible: false
  },
  "message/imdn+xml": {
    source: "iana",
    compressible: true
  },
  "message/news": {
    source: "iana"
  },
  "message/partial": {
    source: "iana",
    compressible: false
  },
  "message/rfc822": {
    source: "iana",
    compressible: true,
    extensions: [
      "eml",
      "mime"
    ]
  },
  "message/s-http": {
    source: "iana"
  },
  "message/sip": {
    source: "iana"
  },
  "message/sipfrag": {
    source: "iana"
  },
  "message/tracking-status": {
    source: "iana"
  },
  "message/vnd.si.simp": {
    source: "iana"
  },
  "message/vnd.wfa.wsc": {
    source: "iana",
    extensions: [
      "wsc"
    ]
  },
  "model/3mf": {
    source: "iana",
    extensions: [
      "3mf"
    ]
  },
  "model/e57": {
    source: "iana"
  },
  "model/gltf+json": {
    source: "iana",
    compressible: true,
    extensions: [
      "gltf"
    ]
  },
  "model/gltf-binary": {
    source: "iana",
    compressible: true,
    extensions: [
      "glb"
    ]
  },
  "model/iges": {
    source: "iana",
    compressible: false,
    extensions: [
      "igs",
      "iges"
    ]
  },
  "model/mesh": {
    source: "iana",
    compressible: false,
    extensions: [
      "msh",
      "mesh",
      "silo"
    ]
  },
  "model/mtl": {
    source: "iana",
    extensions: [
      "mtl"
    ]
  },
  "model/obj": {
    source: "iana",
    extensions: [
      "obj"
    ]
  },
  "model/step": {
    source: "iana"
  },
  "model/step+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "stpx"
    ]
  },
  "model/step+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpz"
    ]
  },
  "model/step-xml+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "stpxz"
    ]
  },
  "model/stl": {
    source: "iana",
    extensions: [
      "stl"
    ]
  },
  "model/vnd.collada+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "dae"
    ]
  },
  "model/vnd.dwf": {
    source: "iana",
    extensions: [
      "dwf"
    ]
  },
  "model/vnd.flatland.3dml": {
    source: "iana"
  },
  "model/vnd.gdl": {
    source: "iana",
    extensions: [
      "gdl"
    ]
  },
  "model/vnd.gs-gdl": {
    source: "apache"
  },
  "model/vnd.gs.gdl": {
    source: "iana"
  },
  "model/vnd.gtw": {
    source: "iana",
    extensions: [
      "gtw"
    ]
  },
  "model/vnd.moml+xml": {
    source: "iana",
    compressible: true
  },
  "model/vnd.mts": {
    source: "iana",
    extensions: [
      "mts"
    ]
  },
  "model/vnd.opengex": {
    source: "iana",
    extensions: [
      "ogex"
    ]
  },
  "model/vnd.parasolid.transmit.binary": {
    source: "iana",
    extensions: [
      "x_b"
    ]
  },
  "model/vnd.parasolid.transmit.text": {
    source: "iana",
    extensions: [
      "x_t"
    ]
  },
  "model/vnd.pytha.pyox": {
    source: "iana"
  },
  "model/vnd.rosette.annotated-data-model": {
    source: "iana"
  },
  "model/vnd.sap.vds": {
    source: "iana",
    extensions: [
      "vds"
    ]
  },
  "model/vnd.usdz+zip": {
    source: "iana",
    compressible: false,
    extensions: [
      "usdz"
    ]
  },
  "model/vnd.valve.source.compiled-map": {
    source: "iana",
    extensions: [
      "bsp"
    ]
  },
  "model/vnd.vtu": {
    source: "iana",
    extensions: [
      "vtu"
    ]
  },
  "model/vrml": {
    source: "iana",
    compressible: false,
    extensions: [
      "wrl",
      "vrml"
    ]
  },
  "model/x3d+binary": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3db",
      "x3dbz"
    ]
  },
  "model/x3d+fastinfoset": {
    source: "iana",
    extensions: [
      "x3db"
    ]
  },
  "model/x3d+vrml": {
    source: "apache",
    compressible: false,
    extensions: [
      "x3dv",
      "x3dvz"
    ]
  },
  "model/x3d+xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "x3d",
      "x3dz"
    ]
  },
  "model/x3d-vrml": {
    source: "iana",
    extensions: [
      "x3dv"
    ]
  },
  "multipart/alternative": {
    source: "iana",
    compressible: false
  },
  "multipart/appledouble": {
    source: "iana"
  },
  "multipart/byteranges": {
    source: "iana"
  },
  "multipart/digest": {
    source: "iana"
  },
  "multipart/encrypted": {
    source: "iana",
    compressible: false
  },
  "multipart/form-data": {
    source: "iana",
    compressible: false
  },
  "multipart/header-set": {
    source: "iana"
  },
  "multipart/mixed": {
    source: "iana"
  },
  "multipart/multilingual": {
    source: "iana"
  },
  "multipart/parallel": {
    source: "iana"
  },
  "multipart/related": {
    source: "iana",
    compressible: false
  },
  "multipart/report": {
    source: "iana"
  },
  "multipart/signed": {
    source: "iana",
    compressible: false
  },
  "multipart/vnd.bint.med-plus": {
    source: "iana"
  },
  "multipart/voice-message": {
    source: "iana"
  },
  "multipart/x-mixed-replace": {
    source: "iana"
  },
  "text/1d-interleaved-parityfec": {
    source: "iana"
  },
  "text/cache-manifest": {
    source: "iana",
    compressible: true,
    extensions: [
      "appcache",
      "manifest"
    ]
  },
  "text/calendar": {
    source: "iana",
    extensions: [
      "ics",
      "ifb"
    ]
  },
  "text/calender": {
    compressible: true
  },
  "text/cmd": {
    compressible: true
  },
  "text/coffeescript": {
    extensions: [
      "coffee",
      "litcoffee"
    ]
  },
  "text/cql": {
    source: "iana"
  },
  "text/cql-expression": {
    source: "iana"
  },
  "text/cql-identifier": {
    source: "iana"
  },
  "text/css": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "css"
    ]
  },
  "text/csv": {
    source: "iana",
    compressible: true,
    extensions: [
      "csv"
    ]
  },
  "text/csv-schema": {
    source: "iana"
  },
  "text/directory": {
    source: "iana"
  },
  "text/dns": {
    source: "iana"
  },
  "text/ecmascript": {
    source: "iana"
  },
  "text/encaprtp": {
    source: "iana"
  },
  "text/enriched": {
    source: "iana"
  },
  "text/fhirpath": {
    source: "iana"
  },
  "text/flexfec": {
    source: "iana"
  },
  "text/fwdred": {
    source: "iana"
  },
  "text/gff3": {
    source: "iana"
  },
  "text/grammar-ref-list": {
    source: "iana"
  },
  "text/html": {
    source: "iana",
    compressible: true,
    extensions: [
      "html",
      "htm",
      "shtml"
    ]
  },
  "text/jade": {
    extensions: [
      "jade"
    ]
  },
  "text/javascript": {
    source: "iana",
    compressible: true
  },
  "text/jcr-cnd": {
    source: "iana"
  },
  "text/jsx": {
    compressible: true,
    extensions: [
      "jsx"
    ]
  },
  "text/less": {
    compressible: true,
    extensions: [
      "less"
    ]
  },
  "text/markdown": {
    source: "iana",
    compressible: true,
    extensions: [
      "markdown",
      "md"
    ]
  },
  "text/mathml": {
    source: "nginx",
    extensions: [
      "mml"
    ]
  },
  "text/mdx": {
    compressible: true,
    extensions: [
      "mdx"
    ]
  },
  "text/mizar": {
    source: "iana"
  },
  "text/n3": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "n3"
    ]
  },
  "text/parameters": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/parityfec": {
    source: "iana"
  },
  "text/plain": {
    source: "iana",
    compressible: true,
    extensions: [
      "txt",
      "text",
      "conf",
      "def",
      "list",
      "log",
      "in",
      "ini"
    ]
  },
  "text/provenance-notation": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/prs.fallenstein.rst": {
    source: "iana"
  },
  "text/prs.lines.tag": {
    source: "iana",
    extensions: [
      "dsc"
    ]
  },
  "text/prs.prop.logic": {
    source: "iana"
  },
  "text/raptorfec": {
    source: "iana"
  },
  "text/red": {
    source: "iana"
  },
  "text/rfc822-headers": {
    source: "iana"
  },
  "text/richtext": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtx"
    ]
  },
  "text/rtf": {
    source: "iana",
    compressible: true,
    extensions: [
      "rtf"
    ]
  },
  "text/rtp-enc-aescm128": {
    source: "iana"
  },
  "text/rtploopback": {
    source: "iana"
  },
  "text/rtx": {
    source: "iana"
  },
  "text/sgml": {
    source: "iana",
    extensions: [
      "sgml",
      "sgm"
    ]
  },
  "text/shaclc": {
    source: "iana"
  },
  "text/shex": {
    source: "iana",
    extensions: [
      "shex"
    ]
  },
  "text/slim": {
    extensions: [
      "slim",
      "slm"
    ]
  },
  "text/spdx": {
    source: "iana",
    extensions: [
      "spdx"
    ]
  },
  "text/strings": {
    source: "iana"
  },
  "text/stylus": {
    extensions: [
      "stylus",
      "styl"
    ]
  },
  "text/t140": {
    source: "iana"
  },
  "text/tab-separated-values": {
    source: "iana",
    compressible: true,
    extensions: [
      "tsv"
    ]
  },
  "text/troff": {
    source: "iana",
    extensions: [
      "t",
      "tr",
      "roff",
      "man",
      "me",
      "ms"
    ]
  },
  "text/turtle": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "ttl"
    ]
  },
  "text/ulpfec": {
    source: "iana"
  },
  "text/uri-list": {
    source: "iana",
    compressible: true,
    extensions: [
      "uri",
      "uris",
      "urls"
    ]
  },
  "text/vcard": {
    source: "iana",
    compressible: true,
    extensions: [
      "vcard"
    ]
  },
  "text/vnd.a": {
    source: "iana"
  },
  "text/vnd.abc": {
    source: "iana"
  },
  "text/vnd.ascii-art": {
    source: "iana"
  },
  "text/vnd.curl": {
    source: "iana",
    extensions: [
      "curl"
    ]
  },
  "text/vnd.curl.dcurl": {
    source: "apache",
    extensions: [
      "dcurl"
    ]
  },
  "text/vnd.curl.mcurl": {
    source: "apache",
    extensions: [
      "mcurl"
    ]
  },
  "text/vnd.curl.scurl": {
    source: "apache",
    extensions: [
      "scurl"
    ]
  },
  "text/vnd.debian.copyright": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.dmclientscript": {
    source: "iana"
  },
  "text/vnd.dvb.subtitle": {
    source: "iana",
    extensions: [
      "sub"
    ]
  },
  "text/vnd.esmertec.theme-descriptor": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.familysearch.gedcom": {
    source: "iana",
    extensions: [
      "ged"
    ]
  },
  "text/vnd.ficlab.flt": {
    source: "iana"
  },
  "text/vnd.fly": {
    source: "iana",
    extensions: [
      "fly"
    ]
  },
  "text/vnd.fmi.flexstor": {
    source: "iana",
    extensions: [
      "flx"
    ]
  },
  "text/vnd.gml": {
    source: "iana"
  },
  "text/vnd.graphviz": {
    source: "iana",
    extensions: [
      "gv"
    ]
  },
  "text/vnd.hans": {
    source: "iana"
  },
  "text/vnd.hgl": {
    source: "iana"
  },
  "text/vnd.in3d.3dml": {
    source: "iana",
    extensions: [
      "3dml"
    ]
  },
  "text/vnd.in3d.spot": {
    source: "iana",
    extensions: [
      "spot"
    ]
  },
  "text/vnd.iptc.newsml": {
    source: "iana"
  },
  "text/vnd.iptc.nitf": {
    source: "iana"
  },
  "text/vnd.latex-z": {
    source: "iana"
  },
  "text/vnd.motorola.reflex": {
    source: "iana"
  },
  "text/vnd.ms-mediapackage": {
    source: "iana"
  },
  "text/vnd.net2phone.commcenter.command": {
    source: "iana"
  },
  "text/vnd.radisys.msml-basic-layout": {
    source: "iana"
  },
  "text/vnd.senx.warpscript": {
    source: "iana"
  },
  "text/vnd.si.uricatalogue": {
    source: "iana"
  },
  "text/vnd.sosi": {
    source: "iana"
  },
  "text/vnd.sun.j2me.app-descriptor": {
    source: "iana",
    charset: "UTF-8",
    extensions: [
      "jad"
    ]
  },
  "text/vnd.trolltech.linguist": {
    source: "iana",
    charset: "UTF-8"
  },
  "text/vnd.wap.si": {
    source: "iana"
  },
  "text/vnd.wap.sl": {
    source: "iana"
  },
  "text/vnd.wap.wml": {
    source: "iana",
    extensions: [
      "wml"
    ]
  },
  "text/vnd.wap.wmlscript": {
    source: "iana",
    extensions: [
      "wmls"
    ]
  },
  "text/vtt": {
    source: "iana",
    charset: "UTF-8",
    compressible: true,
    extensions: [
      "vtt"
    ]
  },
  "text/x-asm": {
    source: "apache",
    extensions: [
      "s",
      "asm"
    ]
  },
  "text/x-c": {
    source: "apache",
    extensions: [
      "c",
      "cc",
      "cxx",
      "cpp",
      "h",
      "hh",
      "dic"
    ]
  },
  "text/x-component": {
    source: "nginx",
    extensions: [
      "htc"
    ]
  },
  "text/x-fortran": {
    source: "apache",
    extensions: [
      "f",
      "for",
      "f77",
      "f90"
    ]
  },
  "text/x-gwt-rpc": {
    compressible: true
  },
  "text/x-handlebars-template": {
    extensions: [
      "hbs"
    ]
  },
  "text/x-java-source": {
    source: "apache",
    extensions: [
      "java"
    ]
  },
  "text/x-jquery-tmpl": {
    compressible: true
  },
  "text/x-lua": {
    extensions: [
      "lua"
    ]
  },
  "text/x-markdown": {
    compressible: true,
    extensions: [
      "mkd"
    ]
  },
  "text/x-nfo": {
    source: "apache",
    extensions: [
      "nfo"
    ]
  },
  "text/x-opml": {
    source: "apache",
    extensions: [
      "opml"
    ]
  },
  "text/x-org": {
    compressible: true,
    extensions: [
      "org"
    ]
  },
  "text/x-pascal": {
    source: "apache",
    extensions: [
      "p",
      "pas"
    ]
  },
  "text/x-processing": {
    compressible: true,
    extensions: [
      "pde"
    ]
  },
  "text/x-sass": {
    extensions: [
      "sass"
    ]
  },
  "text/x-scss": {
    extensions: [
      "scss"
    ]
  },
  "text/x-setext": {
    source: "apache",
    extensions: [
      "etx"
    ]
  },
  "text/x-sfv": {
    source: "apache",
    extensions: [
      "sfv"
    ]
  },
  "text/x-suse-ymp": {
    compressible: true,
    extensions: [
      "ymp"
    ]
  },
  "text/x-uuencode": {
    source: "apache",
    extensions: [
      "uu"
    ]
  },
  "text/x-vcalendar": {
    source: "apache",
    extensions: [
      "vcs"
    ]
  },
  "text/x-vcard": {
    source: "apache",
    extensions: [
      "vcf"
    ]
  },
  "text/xml": {
    source: "iana",
    compressible: true,
    extensions: [
      "xml"
    ]
  },
  "text/xml-external-parsed-entity": {
    source: "iana"
  },
  "text/yaml": {
    compressible: true,
    extensions: [
      "yaml",
      "yml"
    ]
  },
  "video/1d-interleaved-parityfec": {
    source: "iana"
  },
  "video/3gpp": {
    source: "iana",
    extensions: [
      "3gp",
      "3gpp"
    ]
  },
  "video/3gpp-tt": {
    source: "iana"
  },
  "video/3gpp2": {
    source: "iana",
    extensions: [
      "3g2"
    ]
  },
  "video/av1": {
    source: "iana"
  },
  "video/bmpeg": {
    source: "iana"
  },
  "video/bt656": {
    source: "iana"
  },
  "video/celb": {
    source: "iana"
  },
  "video/dv": {
    source: "iana"
  },
  "video/encaprtp": {
    source: "iana"
  },
  "video/ffv1": {
    source: "iana"
  },
  "video/flexfec": {
    source: "iana"
  },
  "video/h261": {
    source: "iana",
    extensions: [
      "h261"
    ]
  },
  "video/h263": {
    source: "iana",
    extensions: [
      "h263"
    ]
  },
  "video/h263-1998": {
    source: "iana"
  },
  "video/h263-2000": {
    source: "iana"
  },
  "video/h264": {
    source: "iana",
    extensions: [
      "h264"
    ]
  },
  "video/h264-rcdo": {
    source: "iana"
  },
  "video/h264-svc": {
    source: "iana"
  },
  "video/h265": {
    source: "iana"
  },
  "video/iso.segment": {
    source: "iana",
    extensions: [
      "m4s"
    ]
  },
  "video/jpeg": {
    source: "iana",
    extensions: [
      "jpgv"
    ]
  },
  "video/jpeg2000": {
    source: "iana"
  },
  "video/jpm": {
    source: "apache",
    extensions: [
      "jpm",
      "jpgm"
    ]
  },
  "video/jxsv": {
    source: "iana"
  },
  "video/mj2": {
    source: "iana",
    extensions: [
      "mj2",
      "mjp2"
    ]
  },
  "video/mp1s": {
    source: "iana"
  },
  "video/mp2p": {
    source: "iana"
  },
  "video/mp2t": {
    source: "iana",
    extensions: [
      "ts"
    ]
  },
  "video/mp4": {
    source: "iana",
    compressible: false,
    extensions: [
      "mp4",
      "mp4v",
      "mpg4"
    ]
  },
  "video/mp4v-es": {
    source: "iana"
  },
  "video/mpeg": {
    source: "iana",
    compressible: false,
    extensions: [
      "mpeg",
      "mpg",
      "mpe",
      "m1v",
      "m2v"
    ]
  },
  "video/mpeg4-generic": {
    source: "iana"
  },
  "video/mpv": {
    source: "iana"
  },
  "video/nv": {
    source: "iana"
  },
  "video/ogg": {
    source: "iana",
    compressible: false,
    extensions: [
      "ogv"
    ]
  },
  "video/parityfec": {
    source: "iana"
  },
  "video/pointer": {
    source: "iana"
  },
  "video/quicktime": {
    source: "iana",
    compressible: false,
    extensions: [
      "qt",
      "mov"
    ]
  },
  "video/raptorfec": {
    source: "iana"
  },
  "video/raw": {
    source: "iana"
  },
  "video/rtp-enc-aescm128": {
    source: "iana"
  },
  "video/rtploopback": {
    source: "iana"
  },
  "video/rtx": {
    source: "iana"
  },
  "video/scip": {
    source: "iana"
  },
  "video/smpte291": {
    source: "iana"
  },
  "video/smpte292m": {
    source: "iana"
  },
  "video/ulpfec": {
    source: "iana"
  },
  "video/vc1": {
    source: "iana"
  },
  "video/vc2": {
    source: "iana"
  },
  "video/vnd.cctv": {
    source: "iana"
  },
  "video/vnd.dece.hd": {
    source: "iana",
    extensions: [
      "uvh",
      "uvvh"
    ]
  },
  "video/vnd.dece.mobile": {
    source: "iana",
    extensions: [
      "uvm",
      "uvvm"
    ]
  },
  "video/vnd.dece.mp4": {
    source: "iana"
  },
  "video/vnd.dece.pd": {
    source: "iana",
    extensions: [
      "uvp",
      "uvvp"
    ]
  },
  "video/vnd.dece.sd": {
    source: "iana",
    extensions: [
      "uvs",
      "uvvs"
    ]
  },
  "video/vnd.dece.video": {
    source: "iana",
    extensions: [
      "uvv",
      "uvvv"
    ]
  },
  "video/vnd.directv.mpeg": {
    source: "iana"
  },
  "video/vnd.directv.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dlna.mpeg-tts": {
    source: "iana"
  },
  "video/vnd.dvb.file": {
    source: "iana",
    extensions: [
      "dvb"
    ]
  },
  "video/vnd.fvt": {
    source: "iana",
    extensions: [
      "fvt"
    ]
  },
  "video/vnd.hns.video": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.1dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-1010": {
    source: "iana"
  },
  "video/vnd.iptvforum.2dparityfec-2005": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsavc": {
    source: "iana"
  },
  "video/vnd.iptvforum.ttsmpeg2": {
    source: "iana"
  },
  "video/vnd.motorola.video": {
    source: "iana"
  },
  "video/vnd.motorola.videop": {
    source: "iana"
  },
  "video/vnd.mpegurl": {
    source: "iana",
    extensions: [
      "mxu",
      "m4u"
    ]
  },
  "video/vnd.ms-playready.media.pyv": {
    source: "iana",
    extensions: [
      "pyv"
    ]
  },
  "video/vnd.nokia.interleaved-multimedia": {
    source: "iana"
  },
  "video/vnd.nokia.mp4vr": {
    source: "iana"
  },
  "video/vnd.nokia.videovoip": {
    source: "iana"
  },
  "video/vnd.objectvideo": {
    source: "iana"
  },
  "video/vnd.radgamettools.bink": {
    source: "iana"
  },
  "video/vnd.radgamettools.smacker": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg1": {
    source: "iana"
  },
  "video/vnd.sealed.mpeg4": {
    source: "iana"
  },
  "video/vnd.sealed.swf": {
    source: "iana"
  },
  "video/vnd.sealedmedia.softseal.mov": {
    source: "iana"
  },
  "video/vnd.uvvu.mp4": {
    source: "iana",
    extensions: [
      "uvu",
      "uvvu"
    ]
  },
  "video/vnd.vivo": {
    source: "iana",
    extensions: [
      "viv"
    ]
  },
  "video/vnd.youtube.yt": {
    source: "iana"
  },
  "video/vp8": {
    source: "iana"
  },
  "video/vp9": {
    source: "iana"
  },
  "video/webm": {
    source: "apache",
    compressible: false,
    extensions: [
      "webm"
    ]
  },
  "video/x-f4v": {
    source: "apache",
    extensions: [
      "f4v"
    ]
  },
  "video/x-fli": {
    source: "apache",
    extensions: [
      "fli"
    ]
  },
  "video/x-flv": {
    source: "apache",
    compressible: false,
    extensions: [
      "flv"
    ]
  },
  "video/x-m4v": {
    source: "apache",
    extensions: [
      "m4v"
    ]
  },
  "video/x-matroska": {
    source: "apache",
    compressible: false,
    extensions: [
      "mkv",
      "mk3d",
      "mks"
    ]
  },
  "video/x-mng": {
    source: "apache",
    extensions: [
      "mng"
    ]
  },
  "video/x-ms-asf": {
    source: "apache",
    extensions: [
      "asf",
      "asx"
    ]
  },
  "video/x-ms-vob": {
    source: "apache",
    extensions: [
      "vob"
    ]
  },
  "video/x-ms-wm": {
    source: "apache",
    extensions: [
      "wm"
    ]
  },
  "video/x-ms-wmv": {
    source: "apache",
    compressible: false,
    extensions: [
      "wmv"
    ]
  },
  "video/x-ms-wmx": {
    source: "apache",
    extensions: [
      "wmx"
    ]
  },
  "video/x-ms-wvx": {
    source: "apache",
    extensions: [
      "wvx"
    ]
  },
  "video/x-msvideo": {
    source: "apache",
    extensions: [
      "avi"
    ]
  },
  "video/x-sgi-movie": {
    source: "apache",
    extensions: [
      "movie"
    ]
  },
  "video/x-smv": {
    source: "apache",
    extensions: [
      "smv"
    ]
  },
  "x-conference/x-cooltalk": {
    source: "apache",
    extensions: [
      "ice"
    ]
  },
  "x-shader/x-fragment": {
    compressible: true
  },
  "x-shader/x-vertex": {
    compressible: true
  }
};
var mimeDb = require$$0;
(function(exports) {
  var db = mimeDb;
  var extname = import_path.default.extname;
  var EXTRACT_TYPE_REGEXP = /^\s*([^;\s]*)(?:;|\s|$)/;
  var TEXT_TYPE_REGEXP = /^text\//i;
  exports.charset = charset;
  exports.charsets = { lookup: charset };
  exports.contentType = contentType2;
  exports.extension = extension;
  exports.extensions = /* @__PURE__ */ Object.create(null);
  exports.lookup = lookup;
  exports.types = /* @__PURE__ */ Object.create(null);
  populateMaps(exports.extensions, exports.types);
  function charset(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var mime2 = match && db[match[1].toLowerCase()];
    if (mime2 && mime2.charset) {
      return mime2.charset;
    }
    if (match && TEXT_TYPE_REGEXP.test(match[1])) {
      return "UTF-8";
    }
    return false;
  }
  function contentType2(str) {
    if (!str || typeof str !== "string") {
      return false;
    }
    var mime2 = str.indexOf("/") === -1 ? exports.lookup(str) : str;
    if (!mime2) {
      return false;
    }
    if (mime2.indexOf("charset") === -1) {
      var charset2 = exports.charset(mime2);
      if (charset2)
        mime2 += "; charset=" + charset2.toLowerCase();
    }
    return mime2;
  }
  function extension(type2) {
    if (!type2 || typeof type2 !== "string") {
      return false;
    }
    var match = EXTRACT_TYPE_REGEXP.exec(type2);
    var exts = match && exports.extensions[match[1].toLowerCase()];
    if (!exts || !exts.length) {
      return false;
    }
    return exts[0];
  }
  function lookup(path2) {
    if (!path2 || typeof path2 !== "string") {
      return false;
    }
    var extension2 = extname("x." + path2).toLowerCase().substr(1);
    if (!extension2) {
      return false;
    }
    return exports.types[extension2] || false;
  }
  function populateMaps(extensions, types) {
    var preference = ["nginx", "apache", void 0, "iana"];
    Object.keys(db).forEach(function forEachMimeType(type2) {
      var mime2 = db[type2];
      var exts = mime2.extensions;
      if (!exts || !exts.length) {
        return;
      }
      extensions[type2] = exts;
      for (var i = 0; i < exts.length; i++) {
        var extension2 = exts[i];
        if (types[extension2]) {
          var from = preference.indexOf(db[types[extension2]].source);
          var to = preference.indexOf(mime2.source);
          if (types[extension2] !== "application/octet-stream" && (from > to || from === to && types[extension2].substr(0, 12) === "application/")) {
            continue;
          }
        }
        types[extension2] = type2;
      }
    });
  }
})(mimeTypes);
var defer_1 = defer$1;
function defer$1(fn) {
  var nextTick = typeof setImmediate == "function" ? setImmediate : typeof process == "object" && typeof process.nextTick == "function" ? process.nextTick : null;
  if (nextTick) {
    nextTick(fn);
  } else {
    setTimeout(fn, 0);
  }
}
var defer = defer_1;
var async_1 = async$2;
function async$2(callback) {
  var isAsync = false;
  defer(function() {
    isAsync = true;
  });
  return function async_callback(err, result) {
    if (isAsync) {
      callback(err, result);
    } else {
      defer(function nextTick_callback() {
        callback(err, result);
      });
    }
  };
}
var abort_1 = abort$2;
function abort$2(state2) {
  Object.keys(state2.jobs).forEach(clean.bind(state2));
  state2.jobs = {};
}
function clean(key) {
  if (typeof this.jobs[key] == "function") {
    this.jobs[key]();
  }
}
var async$1 = async_1;
var abort$1 = abort_1;
var iterate_1 = iterate$2;
function iterate$2(list, iterator, state2, callback) {
  var key = state2["keyedList"] ? state2["keyedList"][state2.index] : state2.index;
  state2.jobs[key] = runJob(iterator, key, list[key], function(error, output) {
    if (!(key in state2.jobs)) {
      return;
    }
    delete state2.jobs[key];
    if (error) {
      abort$1(state2);
    } else {
      state2.results[key] = output;
    }
    callback(error, state2.results);
  });
}
function runJob(iterator, key, item, callback) {
  var aborter;
  if (iterator.length == 2) {
    aborter = iterator(item, async$1(callback));
  } else {
    aborter = iterator(item, key, async$1(callback));
  }
  return aborter;
}
var state_1 = state;
function state(list, sortMethod) {
  var isNamedList = !Array.isArray(list), initState2 = {
    index: 0,
    keyedList: isNamedList || sortMethod ? Object.keys(list) : null,
    jobs: {},
    results: isNamedList ? {} : [],
    size: isNamedList ? Object.keys(list).length : list.length
  };
  if (sortMethod) {
    initState2.keyedList.sort(isNamedList ? sortMethod : function(a, b) {
      return sortMethod(list[a], list[b]);
    });
  }
  return initState2;
}
var abort = abort_1;
var async = async_1;
var terminator_1 = terminator$2;
function terminator$2(callback) {
  if (!Object.keys(this.jobs).length) {
    return;
  }
  this.index = this.size;
  abort(this);
  async(callback)(null, this.results);
}
var iterate$1 = iterate_1;
var initState$1 = state_1;
var terminator$1 = terminator_1;
var parallel_1 = parallel;
function parallel(list, iterator, callback) {
  var state2 = initState$1(list);
  while (state2.index < (state2["keyedList"] || list).length) {
    iterate$1(list, iterator, state2, function(error, result) {
      if (error) {
        callback(error, result);
        return;
      }
      if (Object.keys(state2.jobs).length === 0) {
        callback(null, state2.results);
        return;
      }
    });
    state2.index++;
  }
  return terminator$1.bind(state2, callback);
}
var serialOrdered$2 = { exports: {} };
var iterate = iterate_1;
var initState = state_1;
var terminator = terminator_1;
serialOrdered$2.exports = serialOrdered$1;
serialOrdered$2.exports.ascending = ascending;
serialOrdered$2.exports.descending = descending;
function serialOrdered$1(list, iterator, sortMethod, callback) {
  var state2 = initState(list, sortMethod);
  iterate(list, iterator, state2, function iteratorHandler(error, result) {
    if (error) {
      callback(error, result);
      return;
    }
    state2.index++;
    if (state2.index < (state2["keyedList"] || list).length) {
      iterate(list, iterator, state2, iteratorHandler);
      return;
    }
    callback(null, state2.results);
  });
  return terminator.bind(state2, callback);
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function descending(a, b) {
  return -1 * ascending(a, b);
}
var serialOrderedExports = serialOrdered$2.exports;
var serialOrdered = serialOrderedExports;
var serial_1 = serial;
function serial(list, iterator, callback) {
  return serialOrdered(list, iterator, null, callback);
}
var asynckit$1 = {
  parallel: parallel_1,
  serial: serial_1,
  serialOrdered: serialOrderedExports
};
var populate$1 = function(dst, src2) {
  Object.keys(src2).forEach(function(prop) {
    dst[prop] = dst[prop] || src2[prop];
  });
  return dst;
};
var CombinedStream = combined_stream;
var util = import_util.default;
var path = import_path.default;
var http = import_http.default;
var https = import_https.default;
var parseUrl = import_url.default.parse;
var fs = import_fs.default;
var Stream = import_stream.default.Stream;
var mime = mimeTypes;
var asynckit = asynckit$1;
var populate = populate$1;
var form_data = FormData;
util.inherits(FormData, CombinedStream);
function FormData(options2) {
  if (!(this instanceof FormData)) {
    return new FormData(options2);
  }
  this._overheadLength = 0;
  this._valueLength = 0;
  this._valuesToMeasure = [];
  CombinedStream.call(this);
  options2 = options2 || {};
  for (var option in options2) {
    this[option] = options2[option];
  }
}
FormData.LINE_BREAK = "\r\n";
FormData.DEFAULT_CONTENT_TYPE = "application/octet-stream";
FormData.prototype.append = function(field, value, options2) {
  options2 = options2 || {};
  if (typeof options2 == "string") {
    options2 = { filename: options2 };
  }
  var append = CombinedStream.prototype.append.bind(this);
  if (typeof value == "number") {
    value = "" + value;
  }
  if (util.isArray(value)) {
    this._error(new Error("Arrays are not supported."));
    return;
  }
  var header = this._multiPartHeader(field, value, options2);
  var footer = this._multiPartFooter();
  append(header);
  append(value);
  append(footer);
  this._trackLength(header, value, options2);
};
FormData.prototype._trackLength = function(header, value, options2) {
  var valueLength = 0;
  if (options2.knownLength != null) {
    valueLength += +options2.knownLength;
  } else if (Buffer.isBuffer(value)) {
    valueLength = value.length;
  } else if (typeof value === "string") {
    valueLength = Buffer.byteLength(value);
  }
  this._valueLength += valueLength;
  this._overheadLength += Buffer.byteLength(header) + FormData.LINE_BREAK.length;
  if (!value || !value.path && !(value.readable && value.hasOwnProperty("httpVersion")) && !(value instanceof Stream)) {
    return;
  }
  if (!options2.knownLength) {
    this._valuesToMeasure.push(value);
  }
};
FormData.prototype._lengthRetriever = function(value, callback) {
  if (value.hasOwnProperty("fd")) {
    if (value.end != void 0 && value.end != Infinity && value.start != void 0) {
      callback(null, value.end + 1 - (value.start ? value.start : 0));
    } else {
      fs.stat(value.path, function(err, stat) {
        var fileSize;
        if (err) {
          callback(err);
          return;
        }
        fileSize = stat.size - (value.start ? value.start : 0);
        callback(null, fileSize);
      });
    }
  } else if (value.hasOwnProperty("httpVersion")) {
    callback(null, +value.headers["content-length"]);
  } else if (value.hasOwnProperty("httpModule")) {
    value.on("response", function(response) {
      value.pause();
      callback(null, +response.headers["content-length"]);
    });
    value.resume();
  } else {
    callback("Unknown stream");
  }
};
FormData.prototype._multiPartHeader = function(field, value, options2) {
  if (typeof options2.header == "string") {
    return options2.header;
  }
  var contentDisposition = this._getContentDisposition(value, options2);
  var contentType2 = this._getContentType(value, options2);
  var contents = "";
  var headers = {
    // add custom disposition as third element or keep it two elements if not
    "Content-Disposition": ["form-data", 'name="' + field + '"'].concat(contentDisposition || []),
    // if no content type. allow it to be empty array
    "Content-Type": [].concat(contentType2 || [])
  };
  if (typeof options2.header == "object") {
    populate(headers, options2.header);
  }
  var header;
  for (var prop in headers) {
    if (!headers.hasOwnProperty(prop))
      continue;
    header = headers[prop];
    if (header == null) {
      continue;
    }
    if (!Array.isArray(header)) {
      header = [header];
    }
    if (header.length) {
      contents += prop + ": " + header.join("; ") + FormData.LINE_BREAK;
    }
  }
  return "--" + this.getBoundary() + FormData.LINE_BREAK + contents + FormData.LINE_BREAK;
};
FormData.prototype._getContentDisposition = function(value, options2) {
  var filename, contentDisposition;
  if (typeof options2.filepath === "string") {
    filename = path.normalize(options2.filepath).replace(/\\/g, "/");
  } else if (options2.filename || value.name || value.path) {
    filename = path.basename(options2.filename || value.name || value.path);
  } else if (value.readable && value.hasOwnProperty("httpVersion")) {
    filename = path.basename(value.client._httpMessage.path || "");
  }
  if (filename) {
    contentDisposition = 'filename="' + filename + '"';
  }
  return contentDisposition;
};
FormData.prototype._getContentType = function(value, options2) {
  var contentType2 = options2.contentType;
  if (!contentType2 && value.name) {
    contentType2 = mime.lookup(value.name);
  }
  if (!contentType2 && value.path) {
    contentType2 = mime.lookup(value.path);
  }
  if (!contentType2 && value.readable && value.hasOwnProperty("httpVersion")) {
    contentType2 = value.headers["content-type"];
  }
  if (!contentType2 && (options2.filepath || options2.filename)) {
    contentType2 = mime.lookup(options2.filepath || options2.filename);
  }
  if (!contentType2 && typeof value == "object") {
    contentType2 = FormData.DEFAULT_CONTENT_TYPE;
  }
  return contentType2;
};
FormData.prototype._multiPartFooter = function() {
  return function(next) {
    var footer = FormData.LINE_BREAK;
    var lastPart = this._streams.length === 0;
    if (lastPart) {
      footer += this._lastBoundary();
    }
    next(footer);
  }.bind(this);
};
FormData.prototype._lastBoundary = function() {
  return "--" + this.getBoundary() + "--" + FormData.LINE_BREAK;
};
FormData.prototype.getHeaders = function(userHeaders) {
  var header;
  var formHeaders = {
    "content-type": "multipart/form-data; boundary=" + this.getBoundary()
  };
  for (header in userHeaders) {
    if (userHeaders.hasOwnProperty(header)) {
      formHeaders[header.toLowerCase()] = userHeaders[header];
    }
  }
  return formHeaders;
};
FormData.prototype.setBoundary = function(boundary) {
  this._boundary = boundary;
};
FormData.prototype.getBoundary = function() {
  if (!this._boundary) {
    this._generateBoundary();
  }
  return this._boundary;
};
FormData.prototype.getBuffer = function() {
  var dataBuffer = new Buffer.alloc(0);
  var boundary = this.getBoundary();
  for (var i = 0, len = this._streams.length; i < len; i++) {
    if (typeof this._streams[i] !== "function") {
      if (Buffer.isBuffer(this._streams[i])) {
        dataBuffer = Buffer.concat([dataBuffer, this._streams[i]]);
      } else {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(this._streams[i])]);
      }
      if (typeof this._streams[i] !== "string" || this._streams[i].substring(2, boundary.length + 2) !== boundary) {
        dataBuffer = Buffer.concat([dataBuffer, Buffer.from(FormData.LINE_BREAK)]);
      }
    }
  }
  return Buffer.concat([dataBuffer, Buffer.from(this._lastBoundary())]);
};
FormData.prototype._generateBoundary = function() {
  var boundary = "--------------------------";
  for (var i = 0; i < 24; i++) {
    boundary += Math.floor(Math.random() * 10).toString(16);
  }
  this._boundary = boundary;
};
FormData.prototype.getLengthSync = function() {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this.hasKnownLength()) {
    this._error(new Error("Cannot calculate proper length in synchronous way."));
  }
  return knownLength;
};
FormData.prototype.hasKnownLength = function() {
  var hasKnownLength = true;
  if (this._valuesToMeasure.length) {
    hasKnownLength = false;
  }
  return hasKnownLength;
};
FormData.prototype.getLength = function(cb) {
  var knownLength = this._overheadLength + this._valueLength;
  if (this._streams.length) {
    knownLength += this._lastBoundary().length;
  }
  if (!this._valuesToMeasure.length) {
    process.nextTick(cb.bind(this, null, knownLength));
    return;
  }
  asynckit.parallel(this._valuesToMeasure, this._lengthRetriever, function(err, values) {
    if (err) {
      cb(err);
      return;
    }
    values.forEach(function(length) {
      knownLength += length;
    });
    cb(null, knownLength);
  });
};
FormData.prototype.submit = function(params, cb) {
  var request3, options2, defaults = { method: "post" };
  if (typeof params == "string") {
    params = parseUrl(params);
    options2 = populate({
      port: params.port,
      path: params.pathname,
      host: params.hostname,
      protocol: params.protocol
    }, defaults);
  } else {
    options2 = populate(params, defaults);
    if (!options2.port) {
      options2.port = options2.protocol == "https:" ? 443 : 80;
    }
  }
  options2.headers = this.getHeaders(params.headers);
  if (options2.protocol == "https:") {
    request3 = https.request(options2);
  } else {
    request3 = http.request(options2);
  }
  this.getLength(function(err, length) {
    if (err && err !== "Unknown stream") {
      this._error(err);
      return;
    }
    if (length) {
      request3.setHeader("Content-Length", length);
    }
    this.pipe(request3);
    if (cb) {
      var onResponse;
      var callback = function(error, responce) {
        request3.removeListener("error", callback);
        request3.removeListener("response", onResponse);
        return cb.call(this, error, responce);
      };
      onResponse = callback.bind(this, null);
      request3.on("error", callback);
      request3.on("response", onResponse);
    }
  }.bind(this));
  return request3;
};
FormData.prototype._error = function(err) {
  if (!this.error) {
    this.error = err;
    this.pause();
    this.emit("error", err);
  }
};
FormData.prototype.toString = function() {
  return "[object FormData]";
};
var FormData$1 = /* @__PURE__ */ getDefaultExportFromCjs(form_data);
var formDataPolicyName = "formDataPolicy";
function formDataPolicy() {
  return {
    name: formDataPolicyName,
    async sendRequest(request3, next) {
      if (request3.formData) {
        const contentType2 = request3.headers.get("Content-Type");
        if (contentType2 && contentType2.indexOf("application/x-www-form-urlencoded") !== -1) {
          request3.body = wwwFormUrlEncode(request3.formData);
          request3.formData = void 0;
        } else {
          await prepareFormData(request3.formData, request3);
        }
      }
      return next(request3);
    }
  };
}
function wwwFormUrlEncode(formData) {
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(formData)) {
    if (Array.isArray(value)) {
      for (const subValue of value) {
        urlSearchParams.append(key, subValue.toString());
      }
    } else {
      urlSearchParams.append(key, value.toString());
    }
  }
  return urlSearchParams.toString();
}
async function prepareFormData(formData, request3) {
  const requestForm = new FormData$1();
  for (const formKey of Object.keys(formData)) {
    const formValue = formData[formKey];
    if (Array.isArray(formValue)) {
      for (const subValue of formValue) {
        requestForm.append(formKey, subValue);
      }
    } else {
      requestForm.append(formKey, formValue);
    }
  }
  request3.body = requestForm;
  request3.formData = void 0;
  const contentType2 = request3.headers.get("Content-Type");
  if (contentType2 && contentType2.indexOf("multipart/form-data") !== -1) {
    request3.headers.set("Content-Type", `multipart/form-data; boundary=${requestForm.getBoundary()}`);
  }
  try {
    const contentLength = await new Promise((resolve, reject) => {
      requestForm.getLength((err, length) => {
        if (err) {
          reject(err);
        } else {
          resolve(length);
        }
      });
    });
    request3.headers.set("Content-Length", contentLength);
  } catch (e) {
  }
}
var agent$1 = {};
var src$1 = { exports: {} };
var browser = { exports: {} };
var ms;
var hasRequiredMs;
function requireMs() {
  if (hasRequiredMs)
    return ms;
  hasRequiredMs = 1;
  var s = 1e3;
  var m = s * 60;
  var h = m * 60;
  var d = h * 24;
  var w = d * 7;
  var y = d * 365.25;
  ms = function(val, options2) {
    options2 = options2 || {};
    var type2 = typeof val;
    if (type2 === "string" && val.length > 0) {
      return parse2(val);
    } else if (type2 === "number" && isFinite(val)) {
      return options2.long ? fmtLong(val) : fmtShort(val);
    }
    throw new Error(
      "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
    );
  };
  function parse2(str) {
    str = String(str);
    if (str.length > 100) {
      return;
    }
    var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
      str
    );
    if (!match) {
      return;
    }
    var n = parseFloat(match[1]);
    var type2 = (match[2] || "ms").toLowerCase();
    switch (type2) {
      case "years":
      case "year":
      case "yrs":
      case "yr":
      case "y":
        return n * y;
      case "weeks":
      case "week":
      case "w":
        return n * w;
      case "days":
      case "day":
      case "d":
        return n * d;
      case "hours":
      case "hour":
      case "hrs":
      case "hr":
      case "h":
        return n * h;
      case "minutes":
      case "minute":
      case "mins":
      case "min":
      case "m":
        return n * m;
      case "seconds":
      case "second":
      case "secs":
      case "sec":
      case "s":
        return n * s;
      case "milliseconds":
      case "millisecond":
      case "msecs":
      case "msec":
      case "ms":
        return n;
      default:
        return void 0;
    }
  }
  function fmtShort(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return Math.round(ms2 / d) + "d";
    }
    if (msAbs >= h) {
      return Math.round(ms2 / h) + "h";
    }
    if (msAbs >= m) {
      return Math.round(ms2 / m) + "m";
    }
    if (msAbs >= s) {
      return Math.round(ms2 / s) + "s";
    }
    return ms2 + "ms";
  }
  function fmtLong(ms2) {
    var msAbs = Math.abs(ms2);
    if (msAbs >= d) {
      return plural(ms2, msAbs, d, "day");
    }
    if (msAbs >= h) {
      return plural(ms2, msAbs, h, "hour");
    }
    if (msAbs >= m) {
      return plural(ms2, msAbs, m, "minute");
    }
    if (msAbs >= s) {
      return plural(ms2, msAbs, s, "second");
    }
    return ms2 + " ms";
  }
  function plural(ms2, msAbs, n, name) {
    var isPlural = msAbs >= n * 1.5;
    return Math.round(ms2 / n) + " " + name + (isPlural ? "s" : "");
  }
  return ms;
}
var common;
var hasRequiredCommon;
function requireCommon() {
  if (hasRequiredCommon)
    return common;
  hasRequiredCommon = 1;
  function setup(env) {
    createDebug.debug = createDebug;
    createDebug.default = createDebug;
    createDebug.coerce = coerce;
    createDebug.disable = disable2;
    createDebug.enable = enable2;
    createDebug.enabled = enabled2;
    createDebug.humanize = requireMs();
    createDebug.destroy = destroy2;
    Object.keys(env).forEach((key) => {
      createDebug[key] = env[key];
    });
    createDebug.names = [];
    createDebug.skips = [];
    createDebug.formatters = {};
    function selectColor(namespace) {
      let hash = 0;
      for (let i = 0; i < namespace.length; i++) {
        hash = (hash << 5) - hash + namespace.charCodeAt(i);
        hash |= 0;
      }
      return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
    }
    createDebug.selectColor = selectColor;
    function createDebug(namespace) {
      let prevTime;
      let enableOverride = null;
      let namespacesCache;
      let enabledCache;
      function debug2(...args) {
        if (!debug2.enabled) {
          return;
        }
        const self2 = debug2;
        const curr = Number(/* @__PURE__ */ new Date());
        const ms2 = curr - (prevTime || curr);
        self2.diff = ms2;
        self2.prev = prevTime;
        self2.curr = curr;
        prevTime = curr;
        args[0] = createDebug.coerce(args[0]);
        if (typeof args[0] !== "string") {
          args.unshift("%O");
        }
        let index = 0;
        args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
          if (match === "%%") {
            return "%";
          }
          index++;
          const formatter = createDebug.formatters[format];
          if (typeof formatter === "function") {
            const val = args[index];
            match = formatter.call(self2, val);
            args.splice(index, 1);
            index--;
          }
          return match;
        });
        createDebug.formatArgs.call(self2, args);
        const logFn = self2.log || createDebug.log;
        logFn.apply(self2, args);
      }
      debug2.namespace = namespace;
      debug2.useColors = createDebug.useColors();
      debug2.color = createDebug.selectColor(namespace);
      debug2.extend = extend2;
      debug2.destroy = createDebug.destroy;
      Object.defineProperty(debug2, "enabled", {
        enumerable: true,
        configurable: false,
        get: () => {
          if (enableOverride !== null) {
            return enableOverride;
          }
          if (namespacesCache !== createDebug.namespaces) {
            namespacesCache = createDebug.namespaces;
            enabledCache = createDebug.enabled(namespace);
          }
          return enabledCache;
        },
        set: (v) => {
          enableOverride = v;
        }
      });
      if (typeof createDebug.init === "function") {
        createDebug.init(debug2);
      }
      return debug2;
    }
    function extend2(namespace, delimiter) {
      const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
      newDebug.log = this.log;
      return newDebug;
    }
    function enable2(namespaces) {
      createDebug.save(namespaces);
      createDebug.namespaces = namespaces;
      createDebug.names = [];
      createDebug.skips = [];
      let i;
      const split = (typeof namespaces === "string" ? namespaces : "").split(/[\s,]+/);
      const len = split.length;
      for (i = 0; i < len; i++) {
        if (!split[i]) {
          continue;
        }
        namespaces = split[i].replace(/\*/g, ".*?");
        if (namespaces[0] === "-") {
          createDebug.skips.push(new RegExp("^" + namespaces.slice(1) + "$"));
        } else {
          createDebug.names.push(new RegExp("^" + namespaces + "$"));
        }
      }
    }
    function disable2() {
      const namespaces = [
        ...createDebug.names.map(toNamespace),
        ...createDebug.skips.map(toNamespace).map((namespace) => "-" + namespace)
      ].join(",");
      createDebug.enable("");
      return namespaces;
    }
    function enabled2(name) {
      if (name[name.length - 1] === "*") {
        return true;
      }
      let i;
      let len;
      for (i = 0, len = createDebug.skips.length; i < len; i++) {
        if (createDebug.skips[i].test(name)) {
          return false;
        }
      }
      for (i = 0, len = createDebug.names.length; i < len; i++) {
        if (createDebug.names[i].test(name)) {
          return true;
        }
      }
      return false;
    }
    function toNamespace(regexp) {
      return regexp.toString().substring(2, regexp.toString().length - 2).replace(/\.\*\?$/, "*");
    }
    function coerce(val) {
      if (val instanceof Error) {
        return val.stack || val.message;
      }
      return val;
    }
    function destroy2() {
      console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
    }
    createDebug.enable(createDebug.load());
    return createDebug;
  }
  common = setup;
  return common;
}
var hasRequiredBrowser;
function requireBrowser() {
  if (hasRequiredBrowser)
    return browser.exports;
  hasRequiredBrowser = 1;
  (function(module2, exports) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module2.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r;
      try {
        r = exports.storage.getItem("debug");
      } catch (error) {
      }
      if (!r && typeof process !== "undefined" && "env" in process) {
        r = process.env.DEBUG;
      }
      return r;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module2.exports = requireCommon()(exports);
    const { formatters } = module2.exports;
    formatters.j = function(v) {
      try {
        return JSON.stringify(v);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  })(browser, browser.exports);
  return browser.exports;
}
var node = { exports: {} };
var hasFlag;
var hasRequiredHasFlag;
function requireHasFlag() {
  if (hasRequiredHasFlag)
    return hasFlag;
  hasRequiredHasFlag = 1;
  hasFlag = (flag, argv) => {
    argv = argv || process.argv;
    const prefix = flag.startsWith("-") ? "" : flag.length === 1 ? "-" : "--";
    const pos = argv.indexOf(prefix + flag);
    const terminatorPos = argv.indexOf("--");
    return pos !== -1 && (terminatorPos === -1 ? true : pos < terminatorPos);
  };
  return hasFlag;
}
var supportsColor_1;
var hasRequiredSupportsColor;
function requireSupportsColor() {
  if (hasRequiredSupportsColor)
    return supportsColor_1;
  hasRequiredSupportsColor = 1;
  const os2 = import_os.default;
  const hasFlag2 = requireHasFlag();
  const env = process.env;
  let forceColor;
  if (hasFlag2("no-color") || hasFlag2("no-colors") || hasFlag2("color=false")) {
    forceColor = false;
  } else if (hasFlag2("color") || hasFlag2("colors") || hasFlag2("color=true") || hasFlag2("color=always")) {
    forceColor = true;
  }
  if ("FORCE_COLOR" in env) {
    forceColor = env.FORCE_COLOR.length === 0 || parseInt(env.FORCE_COLOR, 10) !== 0;
  }
  function translateLevel(level) {
    if (level === 0) {
      return false;
    }
    return {
      level,
      hasBasic: true,
      has256: level >= 2,
      has16m: level >= 3
    };
  }
  function supportsColor(stream) {
    if (forceColor === false) {
      return 0;
    }
    if (hasFlag2("color=16m") || hasFlag2("color=full") || hasFlag2("color=truecolor")) {
      return 3;
    }
    if (hasFlag2("color=256")) {
      return 2;
    }
    if (stream && !stream.isTTY && forceColor !== true) {
      return 0;
    }
    const min = forceColor ? 1 : 0;
    if (process.platform === "win32") {
      const osRelease = os2.release().split(".");
      if (Number(process.versions.node.split(".")[0]) >= 8 && Number(osRelease[0]) >= 10 && Number(osRelease[2]) >= 10586) {
        return Number(osRelease[2]) >= 14931 ? 3 : 2;
      }
      return 1;
    }
    if ("CI" in env) {
      if (["TRAVIS", "CIRCLECI", "APPVEYOR", "GITLAB_CI"].some((sign) => sign in env) || env.CI_NAME === "codeship") {
        return 1;
      }
      return min;
    }
    if ("TEAMCITY_VERSION" in env) {
      return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
    }
    if (env.COLORTERM === "truecolor") {
      return 3;
    }
    if ("TERM_PROGRAM" in env) {
      const version = parseInt((env.TERM_PROGRAM_VERSION || "").split(".")[0], 10);
      switch (env.TERM_PROGRAM) {
        case "iTerm.app":
          return version >= 3 ? 3 : 2;
        case "Apple_Terminal":
          return 2;
      }
    }
    if (/-256(color)?$/i.test(env.TERM)) {
      return 2;
    }
    if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
      return 1;
    }
    if ("COLORTERM" in env) {
      return 1;
    }
    if (env.TERM === "dumb") {
      return min;
    }
    return min;
  }
  function getSupportLevel(stream) {
    const level = supportsColor(stream);
    return translateLevel(level);
  }
  supportsColor_1 = {
    supportsColor: getSupportLevel,
    stdout: getSupportLevel(process.stdout),
    stderr: getSupportLevel(process.stderr)
  };
  return supportsColor_1;
}
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode)
    return node.exports;
  hasRequiredNode = 1;
  (function(module2, exports) {
    const tty = import_tty.default;
    const util2 = import_util.default;
    exports.init = init;
    exports.log = log2;
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.destroy = util2.deprecate(
      () => {
      },
      "Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`."
    );
    exports.colors = [6, 2, 3, 4, 5, 1];
    try {
      const supportsColor = requireSupportsColor();
      if (supportsColor && (supportsColor.stderr || supportsColor).level >= 2) {
        exports.colors = [
          20,
          21,
          26,
          27,
          32,
          33,
          38,
          39,
          40,
          41,
          42,
          43,
          44,
          45,
          56,
          57,
          62,
          63,
          68,
          69,
          74,
          75,
          76,
          77,
          78,
          79,
          80,
          81,
          92,
          93,
          98,
          99,
          112,
          113,
          128,
          129,
          134,
          135,
          148,
          149,
          160,
          161,
          162,
          163,
          164,
          165,
          166,
          167,
          168,
          169,
          170,
          171,
          172,
          173,
          178,
          179,
          184,
          185,
          196,
          197,
          198,
          199,
          200,
          201,
          202,
          203,
          204,
          205,
          206,
          207,
          208,
          209,
          214,
          215,
          220,
          221
        ];
      }
    } catch (error) {
    }
    exports.inspectOpts = Object.keys(process.env).filter((key) => {
      return /^debug_/i.test(key);
    }).reduce((obj, key) => {
      const prop = key.substring(6).toLowerCase().replace(/_([a-z])/g, (_, k) => {
        return k.toUpperCase();
      });
      let val = process.env[key];
      if (/^(yes|on|true|enabled)$/i.test(val)) {
        val = true;
      } else if (/^(no|off|false|disabled)$/i.test(val)) {
        val = false;
      } else if (val === "null") {
        val = null;
      } else {
        val = Number(val);
      }
      obj[prop] = val;
      return obj;
    }, {});
    function useColors() {
      return "colors" in exports.inspectOpts ? Boolean(exports.inspectOpts.colors) : tty.isatty(process.stderr.fd);
    }
    function formatArgs(args) {
      const { namespace: name, useColors: useColors2 } = this;
      if (useColors2) {
        const c2 = this.color;
        const colorCode = "\x1B[3" + (c2 < 8 ? c2 : "8;5;" + c2);
        const prefix = `  ${colorCode};1m${name} \x1B[0m`;
        args[0] = prefix + args[0].split("\n").join("\n" + prefix);
        args.push(colorCode + "m+" + module2.exports.humanize(this.diff) + "\x1B[0m");
      } else {
        args[0] = getDate() + name + " " + args[0];
      }
    }
    function getDate() {
      if (exports.inspectOpts.hideDate) {
        return "";
      }
      return (/* @__PURE__ */ new Date()).toISOString() + " ";
    }
    function log2(...args) {
      return process.stderr.write(util2.format(...args) + "\n");
    }
    function save(namespaces) {
      if (namespaces) {
        process.env.DEBUG = namespaces;
      } else {
        delete process.env.DEBUG;
      }
    }
    function load() {
      return process.env.DEBUG;
    }
    function init(debug2) {
      debug2.inspectOpts = {};
      const keys = Object.keys(exports.inspectOpts);
      for (let i = 0; i < keys.length; i++) {
        debug2.inspectOpts[keys[i]] = exports.inspectOpts[keys[i]];
      }
    }
    module2.exports = requireCommon()(exports);
    const { formatters } = module2.exports;
    formatters.o = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts).split("\n").map((str) => str.trim()).join(" ");
    };
    formatters.O = function(v) {
      this.inspectOpts.colors = this.useColors;
      return util2.inspect(v, this.inspectOpts);
    };
  })(node, node.exports);
  return node.exports;
}
if (typeof process === "undefined" || process.type === "renderer" || process.browser === true || process.__nwjs) {
  src$1.exports = requireBrowser();
} else {
  src$1.exports = requireNode();
}
var srcExports = src$1.exports;
var promisify$1 = {};
Object.defineProperty(promisify$1, "__esModule", { value: true });
function promisify(fn) {
  return function(req, opts) {
    return new Promise((resolve, reject) => {
      fn.call(this, req, opts, (err, rtn) => {
        if (err) {
          reject(err);
        } else {
          resolve(rtn);
        }
      });
    });
  };
}
promisify$1.default = promisify;
var __importDefault$5 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
var events_1 = import_events.default;
var debug_1$3 = __importDefault$5(srcExports);
var promisify_1 = __importDefault$5(promisify$1);
var debug$3 = debug_1$3.default("agent-base");
function isAgent(v) {
  return Boolean(v) && typeof v.addRequest === "function";
}
function isSecureEndpoint() {
  const { stack } = new Error();
  if (typeof stack !== "string")
    return false;
  return stack.split("\n").some((l) => l.indexOf("(https.js:") !== -1 || l.indexOf("node:https:") !== -1);
}
function createAgent(callback, opts) {
  return new createAgent.Agent(callback, opts);
}
(function(createAgent2) {
  class Agent3 extends events_1.EventEmitter {
    constructor(callback, _opts) {
      super();
      let opts = _opts;
      if (typeof callback === "function") {
        this.callback = callback;
      } else if (callback) {
        opts = callback;
      }
      this.timeout = null;
      if (opts && typeof opts.timeout === "number") {
        this.timeout = opts.timeout;
      }
      this.maxFreeSockets = 1;
      this.maxSockets = 1;
      this.maxTotalSockets = Infinity;
      this.sockets = {};
      this.freeSockets = {};
      this.requests = {};
      this.options = {};
    }
    get defaultPort() {
      if (typeof this.explicitDefaultPort === "number") {
        return this.explicitDefaultPort;
      }
      return isSecureEndpoint() ? 443 : 80;
    }
    set defaultPort(v) {
      this.explicitDefaultPort = v;
    }
    get protocol() {
      if (typeof this.explicitProtocol === "string") {
        return this.explicitProtocol;
      }
      return isSecureEndpoint() ? "https:" : "http:";
    }
    set protocol(v) {
      this.explicitProtocol = v;
    }
    callback(req, opts, fn) {
      throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
    }
    /**
     * Called by node-core's "_http_client.js" module when creating
     * a new HTTP request with this Agent instance.
     *
     * @api public
     */
    addRequest(req, _opts) {
      const opts = Object.assign({}, _opts);
      if (typeof opts.secureEndpoint !== "boolean") {
        opts.secureEndpoint = isSecureEndpoint();
      }
      if (opts.host == null) {
        opts.host = "localhost";
      }
      if (opts.port == null) {
        opts.port = opts.secureEndpoint ? 443 : 80;
      }
      if (opts.protocol == null) {
        opts.protocol = opts.secureEndpoint ? "https:" : "http:";
      }
      if (opts.host && opts.path) {
        delete opts.path;
      }
      delete opts.agent;
      delete opts.hostname;
      delete opts._defaultAgent;
      delete opts.defaultPort;
      delete opts.createConnection;
      req._last = true;
      req.shouldKeepAlive = false;
      let timedOut = false;
      let timeoutId = null;
      const timeoutMs = opts.timeout || this.timeout;
      const onerror = (err) => {
        if (req._hadError)
          return;
        req.emit("error", err);
        req._hadError = true;
      };
      const ontimeout = () => {
        timeoutId = null;
        timedOut = true;
        const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
        err.code = "ETIMEOUT";
        onerror(err);
      };
      const callbackError = (err) => {
        if (timedOut)
          return;
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        onerror(err);
      };
      const onsocket = (socket) => {
        if (timedOut)
          return;
        if (timeoutId != null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (isAgent(socket)) {
          debug$3("Callback returned another Agent instance %o", socket.constructor.name);
          socket.addRequest(req, opts);
          return;
        }
        if (socket) {
          socket.once("free", () => {
            this.freeSocket(socket, opts);
          });
          req.onSocket(socket);
          return;
        }
        const err = new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``);
        onerror(err);
      };
      if (typeof this.callback !== "function") {
        onerror(new Error("`callback` is not defined"));
        return;
      }
      if (!this.promisifiedCallback) {
        if (this.callback.length >= 3) {
          debug$3("Converting legacy callback function to promise");
          this.promisifiedCallback = promisify_1.default(this.callback);
        } else {
          this.promisifiedCallback = this.callback;
        }
      }
      if (typeof timeoutMs === "number" && timeoutMs > 0) {
        timeoutId = setTimeout(ontimeout, timeoutMs);
      }
      if ("port" in opts && typeof opts.port !== "number") {
        opts.port = Number(opts.port);
      }
      try {
        debug$3("Resolving socket for %o request: %o", opts.protocol, `${req.method} ${req.path}`);
        Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, callbackError);
      } catch (err) {
        Promise.reject(err).catch(callbackError);
      }
    }
    freeSocket(socket, opts) {
      debug$3("Freeing socket %o %o", socket.constructor.name, opts);
      socket.destroy();
    }
    destroy() {
      debug$3("Destroying agent %o", this.constructor.name);
    }
  }
  createAgent2.Agent = Agent3;
  createAgent2.prototype = createAgent2.Agent.prototype;
})(createAgent || (createAgent = {}));
var src = createAgent;
var parseProxyResponse$1 = {};
var __importDefault$4 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(parseProxyResponse$1, "__esModule", { value: true });
var debug_1$2 = __importDefault$4(srcExports);
var debug$2 = debug_1$2.default("https-proxy-agent:parse-proxy-response");
function parseProxyResponse(socket) {
  return new Promise((resolve, reject) => {
    let buffersLength = 0;
    const buffers = [];
    function read() {
      const b = socket.read();
      if (b)
        ondata(b);
      else
        socket.once("readable", read);
    }
    function cleanup() {
      socket.removeListener("end", onend);
      socket.removeListener("error", onerror);
      socket.removeListener("close", onclose);
      socket.removeListener("readable", read);
    }
    function onclose(err) {
      debug$2("onclose had error %o", err);
    }
    function onend() {
      debug$2("onend");
    }
    function onerror(err) {
      cleanup();
      debug$2("onerror %o", err);
      reject(err);
    }
    function ondata(b) {
      buffers.push(b);
      buffersLength += b.length;
      const buffered = Buffer.concat(buffers, buffersLength);
      const endOfHeaders = buffered.indexOf("\r\n\r\n");
      if (endOfHeaders === -1) {
        debug$2("have not received end of HTTP headers yet...");
        read();
        return;
      }
      const firstLine = buffered.toString("ascii", 0, buffered.indexOf("\r\n"));
      const statusCode = +firstLine.split(" ")[1];
      debug$2("got proxy server response: %o", firstLine);
      resolve({
        statusCode,
        buffered
      });
    }
    socket.on("error", onerror);
    socket.on("close", onclose);
    socket.on("end", onend);
    read();
  });
}
parseProxyResponse$1.default = parseProxyResponse;
var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault$3 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(agent$1, "__esModule", { value: true });
var net_1$1 = __importDefault$3(import_net.default);
var tls_1$1 = __importDefault$3(import_tls.default);
var url_1$1 = __importDefault$3(import_url.default);
var assert_1 = __importDefault$3(import_assert.default);
var debug_1$1 = __importDefault$3(srcExports);
var agent_base_1$1 = src;
var parse_proxy_response_1 = __importDefault$3(parseProxyResponse$1);
var debug$1 = debug_1$1.default("https-proxy-agent:agent");
var HttpsProxyAgent = class extends agent_base_1$1.Agent {
  constructor(_opts) {
    let opts;
    if (typeof _opts === "string") {
      opts = url_1$1.default.parse(_opts);
    } else {
      opts = _opts;
    }
    if (!opts) {
      throw new Error("an HTTP(S) proxy server `host` and `port` must be specified!");
    }
    debug$1("creating new HttpsProxyAgent instance: %o", opts);
    super(opts);
    const proxy = Object.assign({}, opts);
    this.secureProxy = opts.secureProxy || isHTTPS$1(proxy.protocol);
    proxy.host = proxy.hostname || proxy.host;
    if (typeof proxy.port === "string") {
      proxy.port = parseInt(proxy.port, 10);
    }
    if (!proxy.port && proxy.host) {
      proxy.port = this.secureProxy ? 443 : 80;
    }
    if (this.secureProxy && !("ALPNProtocols" in proxy)) {
      proxy.ALPNProtocols = ["http 1.1"];
    }
    if (proxy.host && proxy.path) {
      delete proxy.path;
      delete proxy.pathname;
    }
    this.proxy = proxy;
  }
  /**
   * Called when the node-core HTTP client library is creating a
   * new HTTP request.
   *
   * @api protected
   */
  callback(req, opts) {
    return __awaiter$1(this, void 0, void 0, function* () {
      const { proxy, secureProxy } = this;
      let socket;
      if (secureProxy) {
        debug$1("Creating `tls.Socket`: %o", proxy);
        socket = tls_1$1.default.connect(proxy);
      } else {
        debug$1("Creating `net.Socket`: %o", proxy);
        socket = net_1$1.default.connect(proxy);
      }
      const headers = Object.assign({}, proxy.headers);
      const hostname = `${opts.host}:${opts.port}`;
      let payload = `CONNECT ${hostname} HTTP/1.1\r
`;
      if (proxy.auth) {
        headers["Proxy-Authorization"] = `Basic ${Buffer.from(proxy.auth).toString("base64")}`;
      }
      let { host, port, secureEndpoint } = opts;
      if (!isDefaultPort(port, secureEndpoint)) {
        host += `:${port}`;
      }
      headers.Host = host;
      headers.Connection = "close";
      for (const name of Object.keys(headers)) {
        payload += `${name}: ${headers[name]}\r
`;
      }
      const proxyResponsePromise = parse_proxy_response_1.default(socket);
      socket.write(`${payload}\r
`);
      const { statusCode, buffered } = yield proxyResponsePromise;
      if (statusCode === 200) {
        req.once("socket", resume);
        if (opts.secureEndpoint) {
          debug$1("Upgrading socket connection to TLS");
          const servername = opts.servername || opts.host;
          return tls_1$1.default.connect(Object.assign(Object.assign({}, omit(opts, "host", "hostname", "path", "port")), {
            socket,
            servername
          }));
        }
        return socket;
      }
      socket.destroy();
      const fakeSocket = new net_1$1.default.Socket({ writable: false });
      fakeSocket.readable = true;
      req.once("socket", (s) => {
        debug$1("replaying proxy buffer for failed request");
        assert_1.default(s.listenerCount("data") > 0);
        s.push(buffered);
        s.push(null);
      });
      return fakeSocket;
    });
  }
};
agent$1.default = HttpsProxyAgent;
function resume(socket) {
  socket.resume();
}
function isDefaultPort(port, secure) {
  return Boolean(!secure && port === 80 || secure && port === 443);
}
function isHTTPS$1(protocol) {
  return typeof protocol === "string" ? /^https:?$/i.test(protocol) : false;
}
function omit(obj, ...keys) {
  const ret = {};
  let key;
  for (key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
}
var __importDefault$2 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
var agent_1$1 = __importDefault$2(agent$1);
function createHttpsProxyAgent(opts) {
  return new agent_1$1.default(opts);
}
(function(createHttpsProxyAgent2) {
  createHttpsProxyAgent2.HttpsProxyAgent = agent_1$1.default;
  createHttpsProxyAgent2.prototype = agent_1$1.default.prototype;
})(createHttpsProxyAgent || (createHttpsProxyAgent = {}));
var dist$2 = createHttpsProxyAgent;
var agent = {};
var dist$1 = {};
Object.defineProperty(dist$1, "__esModule", { value: true });
function once(emitter, name, { signal } = {}) {
  return new Promise((resolve, reject) => {
    function cleanup() {
      signal === null || signal === void 0 ? void 0 : signal.removeEventListener("abort", cleanup);
      emitter.removeListener(name, onEvent);
      emitter.removeListener("error", onError);
    }
    function onEvent(...args) {
      cleanup();
      resolve(args);
    }
    function onError(err) {
      cleanup();
      reject(err);
    }
    signal === null || signal === void 0 ? void 0 : signal.addEventListener("abort", cleanup);
    emitter.on(name, onEvent);
    emitter.on("error", onError);
  });
}
dist$1.default = once;
var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(agent, "__esModule", { value: true });
var net_1 = __importDefault$1(import_net.default);
var tls_1 = __importDefault$1(import_tls.default);
var url_1 = __importDefault$1(import_url.default);
var debug_1 = __importDefault$1(srcExports);
var once_1 = __importDefault$1(dist$1);
var agent_base_1 = src;
var debug = (0, debug_1.default)("http-proxy-agent");
function isHTTPS(protocol) {
  return typeof protocol === "string" ? /^https:?$/i.test(protocol) : false;
}
var HttpProxyAgent = class extends agent_base_1.Agent {
  constructor(_opts) {
    let opts;
    if (typeof _opts === "string") {
      opts = url_1.default.parse(_opts);
    } else {
      opts = _opts;
    }
    if (!opts) {
      throw new Error("an HTTP(S) proxy server `host` and `port` must be specified!");
    }
    debug("Creating new HttpProxyAgent instance: %o", opts);
    super(opts);
    const proxy = Object.assign({}, opts);
    this.secureProxy = opts.secureProxy || isHTTPS(proxy.protocol);
    proxy.host = proxy.hostname || proxy.host;
    if (typeof proxy.port === "string") {
      proxy.port = parseInt(proxy.port, 10);
    }
    if (!proxy.port && proxy.host) {
      proxy.port = this.secureProxy ? 443 : 80;
    }
    if (proxy.host && proxy.path) {
      delete proxy.path;
      delete proxy.pathname;
    }
    this.proxy = proxy;
  }
  /**
   * Called when the node-core HTTP client library is creating a
   * new HTTP request.
   *
   * @api protected
   */
  callback(req, opts) {
    return __awaiter(this, void 0, void 0, function* () {
      const { proxy, secureProxy } = this;
      const parsed = url_1.default.parse(req.path);
      if (!parsed.protocol) {
        parsed.protocol = "http:";
      }
      if (!parsed.hostname) {
        parsed.hostname = opts.hostname || opts.host || null;
      }
      if (parsed.port == null && typeof opts.port) {
        parsed.port = String(opts.port);
      }
      if (parsed.port === "80") {
        parsed.port = "";
      }
      req.path = url_1.default.format(parsed);
      if (proxy.auth) {
        req.setHeader("Proxy-Authorization", `Basic ${Buffer.from(proxy.auth).toString("base64")}`);
      }
      let socket;
      if (secureProxy) {
        debug("Creating `tls.Socket`: %o", proxy);
        socket = tls_1.default.connect(proxy);
      } else {
        debug("Creating `net.Socket`: %o", proxy);
        socket = net_1.default.connect(proxy);
      }
      if (req._header) {
        let first;
        let endOfHeaders;
        debug("Regenerating stored HTTP header string for request");
        req._header = null;
        req._implicitHeader();
        if (req.output && req.output.length > 0) {
          debug("Patching connection write() output buffer with updated header");
          first = req.output[0];
          endOfHeaders = first.indexOf("\r\n\r\n") + 4;
          req.output[0] = req._header + first.substring(endOfHeaders);
          debug("Output buffer: %o", req.output);
        } else if (req.outputData && req.outputData.length > 0) {
          debug("Patching connection write() output buffer with updated header");
          first = req.outputData[0].data;
          endOfHeaders = first.indexOf("\r\n\r\n") + 4;
          req.outputData[0].data = req._header + first.substring(endOfHeaders);
          debug("Output buffer: %o", req.outputData[0].data);
        }
      }
      yield (0, once_1.default)(socket, "connect");
      return socket;
    });
  }
};
agent.default = HttpProxyAgent;
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
var agent_1 = __importDefault(agent);
function createHttpProxyAgent(opts) {
  return new agent_1.default(opts);
}
(function(createHttpProxyAgent2) {
  createHttpProxyAgent2.HttpProxyAgent = agent_1.default;
  createHttpProxyAgent2.prototype = agent_1.default.prototype;
})(createHttpProxyAgent || (createHttpProxyAgent = {}));
var dist = createHttpProxyAgent;
var HTTPS_PROXY = "HTTPS_PROXY";
var HTTP_PROXY = "HTTP_PROXY";
var ALL_PROXY = "ALL_PROXY";
var NO_PROXY = "NO_PROXY";
var proxyPolicyName = "proxyPolicy";
var globalNoProxyList = [];
var noProxyListLoaded = false;
var globalBypassedMap = /* @__PURE__ */ new Map();
function getEnvironmentValue(name) {
  if (process.env[name]) {
    return process.env[name];
  } else if (process.env[name.toLowerCase()]) {
    return process.env[name.toLowerCase()];
  }
  return void 0;
}
function loadEnvironmentProxyValue() {
  if (!process) {
    return void 0;
  }
  const httpsProxy = getEnvironmentValue(HTTPS_PROXY);
  const allProxy = getEnvironmentValue(ALL_PROXY);
  const httpProxy = getEnvironmentValue(HTTP_PROXY);
  return httpsProxy || allProxy || httpProxy;
}
function isBypassed(uri, noProxyList, bypassedMap) {
  if (noProxyList.length === 0) {
    return false;
  }
  const host = new URL(uri).hostname;
  if (bypassedMap === null || bypassedMap === void 0 ? void 0 : bypassedMap.has(host)) {
    return bypassedMap.get(host);
  }
  let isBypassedFlag = false;
  for (const pattern of noProxyList) {
    if (pattern[0] === ".") {
      if (host.endsWith(pattern)) {
        isBypassedFlag = true;
      } else {
        if (host.length === pattern.length - 1 && host === pattern.slice(1)) {
          isBypassedFlag = true;
        }
      }
    } else {
      if (host === pattern) {
        isBypassedFlag = true;
      }
    }
  }
  bypassedMap === null || bypassedMap === void 0 ? void 0 : bypassedMap.set(host, isBypassedFlag);
  return isBypassedFlag;
}
function loadNoProxy() {
  const noProxy = getEnvironmentValue(NO_PROXY);
  noProxyListLoaded = true;
  if (noProxy) {
    return noProxy.split(",").map((item) => item.trim()).filter((item) => item.length);
  }
  return [];
}
function getDefaultProxySettings(proxyUrl) {
  if (!proxyUrl) {
    proxyUrl = loadEnvironmentProxyValue();
    if (!proxyUrl) {
      return void 0;
    }
  }
  const parsedUrl = new URL(proxyUrl);
  const schema = parsedUrl.protocol ? parsedUrl.protocol + "//" : "";
  return {
    host: schema + parsedUrl.hostname,
    port: Number.parseInt(parsedUrl.port || "80"),
    username: parsedUrl.username,
    password: parsedUrl.password
  };
}
function getProxyAgentOptions(proxySettings, { headers, tlsSettings }) {
  let parsedProxyUrl;
  try {
    parsedProxyUrl = new URL(proxySettings.host);
  } catch (_error) {
    throw new Error(`Expecting a valid host string in proxy settings, but found "${proxySettings.host}".`);
  }
  if (tlsSettings) {
    logger$1.warning("TLS settings are not supported in combination with custom Proxy, certificates provided to the client will be ignored.");
  }
  const proxyAgentOptions = {
    hostname: parsedProxyUrl.hostname,
    port: proxySettings.port,
    protocol: parsedProxyUrl.protocol,
    headers: headers.toJSON()
  };
  if (proxySettings.username && proxySettings.password) {
    proxyAgentOptions.auth = `${proxySettings.username}:${proxySettings.password}`;
  } else if (proxySettings.username) {
    proxyAgentOptions.auth = `${proxySettings.username}`;
  }
  return proxyAgentOptions;
}
function setProxyAgentOnRequest(request3, cachedAgents) {
  if (request3.agent) {
    return;
  }
  const url = new URL(request3.url);
  const isInsecure = url.protocol !== "https:";
  const proxySettings = request3.proxySettings;
  if (proxySettings) {
    if (isInsecure) {
      if (!cachedAgents.httpProxyAgent) {
        const proxyAgentOptions = getProxyAgentOptions(proxySettings, request3);
        cachedAgents.httpProxyAgent = new dist.HttpProxyAgent(proxyAgentOptions);
      }
      request3.agent = cachedAgents.httpProxyAgent;
    } else {
      if (!cachedAgents.httpsProxyAgent) {
        const proxyAgentOptions = getProxyAgentOptions(proxySettings, request3);
        cachedAgents.httpsProxyAgent = new dist$2.HttpsProxyAgent(proxyAgentOptions);
      }
      request3.agent = cachedAgents.httpsProxyAgent;
    }
  }
}
function proxyPolicy(proxySettings = getDefaultProxySettings(), options2) {
  if (!noProxyListLoaded) {
    globalNoProxyList.push(...loadNoProxy());
  }
  const cachedAgents = {};
  return {
    name: proxyPolicyName,
    async sendRequest(request3, next) {
      var _a2;
      if (!request3.proxySettings && !isBypassed(request3.url, (_a2 = options2 === null || options2 === void 0 ? void 0 : options2.customNoProxyList) !== null && _a2 !== void 0 ? _a2 : globalNoProxyList, (options2 === null || options2 === void 0 ? void 0 : options2.customNoProxyList) ? void 0 : globalBypassedMap)) {
        request3.proxySettings = proxySettings;
      }
      if (request3.proxySettings) {
        setProxyAgentOnRequest(request3, cachedAgents);
      }
      return next(request3);
    }
  };
}
var setClientRequestIdPolicyName = "setClientRequestIdPolicy";
function setClientRequestIdPolicy(requestIdHeaderName = "x-ms-client-request-id") {
  return {
    name: setClientRequestIdPolicyName,
    async sendRequest(request3, next) {
      if (!request3.headers.has(requestIdHeaderName)) {
        request3.headers.set(requestIdHeaderName, request3.requestId);
      }
      return next(request3);
    }
  };
}
var tlsPolicyName = "tlsPolicy";
function tlsPolicy(tlsSettings) {
  return {
    name: tlsPolicyName,
    sendRequest: async (req, next) => {
      if (!req.tlsSettings) {
        req.tlsSettings = tlsSettings;
      }
      return next(req);
    }
  };
}
var knownContextKeys = {
  span: Symbol.for("@azure/core-tracing span"),
  namespace: Symbol.for("@azure/core-tracing namespace")
};
function createTracingContext(options2 = {}) {
  let context = new TracingContextImpl(options2.parentContext);
  if (options2.span) {
    context = context.setValue(knownContextKeys.span, options2.span);
  }
  if (options2.namespace) {
    context = context.setValue(knownContextKeys.namespace, options2.namespace);
  }
  return context;
}
var TracingContextImpl = class {
  constructor(initialContext) {
    this._contextMap = initialContext instanceof TracingContextImpl ? new Map(initialContext._contextMap) : /* @__PURE__ */ new Map();
  }
  setValue(key, value) {
    const newContext = new TracingContextImpl(this);
    newContext._contextMap.set(key, value);
    return newContext;
  }
  getValue(key) {
    return this._contextMap.get(key);
  }
  deleteValue(key) {
    const newContext = new TracingContextImpl(this);
    newContext._contextMap.delete(key);
    return newContext;
  }
};
function createDefaultTracingSpan() {
  return {
    end: () => {
    },
    isRecording: () => false,
    recordException: () => {
    },
    setAttribute: () => {
    },
    setStatus: () => {
    }
  };
}
function createDefaultInstrumenter() {
  return {
    createRequestHeaders: () => {
      return {};
    },
    parseTraceparentHeader: () => {
      return void 0;
    },
    startSpan: (_name, spanOptions) => {
      return {
        span: createDefaultTracingSpan(),
        tracingContext: createTracingContext({ parentContext: spanOptions.tracingContext })
      };
    },
    withContext(_context, callback, ...callbackArgs) {
      return callback(...callbackArgs);
    }
  };
}
var instrumenterImplementation;
function getInstrumenter() {
  if (!instrumenterImplementation) {
    instrumenterImplementation = createDefaultInstrumenter();
  }
  return instrumenterImplementation;
}
function createTracingClient(options2) {
  const { namespace, packageName, packageVersion } = options2;
  function startSpan(name, operationOptions, spanOptions) {
    var _a2;
    const startSpanResult = getInstrumenter().startSpan(name, Object.assign(Object.assign({}, spanOptions), { packageName, packageVersion, tracingContext: (_a2 = operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions) === null || _a2 === void 0 ? void 0 : _a2.tracingContext }));
    let tracingContext = startSpanResult.tracingContext;
    const span = startSpanResult.span;
    if (!tracingContext.getValue(knownContextKeys.namespace)) {
      tracingContext = tracingContext.setValue(knownContextKeys.namespace, namespace);
    }
    span.setAttribute("az.namespace", tracingContext.getValue(knownContextKeys.namespace));
    const updatedOptions = Object.assign({}, operationOptions, {
      tracingOptions: Object.assign(Object.assign({}, operationOptions === null || operationOptions === void 0 ? void 0 : operationOptions.tracingOptions), { tracingContext })
    });
    return {
      span,
      updatedOptions
    };
  }
  async function withSpan(name, operationOptions, callback, spanOptions) {
    const { span, updatedOptions } = startSpan(name, operationOptions, spanOptions);
    try {
      const result = await withContext(updatedOptions.tracingOptions.tracingContext, () => Promise.resolve(callback(updatedOptions, span)));
      span.setStatus({ status: "success" });
      return result;
    } catch (err) {
      span.setStatus({ status: "error", error: err });
      throw err;
    } finally {
      span.end();
    }
  }
  function withContext(context, callback, ...callbackArgs) {
    return getInstrumenter().withContext(context, callback, ...callbackArgs);
  }
  function parseTraceparentHeader(traceparentHeader) {
    return getInstrumenter().parseTraceparentHeader(traceparentHeader);
  }
  function createRequestHeaders(tracingContext) {
    return getInstrumenter().createRequestHeaders(tracingContext);
  }
  return {
    startSpan,
    withSpan,
    withContext,
    parseTraceparentHeader,
    createRequestHeaders
  };
}
var custom = import_util.inspect.custom;
var errorSanitizer = new Sanitizer();
var RestError = class extends Error {
  constructor(message, options2 = {}) {
    super(message);
    this.name = "RestError";
    this.code = options2.code;
    this.statusCode = options2.statusCode;
    this.request = options2.request;
    this.response = options2.response;
    Object.setPrototypeOf(this, RestError.prototype);
  }
  /**
   * Logging method for util.inspect in Node
   */
  [custom]() {
    return `RestError: ${this.message} 
 ${errorSanitizer.sanitize(this)}`;
  }
};
RestError.REQUEST_SEND_ERROR = "REQUEST_SEND_ERROR";
RestError.PARSE_ERROR = "PARSE_ERROR";
function isRestError(e) {
  if (e instanceof RestError) {
    return true;
  }
  return isError(e) && e.name === "RestError";
}
var tracingPolicyName = "tracingPolicy";
function tracingPolicy(options2 = {}) {
  const userAgent = getUserAgentValue(options2.userAgentPrefix);
  const tracingClient = tryCreateTracingClient();
  return {
    name: tracingPolicyName,
    async sendRequest(request3, next) {
      var _a2, _b;
      if (!tracingClient || !((_a2 = request3.tracingOptions) === null || _a2 === void 0 ? void 0 : _a2.tracingContext)) {
        return next(request3);
      }
      const { span, tracingContext } = (_b = tryCreateSpan(tracingClient, request3, userAgent)) !== null && _b !== void 0 ? _b : {};
      if (!span || !tracingContext) {
        return next(request3);
      }
      try {
        const response = await tracingClient.withContext(tracingContext, next, request3);
        tryProcessResponse(span, response);
        return response;
      } catch (err) {
        tryProcessError(span, err);
        throw err;
      }
    }
  };
}
function tryCreateTracingClient() {
  try {
    return createTracingClient({
      namespace: "",
      packageName: "@azure/core-rest-pipeline",
      packageVersion: SDK_VERSION
    });
  } catch (e) {
    logger$1.warning(`Error when creating the TracingClient: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryCreateSpan(tracingClient, request3, userAgent) {
  try {
    const { span, updatedOptions } = tracingClient.startSpan(`HTTP ${request3.method}`, { tracingOptions: request3.tracingOptions }, {
      spanKind: "client",
      spanAttributes: {
        "http.method": request3.method,
        "http.url": request3.url,
        requestId: request3.requestId
      }
    });
    if (!span.isRecording()) {
      span.end();
      return void 0;
    }
    if (userAgent) {
      span.setAttribute("http.user_agent", userAgent);
    }
    const headers = tracingClient.createRequestHeaders(updatedOptions.tracingOptions.tracingContext);
    for (const [key, value] of Object.entries(headers)) {
      request3.headers.set(key, value);
    }
    return { span, tracingContext: updatedOptions.tracingOptions.tracingContext };
  } catch (e) {
    logger$1.warning(`Skipping creating a tracing span due to an error: ${getErrorMessage(e)}`);
    return void 0;
  }
}
function tryProcessError(span, error) {
  try {
    span.setStatus({
      status: "error",
      error: isError(error) ? error : void 0
    });
    if (isRestError(error) && error.statusCode) {
      span.setAttribute("http.status_code", error.statusCode);
    }
    span.end();
  } catch (e) {
    logger$1.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}
function tryProcessResponse(span, response) {
  try {
    span.setAttribute("http.status_code", response.status);
    const serviceRequestId = response.headers.get("x-ms-request-id");
    if (serviceRequestId) {
      span.setAttribute("serviceRequestId", serviceRequestId);
    }
    span.setStatus({
      status: "success"
    });
    span.end();
  } catch (e) {
    logger$1.warning(`Skipping tracing span processing due to an error: ${getErrorMessage(e)}`);
  }
}
function createPipelineFromOptions(options2) {
  const pipeline = createEmptyPipeline();
  if (isNode) {
    if (options2.tlsOptions) {
      pipeline.addPolicy(tlsPolicy(options2.tlsOptions));
    }
    pipeline.addPolicy(proxyPolicy(options2.proxyOptions));
    pipeline.addPolicy(decompressResponsePolicy());
  }
  pipeline.addPolicy(formDataPolicy());
  pipeline.addPolicy(userAgentPolicy(options2.userAgentOptions));
  pipeline.addPolicy(setClientRequestIdPolicy());
  pipeline.addPolicy(defaultRetryPolicy(options2.retryOptions), { phase: "Retry" });
  pipeline.addPolicy(tracingPolicy(options2.userAgentOptions), { afterPhase: "Retry" });
  if (isNode) {
    pipeline.addPolicy(redirectPolicy(options2.redirectOptions), { afterPhase: "Retry" });
  }
  pipeline.addPolicy(logPolicy(options2.loggingOptions), { afterPhase: "Sign" });
  return pipeline;
}
function normalizeName(name) {
  return name.toLowerCase();
}
function* headerIterator(map) {
  for (const entry of map.values()) {
    yield [entry.name, entry.value];
  }
}
var HttpHeadersImpl = class {
  constructor(rawHeaders) {
    this._headersMap = /* @__PURE__ */ new Map();
    if (rawHeaders) {
      for (const headerName of Object.keys(rawHeaders)) {
        this.set(headerName, rawHeaders[headerName]);
      }
    }
  }
  /**
   * Set a header in this collection with the provided name and value. The name is
   * case-insensitive.
   * @param name - The name of the header to set. This value is case-insensitive.
   * @param value - The value of the header to set.
   */
  set(name, value) {
    this._headersMap.set(normalizeName(name), { name, value: String(value) });
  }
  /**
   * Get the header value for the provided header name, or undefined if no header exists in this
   * collection with the provided name.
   * @param name - The name of the header. This value is case-insensitive.
   */
  get(name) {
    var _a2;
    return (_a2 = this._headersMap.get(normalizeName(name))) === null || _a2 === void 0 ? void 0 : _a2.value;
  }
  /**
   * Get whether or not this header collection contains a header entry for the provided header name.
   * @param name - The name of the header to set. This value is case-insensitive.
   */
  has(name) {
    return this._headersMap.has(normalizeName(name));
  }
  /**
   * Remove the header with the provided headerName.
   * @param name - The name of the header to remove.
   */
  delete(name) {
    this._headersMap.delete(normalizeName(name));
  }
  /**
   * Get the JSON object representation of this HTTP header collection.
   */
  toJSON(options2 = {}) {
    const result = {};
    if (options2.preserveCase) {
      for (const entry of this._headersMap.values()) {
        result[entry.name] = entry.value;
      }
    } else {
      for (const [normalizedName, entry] of this._headersMap) {
        result[normalizedName] = entry.value;
      }
    }
    return result;
  }
  /**
   * Get the string representation of this HTTP header collection.
   */
  toString() {
    return JSON.stringify(this.toJSON({ preserveCase: true }));
  }
  /**
   * Iterate over tuples of header [name, value] pairs.
   */
  [Symbol.iterator]() {
    return headerIterator(this._headersMap);
  }
};
function createHttpHeaders(rawHeaders) {
  return new HttpHeadersImpl(rawHeaders);
}
var DEFAULT_TLS_SETTINGS = {};
function isReadableStream(body2) {
  return body2 && typeof body2.pipe === "function";
}
function isStreamComplete(stream) {
  return new Promise((resolve) => {
    stream.on("close", resolve);
    stream.on("end", resolve);
    stream.on("error", resolve);
  });
}
function isArrayBuffer(body2) {
  return body2 && typeof body2.byteLength === "number";
}
var ReportTransform = class extends import_stream.Transform {
  // eslint-disable-next-line @typescript-eslint/ban-types
  _transform(chunk, _encoding, callback) {
    this.push(chunk);
    this.loadedBytes += chunk.length;
    try {
      this.progressCallback({ loadedBytes: this.loadedBytes });
      callback();
    } catch (e) {
      callback(e);
    }
  }
  constructor(progressCallback) {
    super();
    this.loadedBytes = 0;
    this.progressCallback = progressCallback;
  }
};
var NodeHttpClient = class {
  constructor() {
    this.cachedHttpsAgents = /* @__PURE__ */ new WeakMap();
  }
  /**
   * Makes a request over an underlying transport layer and returns the response.
   * @param request - The request to be made.
   */
  async sendRequest(request3) {
    var _a2, _b, _c;
    const abortController = new AbortController();
    let abortListener;
    if (request3.abortSignal) {
      if (request3.abortSignal.aborted) {
        throw new AbortError("The operation was aborted.");
      }
      abortListener = (event) => {
        if (event.type === "abort") {
          abortController.abort();
        }
      };
      request3.abortSignal.addEventListener("abort", abortListener);
    }
    if (request3.timeout > 0) {
      setTimeout(() => {
        abortController.abort();
      }, request3.timeout);
    }
    const acceptEncoding = request3.headers.get("Accept-Encoding");
    const shouldDecompress = (acceptEncoding === null || acceptEncoding === void 0 ? void 0 : acceptEncoding.includes("gzip")) || (acceptEncoding === null || acceptEncoding === void 0 ? void 0 : acceptEncoding.includes("deflate"));
    let body2 = typeof request3.body === "function" ? request3.body() : request3.body;
    if (body2 && !request3.headers.has("Content-Length")) {
      const bodyLength = getBodyLength(body2);
      if (bodyLength !== null) {
        request3.headers.set("Content-Length", bodyLength);
      }
    }
    let responseStream;
    try {
      if (body2 && request3.onUploadProgress) {
        const onUploadProgress = request3.onUploadProgress;
        const uploadReportStream = new ReportTransform(onUploadProgress);
        uploadReportStream.on("error", (e) => {
          logger$1.error("Error in upload progress", e);
        });
        if (isReadableStream(body2)) {
          body2.pipe(uploadReportStream);
        } else {
          uploadReportStream.end(body2);
        }
        body2 = uploadReportStream;
      }
      const res = await this.makeRequest(request3, abortController, body2);
      const headers = getResponseHeaders(res);
      const status = (_a2 = res.statusCode) !== null && _a2 !== void 0 ? _a2 : 0;
      const response = {
        status,
        headers,
        request: request3
      };
      if (request3.method === "HEAD") {
        res.resume();
        return response;
      }
      responseStream = shouldDecompress ? getDecodedResponseStream(res, headers) : res;
      const onDownloadProgress = request3.onDownloadProgress;
      if (onDownloadProgress) {
        const downloadReportStream = new ReportTransform(onDownloadProgress);
        downloadReportStream.on("error", (e) => {
          logger$1.error("Error in download progress", e);
        });
        responseStream.pipe(downloadReportStream);
        responseStream = downloadReportStream;
      }
      if (
        // Value of POSITIVE_INFINITY in streamResponseStatusCodes is considered as any status code
        ((_b = request3.streamResponseStatusCodes) === null || _b === void 0 ? void 0 : _b.has(Number.POSITIVE_INFINITY)) || ((_c = request3.streamResponseStatusCodes) === null || _c === void 0 ? void 0 : _c.has(response.status))
      ) {
        response.readableStreamBody = responseStream;
      } else {
        response.bodyAsText = await streamToText(responseStream);
      }
      return response;
    } finally {
      if (request3.abortSignal && abortListener) {
        let uploadStreamDone = Promise.resolve();
        if (isReadableStream(body2)) {
          uploadStreamDone = isStreamComplete(body2);
        }
        let downloadStreamDone = Promise.resolve();
        if (isReadableStream(responseStream)) {
          downloadStreamDone = isStreamComplete(responseStream);
        }
        Promise.all([uploadStreamDone, downloadStreamDone]).then(() => {
          var _a3;
          if (abortListener) {
            (_a3 = request3.abortSignal) === null || _a3 === void 0 ? void 0 : _a3.removeEventListener("abort", abortListener);
          }
        }).catch((e) => {
          logger$1.warning("Error when cleaning up abortListener on httpRequest", e);
        });
      }
    }
  }
  makeRequest(request3, abortController, body2) {
    var _a2;
    const url = new URL(request3.url);
    const isInsecure = url.protocol !== "https:";
    if (isInsecure && !request3.allowInsecureConnection) {
      throw new Error(`Cannot connect to ${request3.url} while allowInsecureConnection is false.`);
    }
    const agent2 = (_a2 = request3.agent) !== null && _a2 !== void 0 ? _a2 : this.getOrCreateAgent(request3, isInsecure);
    const options2 = {
      agent: agent2,
      hostname: url.hostname,
      path: `${url.pathname}${url.search}`,
      port: url.port,
      method: request3.method,
      headers: request3.headers.toJSON({ preserveCase: true })
    };
    return new Promise((resolve, reject) => {
      const req = isInsecure ? http$1.request(options2, resolve) : https$1.request(options2, resolve);
      req.once("error", (err) => {
        var _a3;
        reject(new RestError(err.message, { code: (_a3 = err.code) !== null && _a3 !== void 0 ? _a3 : RestError.REQUEST_SEND_ERROR, request: request3 }));
      });
      abortController.signal.addEventListener("abort", () => {
        const abortError = new AbortError("The operation was aborted.");
        req.destroy(abortError);
        reject(abortError);
      });
      if (body2 && isReadableStream(body2)) {
        body2.pipe(req);
      } else if (body2) {
        if (typeof body2 === "string" || Buffer.isBuffer(body2)) {
          req.end(body2);
        } else if (isArrayBuffer(body2)) {
          req.end(ArrayBuffer.isView(body2) ? Buffer.from(body2.buffer) : Buffer.from(body2));
        } else {
          logger$1.error("Unrecognized body type", body2);
          reject(new RestError("Unrecognized body type"));
        }
      } else {
        req.end();
      }
    });
  }
  getOrCreateAgent(request3, isInsecure) {
    var _a2;
    const disableKeepAlive = request3.disableKeepAlive;
    if (isInsecure) {
      if (disableKeepAlive) {
        return http$1.globalAgent;
      }
      if (!this.cachedHttpAgent) {
        this.cachedHttpAgent = new http$1.Agent({ keepAlive: true });
      }
      return this.cachedHttpAgent;
    } else {
      if (disableKeepAlive && !request3.tlsSettings) {
        return https$1.globalAgent;
      }
      const tlsSettings = (_a2 = request3.tlsSettings) !== null && _a2 !== void 0 ? _a2 : DEFAULT_TLS_SETTINGS;
      let agent2 = this.cachedHttpsAgents.get(tlsSettings);
      if (agent2 && agent2.options.keepAlive === !disableKeepAlive) {
        return agent2;
      }
      logger$1.info("No cached TLS Agent exist, creating a new Agent");
      agent2 = new https$1.Agent(Object.assign({
        // keepAlive is true if disableKeepAlive is false.
        keepAlive: !disableKeepAlive
      }, tlsSettings));
      this.cachedHttpsAgents.set(tlsSettings, agent2);
      return agent2;
    }
  }
};
function getResponseHeaders(res) {
  const headers = createHttpHeaders();
  for (const header of Object.keys(res.headers)) {
    const value = res.headers[header];
    if (Array.isArray(value)) {
      if (value.length > 0) {
        headers.set(header, value[0]);
      }
    } else if (value) {
      headers.set(header, value);
    }
  }
  return headers;
}
function getDecodedResponseStream(stream, headers) {
  const contentEncoding = headers.get("Content-Encoding");
  if (contentEncoding === "gzip") {
    const unzip = zlib.createGunzip();
    stream.pipe(unzip);
    return unzip;
  } else if (contentEncoding === "deflate") {
    const inflate = zlib.createInflate();
    stream.pipe(inflate);
    return inflate;
  }
  return stream;
}
function streamToText(stream) {
  return new Promise((resolve, reject) => {
    const buffer = [];
    stream.on("data", (chunk) => {
      if (Buffer.isBuffer(chunk)) {
        buffer.push(chunk);
      } else {
        buffer.push(Buffer.from(chunk));
      }
    });
    stream.on("end", () => {
      resolve(Buffer.concat(buffer).toString("utf8"));
    });
    stream.on("error", (e) => {
      if (e && (e === null || e === void 0 ? void 0 : e.name) === "AbortError") {
        reject(e);
      } else {
        reject(new RestError(`Error reading response as text: ${e.message}`, {
          code: RestError.PARSE_ERROR
        }));
      }
    });
  });
}
function getBodyLength(body2) {
  if (!body2) {
    return 0;
  } else if (Buffer.isBuffer(body2)) {
    return body2.length;
  } else if (isReadableStream(body2)) {
    return null;
  } else if (isArrayBuffer(body2)) {
    return body2.byteLength;
  } else if (typeof body2 === "string") {
    return Buffer.from(body2).length;
  } else {
    return null;
  }
}
function createNodeHttpClient() {
  return new NodeHttpClient();
}
function createDefaultHttpClient() {
  return createNodeHttpClient();
}
var PipelineRequestImpl = class {
  constructor(options2) {
    var _a2, _b, _c, _d, _e, _f, _g;
    this.url = options2.url;
    this.body = options2.body;
    this.headers = (_a2 = options2.headers) !== null && _a2 !== void 0 ? _a2 : createHttpHeaders();
    this.method = (_b = options2.method) !== null && _b !== void 0 ? _b : "GET";
    this.timeout = (_c = options2.timeout) !== null && _c !== void 0 ? _c : 0;
    this.formData = options2.formData;
    this.disableKeepAlive = (_d = options2.disableKeepAlive) !== null && _d !== void 0 ? _d : false;
    this.proxySettings = options2.proxySettings;
    this.streamResponseStatusCodes = options2.streamResponseStatusCodes;
    this.withCredentials = (_e = options2.withCredentials) !== null && _e !== void 0 ? _e : false;
    this.abortSignal = options2.abortSignal;
    this.tracingOptions = options2.tracingOptions;
    this.onUploadProgress = options2.onUploadProgress;
    this.onDownloadProgress = options2.onDownloadProgress;
    this.requestId = options2.requestId || randomUUID();
    this.allowInsecureConnection = (_f = options2.allowInsecureConnection) !== null && _f !== void 0 ? _f : false;
    this.enableBrowserStreams = (_g = options2.enableBrowserStreams) !== null && _g !== void 0 ? _g : false;
  }
};
function createPipelineRequest(options2) {
  return new PipelineRequestImpl(options2);
}
var DEFAULT_CYCLER_OPTIONS = {
  forcedRefreshWindowInMs: 1e3,
  retryIntervalInMs: 3e3,
  refreshWindowInMs: 1e3 * 60 * 2
  // Start refreshing 2m before expiry
};
async function beginRefresh(getAccessToken, retryIntervalInMs, refreshTimeout) {
  async function tryGetAccessToken() {
    if (Date.now() < refreshTimeout) {
      try {
        return await getAccessToken();
      } catch (_a2) {
        return null;
      }
    } else {
      const finalToken = await getAccessToken();
      if (finalToken === null) {
        throw new Error("Failed to refresh access token.");
      }
      return finalToken;
    }
  }
  let token = await tryGetAccessToken();
  while (token === null) {
    await delay(retryIntervalInMs);
    token = await tryGetAccessToken();
  }
  return token;
}
function createTokenCycler(credential, tokenCyclerOptions) {
  let refreshWorker = null;
  let token = null;
  let tenantId;
  const options2 = Object.assign(Object.assign({}, DEFAULT_CYCLER_OPTIONS), tokenCyclerOptions);
  const cycler = {
    /**
     * Produces true if a refresh job is currently in progress.
     */
    get isRefreshing() {
      return refreshWorker !== null;
    },
    /**
     * Produces true if the cycler SHOULD refresh (we are within the refresh
     * window and not already refreshing)
     */
    get shouldRefresh() {
      var _a2;
      return !cycler.isRefreshing && ((_a2 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a2 !== void 0 ? _a2 : 0) - options2.refreshWindowInMs < Date.now();
    },
    /**
     * Produces true if the cycler MUST refresh (null or nearly-expired
     * token).
     */
    get mustRefresh() {
      return token === null || token.expiresOnTimestamp - options2.forcedRefreshWindowInMs < Date.now();
    }
  };
  function refresh(scopes, getTokenOptions) {
    var _a2;
    if (!cycler.isRefreshing) {
      const tryGetAccessToken = () => credential.getToken(scopes, getTokenOptions);
      refreshWorker = beginRefresh(
        tryGetAccessToken,
        options2.retryIntervalInMs,
        // If we don't have a token, then we should timeout immediately
        (_a2 = token === null || token === void 0 ? void 0 : token.expiresOnTimestamp) !== null && _a2 !== void 0 ? _a2 : Date.now()
      ).then((_token) => {
        refreshWorker = null;
        token = _token;
        tenantId = getTokenOptions.tenantId;
        return token;
      }).catch((reason) => {
        refreshWorker = null;
        token = null;
        tenantId = void 0;
        throw reason;
      });
    }
    return refreshWorker;
  }
  return async (scopes, tokenOptions) => {
    const mustRefresh = tenantId !== tokenOptions.tenantId || Boolean(tokenOptions.claims) || cycler.mustRefresh;
    if (mustRefresh)
      return refresh(scopes, tokenOptions);
    if (cycler.shouldRefresh) {
      refresh(scopes, tokenOptions);
    }
    return token;
  };
}
var bearerTokenAuthenticationPolicyName = "bearerTokenAuthenticationPolicy";
async function defaultAuthorizeRequest(options2) {
  const { scopes, getAccessToken, request: request3 } = options2;
  const getTokenOptions = {
    abortSignal: request3.abortSignal,
    tracingOptions: request3.tracingOptions
  };
  const accessToken = await getAccessToken(scopes, getTokenOptions);
  if (accessToken) {
    options2.request.headers.set("Authorization", `Bearer ${accessToken.token}`);
  }
}
function getChallenge(response) {
  const challenge = response.headers.get("WWW-Authenticate");
  if (response.status === 401 && challenge) {
    return challenge;
  }
  return;
}
function bearerTokenAuthenticationPolicy(options2) {
  var _a2;
  const { credential, scopes, challengeCallbacks } = options2;
  const logger2 = options2.logger || logger$1;
  const callbacks = Object.assign({ authorizeRequest: (_a2 = challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequest) !== null && _a2 !== void 0 ? _a2 : defaultAuthorizeRequest, authorizeRequestOnChallenge: challengeCallbacks === null || challengeCallbacks === void 0 ? void 0 : challengeCallbacks.authorizeRequestOnChallenge }, challengeCallbacks);
  const getAccessToken = credential ? createTokenCycler(
    credential
    /* , options */
  ) : () => Promise.resolve(null);
  return {
    name: bearerTokenAuthenticationPolicyName,
    /**
     * If there's no challenge parameter:
     * - It will try to retrieve the token using the cache, or the credential's getToken.
     * - Then it will try the next policy with or without the retrieved token.
     *
     * It uses the challenge parameters to:
     * - Skip a first attempt to get the token from the credential if there's no cached token,
     *   since it expects the token to be retrievable only after the challenge.
     * - Prepare the outgoing request if the `prepareRequest` method has been provided.
     * - Send an initial request to receive the challenge if it fails.
     * - Process a challenge if the response contains it.
     * - Retrieve a token with the challenge information, then re-send the request.
     */
    async sendRequest(request3, next) {
      if (!request3.url.toLowerCase().startsWith("https://")) {
        throw new Error("Bearer token authentication is not permitted for non-TLS protected (non-https) URLs.");
      }
      await callbacks.authorizeRequest({
        scopes: Array.isArray(scopes) ? scopes : [scopes],
        request: request3,
        getAccessToken,
        logger: logger2
      });
      let response;
      let error;
      try {
        response = await next(request3);
      } catch (err) {
        error = err;
        response = err.response;
      }
      if (callbacks.authorizeRequestOnChallenge && (response === null || response === void 0 ? void 0 : response.status) === 401 && getChallenge(response)) {
        const shouldSendRequest = await callbacks.authorizeRequestOnChallenge({
          scopes: Array.isArray(scopes) ? scopes : [scopes],
          request: request3,
          response,
          getAccessToken,
          logger: logger2
        });
        if (shouldSendRequest) {
          return next(request3);
        }
      }
      if (error) {
        throw error;
      } else {
        return response;
      }
    }
  };
}
function getOperationArgumentValueFromParameter(operationArguments, parameter, fallbackObject) {
  let parameterPath = parameter.parameterPath;
  const parameterMapper = parameter.mapper;
  let value;
  if (typeof parameterPath === "string") {
    parameterPath = [parameterPath];
  }
  if (Array.isArray(parameterPath)) {
    if (parameterPath.length > 0) {
      if (parameterMapper.isConstant) {
        value = parameterMapper.defaultValue;
      } else {
        let propertySearchResult = getPropertyFromParameterPath(operationArguments, parameterPath);
        if (!propertySearchResult.propertyFound && fallbackObject) {
          propertySearchResult = getPropertyFromParameterPath(fallbackObject, parameterPath);
        }
        let useDefaultValue = false;
        if (!propertySearchResult.propertyFound) {
          useDefaultValue = parameterMapper.required || parameterPath[0] === "options" && parameterPath.length === 2;
        }
        value = useDefaultValue ? parameterMapper.defaultValue : propertySearchResult.propertyValue;
      }
    }
  } else {
    if (parameterMapper.required) {
      value = {};
    }
    for (const propertyName in parameterPath) {
      const propertyMapper = parameterMapper.type.modelProperties[propertyName];
      const propertyPath = parameterPath[propertyName];
      const propertyValue = getOperationArgumentValueFromParameter(operationArguments, {
        parameterPath: propertyPath,
        mapper: propertyMapper
      }, fallbackObject);
      if (propertyValue !== void 0) {
        if (!value) {
          value = {};
        }
        value[propertyName] = propertyValue;
      }
    }
  }
  return value;
}
function getPropertyFromParameterPath(parent, parameterPath) {
  const result = { propertyFound: false };
  let i = 0;
  for (; i < parameterPath.length; ++i) {
    const parameterPathPart = parameterPath[i];
    if (parent && parameterPathPart in parent) {
      parent = parent[parameterPathPart];
    } else {
      break;
    }
  }
  if (i === parameterPath.length) {
    result.propertyValue = parent;
    result.propertyFound = true;
  }
  return result;
}
var operationRequestMap = /* @__PURE__ */ new WeakMap();
var originalRequestSymbol = Symbol.for("@azure/core-client original request");
function hasOriginalRequest(request3) {
  return originalRequestSymbol in request3;
}
function getOperationRequestInfo(request3) {
  if (hasOriginalRequest(request3)) {
    return getOperationRequestInfo(request3[originalRequestSymbol]);
  }
  let info = operationRequestMap.get(request3);
  if (!info) {
    info = {};
    operationRequestMap.set(request3, info);
  }
  return info;
}
var defaultJsonContentTypes = ["application/json", "text/json"];
var defaultXmlContentTypes = ["application/xml", "application/atom+xml"];
var deserializationPolicyName = "deserializationPolicy";
function deserializationPolicy(options2 = {}) {
  var _a2, _b, _c, _d, _e, _f, _g;
  const jsonContentTypes = (_b = (_a2 = options2.expectedContentTypes) === null || _a2 === void 0 ? void 0 : _a2.json) !== null && _b !== void 0 ? _b : defaultJsonContentTypes;
  const xmlContentTypes = (_d = (_c = options2.expectedContentTypes) === null || _c === void 0 ? void 0 : _c.xml) !== null && _d !== void 0 ? _d : defaultXmlContentTypes;
  const parseXML = options2.parseXML;
  const serializerOptions = options2.serializerOptions;
  const updatedOptions = {
    xml: {
      rootName: (_e = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.rootName) !== null && _e !== void 0 ? _e : "",
      includeRoot: (_f = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.includeRoot) !== null && _f !== void 0 ? _f : false,
      xmlCharKey: (_g = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.xmlCharKey) !== null && _g !== void 0 ? _g : XML_CHARKEY
    }
  };
  return {
    name: deserializationPolicyName,
    async sendRequest(request3, next) {
      const response = await next(request3);
      return deserializeResponseBody(jsonContentTypes, xmlContentTypes, response, updatedOptions, parseXML);
    }
  };
}
function getOperationResponseMap(parsedResponse) {
  let result;
  const request3 = parsedResponse.request;
  const operationInfo = getOperationRequestInfo(request3);
  const operationSpec = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationSpec;
  if (operationSpec) {
    if (!(operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationResponseGetter)) {
      result = operationSpec.responses[parsedResponse.status];
    } else {
      result = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationResponseGetter(operationSpec, parsedResponse);
    }
  }
  return result;
}
function shouldDeserializeResponse(parsedResponse) {
  const request3 = parsedResponse.request;
  const operationInfo = getOperationRequestInfo(request3);
  const shouldDeserialize = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.shouldDeserialize;
  let result;
  if (shouldDeserialize === void 0) {
    result = true;
  } else if (typeof shouldDeserialize === "boolean") {
    result = shouldDeserialize;
  } else {
    result = shouldDeserialize(parsedResponse);
  }
  return result;
}
async function deserializeResponseBody(jsonContentTypes, xmlContentTypes, response, options2, parseXML) {
  const parsedResponse = await parse(jsonContentTypes, xmlContentTypes, response, options2, parseXML);
  if (!shouldDeserializeResponse(parsedResponse)) {
    return parsedResponse;
  }
  const operationInfo = getOperationRequestInfo(parsedResponse.request);
  const operationSpec = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationSpec;
  if (!operationSpec || !operationSpec.responses) {
    return parsedResponse;
  }
  const responseSpec = getOperationResponseMap(parsedResponse);
  const { error, shouldReturnResponse } = handleErrorResponse(parsedResponse, operationSpec, responseSpec, options2);
  if (error) {
    throw error;
  } else if (shouldReturnResponse) {
    return parsedResponse;
  }
  if (responseSpec) {
    if (responseSpec.bodyMapper) {
      let valueToDeserialize = parsedResponse.parsedBody;
      if (operationSpec.isXML && responseSpec.bodyMapper.type.name === MapperTypeNames.Sequence) {
        valueToDeserialize = typeof valueToDeserialize === "object" ? valueToDeserialize[responseSpec.bodyMapper.xmlElementName] : [];
      }
      try {
        parsedResponse.parsedBody = operationSpec.serializer.deserialize(responseSpec.bodyMapper, valueToDeserialize, "operationRes.parsedBody", options2);
      } catch (deserializeError) {
        const restError = new RestError(`Error ${deserializeError} occurred in deserializing the responseBody - ${parsedResponse.bodyAsText}`, {
          statusCode: parsedResponse.status,
          request: parsedResponse.request,
          response: parsedResponse
        });
        throw restError;
      }
    } else if (operationSpec.httpMethod === "HEAD") {
      parsedResponse.parsedBody = response.status >= 200 && response.status < 300;
    }
    if (responseSpec.headersMapper) {
      parsedResponse.parsedHeaders = operationSpec.serializer.deserialize(responseSpec.headersMapper, parsedResponse.headers.toJSON(), "operationRes.parsedHeaders", { xml: {}, ignoreUnknownProperties: true });
    }
  }
  return parsedResponse;
}
function isOperationSpecEmpty(operationSpec) {
  const expectedStatusCodes = Object.keys(operationSpec.responses);
  return expectedStatusCodes.length === 0 || expectedStatusCodes.length === 1 && expectedStatusCodes[0] === "default";
}
function handleErrorResponse(parsedResponse, operationSpec, responseSpec, options2) {
  var _a2;
  const isSuccessByStatus = 200 <= parsedResponse.status && parsedResponse.status < 300;
  const isExpectedStatusCode = isOperationSpecEmpty(operationSpec) ? isSuccessByStatus : !!responseSpec;
  if (isExpectedStatusCode) {
    if (responseSpec) {
      if (!responseSpec.isError) {
        return { error: null, shouldReturnResponse: false };
      }
    } else {
      return { error: null, shouldReturnResponse: false };
    }
  }
  const errorResponseSpec = responseSpec !== null && responseSpec !== void 0 ? responseSpec : operationSpec.responses.default;
  const initialErrorMessage = ((_a2 = parsedResponse.request.streamResponseStatusCodes) === null || _a2 === void 0 ? void 0 : _a2.has(parsedResponse.status)) ? `Unexpected status code: ${parsedResponse.status}` : parsedResponse.bodyAsText;
  const error = new RestError(initialErrorMessage, {
    statusCode: parsedResponse.status,
    request: parsedResponse.request,
    response: parsedResponse
  });
  if (!errorResponseSpec) {
    throw error;
  }
  const defaultBodyMapper = errorResponseSpec.bodyMapper;
  const defaultHeadersMapper = errorResponseSpec.headersMapper;
  try {
    if (parsedResponse.parsedBody) {
      const parsedBody = parsedResponse.parsedBody;
      let deserializedError;
      if (defaultBodyMapper) {
        let valueToDeserialize = parsedBody;
        if (operationSpec.isXML && defaultBodyMapper.type.name === MapperTypeNames.Sequence) {
          valueToDeserialize = [];
          const elementName = defaultBodyMapper.xmlElementName;
          if (typeof parsedBody === "object" && elementName) {
            valueToDeserialize = parsedBody[elementName];
          }
        }
        deserializedError = operationSpec.serializer.deserialize(defaultBodyMapper, valueToDeserialize, "error.response.parsedBody", options2);
      }
      const internalError = parsedBody.error || deserializedError || parsedBody;
      error.code = internalError.code;
      if (internalError.message) {
        error.message = internalError.message;
      }
      if (defaultBodyMapper) {
        error.response.parsedBody = deserializedError;
      }
    }
    if (parsedResponse.headers && defaultHeadersMapper) {
      error.response.parsedHeaders = operationSpec.serializer.deserialize(defaultHeadersMapper, parsedResponse.headers.toJSON(), "operationRes.parsedHeaders");
    }
  } catch (defaultError) {
    error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody - "${parsedResponse.bodyAsText}" for the default response.`;
  }
  return { error, shouldReturnResponse: false };
}
async function parse(jsonContentTypes, xmlContentTypes, operationResponse, opts, parseXML) {
  var _a2;
  if (!((_a2 = operationResponse.request.streamResponseStatusCodes) === null || _a2 === void 0 ? void 0 : _a2.has(operationResponse.status)) && operationResponse.bodyAsText) {
    const text = operationResponse.bodyAsText;
    const contentType2 = operationResponse.headers.get("Content-Type") || "";
    const contentComponents = !contentType2 ? [] : contentType2.split(";").map((component) => component.toLowerCase());
    try {
      if (contentComponents.length === 0 || contentComponents.some((component) => jsonContentTypes.indexOf(component) !== -1)) {
        operationResponse.parsedBody = JSON.parse(text);
        return operationResponse;
      } else if (contentComponents.some((component) => xmlContentTypes.indexOf(component) !== -1)) {
        if (!parseXML) {
          throw new Error("Parsing XML not supported.");
        }
        const body2 = await parseXML(text, opts.xml);
        operationResponse.parsedBody = body2;
        return operationResponse;
      }
    } catch (err) {
      const msg = `Error "${err}" occurred while parsing the response body - ${operationResponse.bodyAsText}.`;
      const errCode = err.code || RestError.PARSE_ERROR;
      const e = new RestError(msg, {
        code: errCode,
        statusCode: operationResponse.status,
        request: operationResponse.request,
        response: operationResponse
      });
      throw e;
    }
  }
  return operationResponse;
}
function getStreamingResponseStatusCodes(operationSpec) {
  const result = /* @__PURE__ */ new Set();
  for (const statusCode in operationSpec.responses) {
    const operationResponse = operationSpec.responses[statusCode];
    if (operationResponse.bodyMapper && operationResponse.bodyMapper.type.name === MapperTypeNames.Stream) {
      result.add(Number(statusCode));
    }
  }
  return result;
}
function getPathStringFromParameter(parameter) {
  const { parameterPath, mapper } = parameter;
  let result;
  if (typeof parameterPath === "string") {
    result = parameterPath;
  } else if (Array.isArray(parameterPath)) {
    result = parameterPath.join(".");
  } else {
    result = mapper.serializedName;
  }
  return result;
}
var serializationPolicyName = "serializationPolicy";
function serializationPolicy(options2 = {}) {
  const stringifyXML = options2.stringifyXML;
  return {
    name: serializationPolicyName,
    async sendRequest(request3, next) {
      const operationInfo = getOperationRequestInfo(request3);
      const operationSpec = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationSpec;
      const operationArguments = operationInfo === null || operationInfo === void 0 ? void 0 : operationInfo.operationArguments;
      if (operationSpec && operationArguments) {
        serializeHeaders(request3, operationArguments, operationSpec);
        serializeRequestBody(request3, operationArguments, operationSpec, stringifyXML);
      }
      return next(request3);
    }
  };
}
function serializeHeaders(request3, operationArguments, operationSpec) {
  var _a2, _b;
  if (operationSpec.headerParameters) {
    for (const headerParameter of operationSpec.headerParameters) {
      let headerValue = getOperationArgumentValueFromParameter(operationArguments, headerParameter);
      if (headerValue !== null && headerValue !== void 0 || headerParameter.mapper.required) {
        headerValue = operationSpec.serializer.serialize(headerParameter.mapper, headerValue, getPathStringFromParameter(headerParameter));
        const headerCollectionPrefix = headerParameter.mapper.headerCollectionPrefix;
        if (headerCollectionPrefix) {
          for (const key of Object.keys(headerValue)) {
            request3.headers.set(headerCollectionPrefix + key, headerValue[key]);
          }
        } else {
          request3.headers.set(headerParameter.mapper.serializedName || getPathStringFromParameter(headerParameter), headerValue);
        }
      }
    }
  }
  const customHeaders = (_b = (_a2 = operationArguments.options) === null || _a2 === void 0 ? void 0 : _a2.requestOptions) === null || _b === void 0 ? void 0 : _b.customHeaders;
  if (customHeaders) {
    for (const customHeaderName of Object.keys(customHeaders)) {
      request3.headers.set(customHeaderName, customHeaders[customHeaderName]);
    }
  }
}
function serializeRequestBody(request3, operationArguments, operationSpec, stringifyXML = function() {
  throw new Error("XML serialization unsupported!");
}) {
  var _a2, _b, _c, _d, _e;
  const serializerOptions = (_a2 = operationArguments.options) === null || _a2 === void 0 ? void 0 : _a2.serializerOptions;
  const updatedOptions = {
    xml: {
      rootName: (_b = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.rootName) !== null && _b !== void 0 ? _b : "",
      includeRoot: (_c = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.includeRoot) !== null && _c !== void 0 ? _c : false,
      xmlCharKey: (_d = serializerOptions === null || serializerOptions === void 0 ? void 0 : serializerOptions.xml.xmlCharKey) !== null && _d !== void 0 ? _d : XML_CHARKEY
    }
  };
  const xmlCharKey = updatedOptions.xml.xmlCharKey;
  if (operationSpec.requestBody && operationSpec.requestBody.mapper) {
    request3.body = getOperationArgumentValueFromParameter(operationArguments, operationSpec.requestBody);
    const bodyMapper = operationSpec.requestBody.mapper;
    const { required, serializedName, xmlName, xmlElementName, xmlNamespace, xmlNamespacePrefix, nullable } = bodyMapper;
    const typeName = bodyMapper.type.name;
    try {
      if (request3.body !== void 0 && request3.body !== null || nullable && request3.body === null || required) {
        const requestBodyParameterPathString = getPathStringFromParameter(operationSpec.requestBody);
        request3.body = operationSpec.serializer.serialize(bodyMapper, request3.body, requestBodyParameterPathString, updatedOptions);
        const isStream = typeName === MapperTypeNames.Stream;
        if (operationSpec.isXML) {
          const xmlnsKey = xmlNamespacePrefix ? `xmlns:${xmlNamespacePrefix}` : "xmlns";
          const value = getXmlValueWithNamespace(xmlNamespace, xmlnsKey, typeName, request3.body, updatedOptions);
          if (typeName === MapperTypeNames.Sequence) {
            request3.body = stringifyXML(prepareXMLRootList(value, xmlElementName || xmlName || serializedName, xmlnsKey, xmlNamespace), { rootName: xmlName || serializedName, xmlCharKey });
          } else if (!isStream) {
            request3.body = stringifyXML(value, {
              rootName: xmlName || serializedName,
              xmlCharKey
            });
          }
        } else if (typeName === MapperTypeNames.String && (((_e = operationSpec.contentType) === null || _e === void 0 ? void 0 : _e.match("text/plain")) || operationSpec.mediaType === "text")) {
          return;
        } else if (!isStream) {
          request3.body = JSON.stringify(request3.body);
        }
      }
    } catch (error) {
      throw new Error(`Error "${error.message}" occurred in serializing the payload - ${JSON.stringify(serializedName, void 0, "  ")}.`);
    }
  } else if (operationSpec.formDataParameters && operationSpec.formDataParameters.length > 0) {
    request3.formData = {};
    for (const formDataParameter of operationSpec.formDataParameters) {
      const formDataParameterValue = getOperationArgumentValueFromParameter(operationArguments, formDataParameter);
      if (formDataParameterValue !== void 0 && formDataParameterValue !== null) {
        const formDataParameterPropertyName = formDataParameter.mapper.serializedName || getPathStringFromParameter(formDataParameter);
        request3.formData[formDataParameterPropertyName] = operationSpec.serializer.serialize(formDataParameter.mapper, formDataParameterValue, getPathStringFromParameter(formDataParameter), updatedOptions);
      }
    }
  }
}
function getXmlValueWithNamespace(xmlNamespace, xmlnsKey, typeName, serializedValue, options2) {
  if (xmlNamespace && !["Composite", "Sequence", "Dictionary"].includes(typeName)) {
    const result = {};
    result[options2.xml.xmlCharKey] = serializedValue;
    result[XML_ATTRKEY] = { [xmlnsKey]: xmlNamespace };
    return result;
  }
  return serializedValue;
}
function prepareXMLRootList(obj, elementName, xmlNamespaceKey, xmlNamespace) {
  if (!Array.isArray(obj)) {
    obj = [obj];
  }
  if (!xmlNamespaceKey || !xmlNamespace) {
    return { [elementName]: obj };
  }
  const result = { [elementName]: obj };
  result[XML_ATTRKEY] = { [xmlNamespaceKey]: xmlNamespace };
  return result;
}
function createClientPipeline(options2 = {}) {
  const pipeline = createPipelineFromOptions(options2 !== null && options2 !== void 0 ? options2 : {});
  if (options2.credentialOptions) {
    pipeline.addPolicy(bearerTokenAuthenticationPolicy({
      credential: options2.credentialOptions.credential,
      scopes: options2.credentialOptions.credentialScopes
    }));
  }
  pipeline.addPolicy(serializationPolicy(options2.serializationOptions), { phase: "Serialize" });
  pipeline.addPolicy(deserializationPolicy(options2.deserializationOptions), {
    phase: "Deserialize"
  });
  return pipeline;
}
var cachedHttpClient;
function getCachedDefaultHttpClient() {
  if (!cachedHttpClient) {
    cachedHttpClient = createDefaultHttpClient();
  }
  return cachedHttpClient;
}
var CollectionFormatToDelimiterMap = {
  CSV: ",",
  SSV: " ",
  Multi: "Multi",
  TSV: "	",
  Pipes: "|"
};
function getRequestUrl(baseUri, operationSpec, operationArguments, fallbackObject) {
  const urlReplacements = calculateUrlReplacements(operationSpec, operationArguments, fallbackObject);
  let isAbsolutePath = false;
  let requestUrl = replaceAll(baseUri, urlReplacements);
  if (operationSpec.path) {
    let path2 = replaceAll(operationSpec.path, urlReplacements);
    if (operationSpec.path === "/{nextLink}" && path2.startsWith("/")) {
      path2 = path2.substring(1);
    }
    if (isAbsoluteUrl(path2)) {
      requestUrl = path2;
      isAbsolutePath = true;
    } else {
      requestUrl = appendPath(requestUrl, path2);
    }
  }
  const { queryParams, sequenceParams } = calculateQueryParameters(operationSpec, operationArguments, fallbackObject);
  requestUrl = appendQueryParams(requestUrl, queryParams, sequenceParams, isAbsolutePath);
  return requestUrl;
}
function replaceAll(input, replacements) {
  let result = input;
  for (const [searchValue, replaceValue] of replacements) {
    result = result.split(searchValue).join(replaceValue);
  }
  return result;
}
function calculateUrlReplacements(operationSpec, operationArguments, fallbackObject) {
  var _a2;
  const result = /* @__PURE__ */ new Map();
  if ((_a2 = operationSpec.urlParameters) === null || _a2 === void 0 ? void 0 : _a2.length) {
    for (const urlParameter of operationSpec.urlParameters) {
      let urlParameterValue = getOperationArgumentValueFromParameter(operationArguments, urlParameter, fallbackObject);
      const parameterPathString = getPathStringFromParameter(urlParameter);
      urlParameterValue = operationSpec.serializer.serialize(urlParameter.mapper, urlParameterValue, parameterPathString);
      if (!urlParameter.skipEncoding) {
        urlParameterValue = encodeURIComponent(urlParameterValue);
      }
      result.set(`{${urlParameter.mapper.serializedName || parameterPathString}}`, urlParameterValue);
    }
  }
  return result;
}
function isAbsoluteUrl(url) {
  return url.includes("://");
}
function appendPath(url, pathToAppend) {
  if (!pathToAppend) {
    return url;
  }
  const parsedUrl = new URL(url);
  let newPath = parsedUrl.pathname;
  if (!newPath.endsWith("/")) {
    newPath = `${newPath}/`;
  }
  if (pathToAppend.startsWith("/")) {
    pathToAppend = pathToAppend.substring(1);
  }
  const searchStart = pathToAppend.indexOf("?");
  if (searchStart !== -1) {
    const path2 = pathToAppend.substring(0, searchStart);
    const search = pathToAppend.substring(searchStart + 1);
    newPath = newPath + path2;
    if (search) {
      parsedUrl.search = parsedUrl.search ? `${parsedUrl.search}&${search}` : search;
    }
  } else {
    newPath = newPath + pathToAppend;
  }
  parsedUrl.pathname = newPath;
  return parsedUrl.toString();
}
function calculateQueryParameters(operationSpec, operationArguments, fallbackObject) {
  var _a2;
  const result = /* @__PURE__ */ new Map();
  const sequenceParams = /* @__PURE__ */ new Set();
  if ((_a2 = operationSpec.queryParameters) === null || _a2 === void 0 ? void 0 : _a2.length) {
    for (const queryParameter of operationSpec.queryParameters) {
      if (queryParameter.mapper.type.name === "Sequence" && queryParameter.mapper.serializedName) {
        sequenceParams.add(queryParameter.mapper.serializedName);
      }
      let queryParameterValue = getOperationArgumentValueFromParameter(operationArguments, queryParameter, fallbackObject);
      if (queryParameterValue !== void 0 && queryParameterValue !== null || queryParameter.mapper.required) {
        queryParameterValue = operationSpec.serializer.serialize(queryParameter.mapper, queryParameterValue, getPathStringFromParameter(queryParameter));
        const delimiter = queryParameter.collectionFormat ? CollectionFormatToDelimiterMap[queryParameter.collectionFormat] : "";
        if (Array.isArray(queryParameterValue)) {
          queryParameterValue = queryParameterValue.map((item) => {
            if (item === null || item === void 0) {
              return "";
            }
            return item;
          });
        }
        if (queryParameter.collectionFormat === "Multi" && queryParameterValue.length === 0) {
          continue;
        } else if (Array.isArray(queryParameterValue) && (queryParameter.collectionFormat === "SSV" || queryParameter.collectionFormat === "TSV")) {
          queryParameterValue = queryParameterValue.join(delimiter);
        }
        if (!queryParameter.skipEncoding) {
          if (Array.isArray(queryParameterValue)) {
            queryParameterValue = queryParameterValue.map((item) => {
              return encodeURIComponent(item);
            });
          } else {
            queryParameterValue = encodeURIComponent(queryParameterValue);
          }
        }
        if (Array.isArray(queryParameterValue) && (queryParameter.collectionFormat === "CSV" || queryParameter.collectionFormat === "Pipes")) {
          queryParameterValue = queryParameterValue.join(delimiter);
        }
        result.set(queryParameter.mapper.serializedName || getPathStringFromParameter(queryParameter), queryParameterValue);
      }
    }
  }
  return {
    queryParams: result,
    sequenceParams
  };
}
function simpleParseQueryParams(queryString) {
  const result = /* @__PURE__ */ new Map();
  if (!queryString || queryString[0] !== "?") {
    return result;
  }
  queryString = queryString.slice(1);
  const pairs = queryString.split("&");
  for (const pair of pairs) {
    const [name, value] = pair.split("=", 2);
    const existingValue = result.get(name);
    if (existingValue) {
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        result.set(name, [existingValue, value]);
      }
    } else {
      result.set(name, value);
    }
  }
  return result;
}
function appendQueryParams(url, queryParams, sequenceParams, noOverwrite = false) {
  if (queryParams.size === 0) {
    return url;
  }
  const parsedUrl = new URL(url);
  const combinedParams = simpleParseQueryParams(parsedUrl.search);
  for (const [name, value] of queryParams) {
    const existingValue = combinedParams.get(name);
    if (Array.isArray(existingValue)) {
      if (Array.isArray(value)) {
        existingValue.push(...value);
        const valueSet = new Set(existingValue);
        combinedParams.set(name, Array.from(valueSet));
      } else {
        existingValue.push(value);
      }
    } else if (existingValue) {
      if (Array.isArray(value)) {
        value.unshift(existingValue);
      } else if (sequenceParams.has(name)) {
        combinedParams.set(name, [existingValue, value]);
      }
      if (!noOverwrite) {
        combinedParams.set(name, value);
      }
    } else {
      combinedParams.set(name, value);
    }
  }
  const searchPieces = [];
  for (const [name, value] of combinedParams) {
    if (typeof value === "string") {
      searchPieces.push(`${name}=${value}`);
    } else if (Array.isArray(value)) {
      for (const subValue of value) {
        searchPieces.push(`${name}=${subValue}`);
      }
    } else {
      searchPieces.push(`${name}=${value}`);
    }
  }
  parsedUrl.search = searchPieces.length ? `?${searchPieces.join("&")}` : "";
  return parsedUrl.toString();
}
var logger = createClientLogger("core-client");
var ServiceClient = class {
  /**
   * The ServiceClient constructor
   * @param credential - The credentials used for authentication with the service.
   * @param options - The service client options that govern the behavior of the client.
   */
  constructor(options2 = {}) {
    var _a2, _b;
    this._requestContentType = options2.requestContentType;
    this._endpoint = (_a2 = options2.endpoint) !== null && _a2 !== void 0 ? _a2 : options2.baseUri;
    if (options2.baseUri) {
      logger.warning("The baseUri option for SDK Clients has been deprecated, please use endpoint instead.");
    }
    this._allowInsecureConnection = options2.allowInsecureConnection;
    this._httpClient = options2.httpClient || getCachedDefaultHttpClient();
    this.pipeline = options2.pipeline || createDefaultPipeline(options2);
    if ((_b = options2.additionalPolicies) === null || _b === void 0 ? void 0 : _b.length) {
      for (const { policy, position } of options2.additionalPolicies) {
        const afterPhase = position === "perRetry" ? "Sign" : void 0;
        this.pipeline.addPolicy(policy, {
          afterPhase
        });
      }
    }
  }
  /**
   * Send the provided httpRequest.
   */
  async sendRequest(request3) {
    return this.pipeline.sendRequest(this._httpClient, request3);
  }
  /**
   * Send an HTTP request that is populated using the provided OperationSpec.
   * @typeParam T - The typed result of the request, based on the OperationSpec.
   * @param operationArguments - The arguments that the HTTP request's templated values will be populated from.
   * @param operationSpec - The OperationSpec to use to populate the httpRequest.
   */
  async sendOperationRequest(operationArguments, operationSpec) {
    const endpoint = operationSpec.baseUrl || this._endpoint;
    if (!endpoint) {
      throw new Error("If operationSpec.baseUrl is not specified, then the ServiceClient must have a endpoint string property that contains the base URL to use.");
    }
    const url = getRequestUrl(endpoint, operationSpec, operationArguments, this);
    const request3 = createPipelineRequest({
      url
    });
    request3.method = operationSpec.httpMethod;
    const operationInfo = getOperationRequestInfo(request3);
    operationInfo.operationSpec = operationSpec;
    operationInfo.operationArguments = operationArguments;
    const contentType2 = operationSpec.contentType || this._requestContentType;
    if (contentType2 && operationSpec.requestBody) {
      request3.headers.set("Content-Type", contentType2);
    }
    const options2 = operationArguments.options;
    if (options2) {
      const requestOptions = options2.requestOptions;
      if (requestOptions) {
        if (requestOptions.timeout) {
          request3.timeout = requestOptions.timeout;
        }
        if (requestOptions.onUploadProgress) {
          request3.onUploadProgress = requestOptions.onUploadProgress;
        }
        if (requestOptions.onDownloadProgress) {
          request3.onDownloadProgress = requestOptions.onDownloadProgress;
        }
        if (requestOptions.shouldDeserialize !== void 0) {
          operationInfo.shouldDeserialize = requestOptions.shouldDeserialize;
        }
        if (requestOptions.allowInsecureConnection) {
          request3.allowInsecureConnection = true;
        }
      }
      if (options2.abortSignal) {
        request3.abortSignal = options2.abortSignal;
      }
      if (options2.tracingOptions) {
        request3.tracingOptions = options2.tracingOptions;
      }
    }
    if (this._allowInsecureConnection) {
      request3.allowInsecureConnection = true;
    }
    if (request3.streamResponseStatusCodes === void 0) {
      request3.streamResponseStatusCodes = getStreamingResponseStatusCodes(operationSpec);
    }
    try {
      const rawResponse = await this.sendRequest(request3);
      const flatResponse = flattenResponse(rawResponse, operationSpec.responses[rawResponse.status]);
      if (options2 === null || options2 === void 0 ? void 0 : options2.onResponse) {
        options2.onResponse(rawResponse, flatResponse);
      }
      return flatResponse;
    } catch (error) {
      if (typeof error === "object" && (error === null || error === void 0 ? void 0 : error.response)) {
        const rawResponse = error.response;
        const flatResponse = flattenResponse(rawResponse, operationSpec.responses[error.statusCode] || operationSpec.responses["default"]);
        error.details = flatResponse;
        if (options2 === null || options2 === void 0 ? void 0 : options2.onResponse) {
          options2.onResponse(rawResponse, flatResponse, error);
        }
      }
      throw error;
    }
  }
};
function createDefaultPipeline(options2) {
  const credentialScopes = getCredentialScopes(options2);
  const credentialOptions = options2.credential && credentialScopes ? { credentialScopes, credential: options2.credential } : void 0;
  return createClientPipeline(Object.assign(Object.assign({}, options2), { credentialOptions }));
}
function getCredentialScopes(options2) {
  if (options2.credentialScopes) {
    return options2.credentialScopes;
  }
  if (options2.endpoint) {
    return `${options2.endpoint}/.default`;
  }
  if (options2.baseUri) {
    return `${options2.baseUri}/.default`;
  }
  if (options2.credential && !options2.credentialScopes) {
    throw new Error(`When using credentials, the ServiceClientOptions must contain either a endpoint or a credentialScopes. Unable to create a bearerTokenAuthenticationPolicy`);
  }
  return void 0;
}
function parseCAEChallenge(challenges) {
  const bearerChallenges = `, ${challenges.trim()}`.split(", Bearer ").filter((x) => x);
  return bearerChallenges.map((challenge) => {
    const challengeParts = `${challenge.trim()}, `.split('", ').filter((x) => x);
    const keyValuePairs = challengeParts.map((keyValue) => (([key, value]) => ({ [key]: value }))(keyValue.trim().split('="')));
    return keyValuePairs.reduce((a, b) => Object.assign(Object.assign({}, a), b), {});
  });
}
async function authorizeRequestOnClaimChallenge(onChallengeOptions) {
  const { scopes, response } = onChallengeOptions;
  const logger$12 = onChallengeOptions.logger || logger;
  const challenge = response.headers.get("WWW-Authenticate");
  if (!challenge) {
    logger$12.info(`The WWW-Authenticate header was missing. Failed to perform the Continuous Access Evaluation authentication flow.`);
    return false;
  }
  const challenges = parseCAEChallenge(challenge) || [];
  const parsedChallenge = challenges.find((x) => x.claims);
  if (!parsedChallenge) {
    logger$12.info(`The WWW-Authenticate header was missing the necessary "claims" to perform the Continuous Access Evaluation authentication flow.`);
    return false;
  }
  const accessToken = await onChallengeOptions.getAccessToken(parsedChallenge.scope ? [parsedChallenge.scope] : scopes, {
    claims: decodeStringToString(parsedChallenge.claims)
  });
  if (!accessToken) {
    return false;
  }
  onChallengeOptions.request.headers.set("Authorization", `Bearer ${accessToken.token}`);
  return true;
}
var PathsLi5TynApiV1LogConversationPostRequestbodyContentApplicationJsonSchema = {
  type: {
    name: "Composite",
    className: "PathsLi5TynApiV1LogConversationPostRequestbodyContentApplicationJsonSchema",
    modelProperties: {
      conversation: {
        serializedName: "conversation",
        type: {
          name: "Composite",
          className: "Conversation"
        }
      }
    }
  }
};
var Conversation = {
  type: {
    name: "Composite",
    className: "Conversation",
    modelProperties: {
      messages: {
        serializedName: "messages",
        type: {
          name: "Sequence",
          element: {
            type: {
              name: "Composite",
              className: "Message"
            }
          }
        }
      },
      metadata: {
        serializedName: "metadata",
        type: {
          name: "Dictionary",
          value: { type: { name: "any" } }
        }
      }
    }
  }
};
var Message = {
  type: {
    name: "Composite",
    className: "Message",
    modelProperties: {
      role: {
        serializedName: "role",
        required: true,
        type: {
          name: "String"
        }
      },
      message: {
        serializedName: "message",
        required: true,
        type: {
          name: "String"
        }
      },
      eventTimestamp: {
        serializedName: "event_timestamp",
        type: {
          name: "DateTime"
        }
      },
      rating: {
        serializedName: "rating",
        type: {
          name: "Enum",
          allowedValues: [-1, 0, 1]
        }
      }
    }
  }
};
var Mappers = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  Conversation,
  Message,
  PathsLi5TynApiV1LogConversationPostRequestbodyContentApplicationJsonSchema
});
var contentType = {
  parameterPath: ["options", "contentType"],
  mapper: {
    defaultValue: "application/json",
    isConstant: true,
    serializedName: "Content-Type",
    type: {
      name: "String"
    }
  }
};
var body = {
  parameterPath: ["options", "body"],
  mapper: PathsLi5TynApiV1LogConversationPostRequestbodyContentApplicationJsonSchema
};
var $host = {
  parameterPath: "$host",
  mapper: {
    serializedName: "$host",
    required: true,
    type: {
      name: "String"
    }
  },
  skipEncoding: true
};
var authorization = {
  parameterPath: ["options", "authorization"],
  mapper: {
    serializedName: "Authorization",
    type: {
      name: "String"
    }
  }
};
var LogImpl = class {
  /**
   * Initialize a new instance of the class Log class.
   * @param client Reference to the service client
   */
  constructor(client) {
    this.client = client;
  }
  /**
   * Ingests a conversation
   * @param options The options parameters.
   */
  conversation(options2) {
    return this.client.sendOperationRequest({ options: options2 }, conversationOperationSpec);
  }
};
var serializer = createSerializer(
  Mappers,
  /* isXml */
  false
);
var conversationOperationSpec = {
  path: "/api/v1/log/conversation",
  httpMethod: "POST",
  responses: { 201: {} },
  requestBody: body,
  urlParameters: [$host],
  headerParameters: [contentType, authorization],
  mediaType: "json",
  serializer
};
var ContextAPI = class extends ServiceClient {
  /**
   * Initializes a new instance of the ContextAPI class.
   * @param options The parameter options
   */
  constructor(options2) {
    var _a2, _b, _c;
    if (!options2) {
      options2 = {};
    }
    const defaults = {
      requestContentType: "application/json; charset=utf-8"
    };
    const packageDetails = `azsdk-js-context-generated/1.0.0-beta.1`;
    const userAgentPrefix = options2.userAgentOptions && options2.userAgentOptions.userAgentPrefix ? `${options2.userAgentOptions.userAgentPrefix} ${packageDetails}` : `${packageDetails}`;
    const optionsWithDefaults = Object.assign(Object.assign(Object.assign({}, defaults), options2), { userAgentOptions: {
      userAgentPrefix
    }, endpoint: (_b = (_a2 = options2.endpoint) !== null && _a2 !== void 0 ? _a2 : options2.baseUri) !== null && _b !== void 0 ? _b : "https://api.getcontext.ai" });
    super(optionsWithDefaults);
    let bearerTokenAuthenticationPolicyFound = false;
    if ((options2 === null || options2 === void 0 ? void 0 : options2.pipeline) && options2.pipeline.getOrderedPolicies().length > 0) {
      const pipelinePolicies = options2.pipeline.getOrderedPolicies();
      bearerTokenAuthenticationPolicyFound = pipelinePolicies.some((pipelinePolicy) => pipelinePolicy.name === bearerTokenAuthenticationPolicyName);
    }
    if (!options2 || !options2.pipeline || options2.pipeline.getOrderedPolicies().length == 0 || !bearerTokenAuthenticationPolicyFound) {
      this.pipeline.removePolicy({
        name: bearerTokenAuthenticationPolicyName
      });
      this.pipeline.addPolicy(bearerTokenAuthenticationPolicy({
        credential: options2.credential,
        scopes: (_c = optionsWithDefaults.credentialScopes) !== null && _c !== void 0 ? _c : `${optionsWithDefaults.endpoint}/.default`,
        challengeCallbacks: {
          authorizeRequestOnChallenge: authorizeRequestOnClaimChallenge
        }
      }));
    }
    this.$host = options2.$host || "https://api.getcontext.ai";
    this.log = new LogImpl(this);
  }
};
var Credential = class {
  constructor(token) {
    this.token = token;
  }
  getToken(scopes, options2) {
    return Promise.resolve({
      token: this.token,
      expiresOnTimestamp: 0
    });
  }
};

// src/index.ts
var options = {
  credential: new Credential(process.env.CONTEXT_TOKEN)
};
var c = new ContextAPI(options);
c.log.conversation({
  body: {
    conversation: {
      messages: [
        { message: "You are a helpful assistant.", role: KnownMessageRole.System, rating: 0 },
        { message: "Hi, how are you doing?", role: KnownMessageRole.User, rating: 0 },
        { message: "I'm doing super well, how are you?", role: KnownMessageRole.Assistant, rating: 1 }
      ]
    }
  }
});
/*! Bundled license information:

@contextco/context-node/build/index.js:
  (*!
   * mime-db
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015-2022 Douglas Christopher Wilson
   * MIT Licensed
   *)
  (*!
   * mime-types
   * Copyright(c) 2014 Jonathan Ong
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
