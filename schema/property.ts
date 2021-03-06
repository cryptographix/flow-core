import { AnyObject, Constructable, JSONObject, PropertiesOf } from "./type-helpers.ts";

export type PropertyValue =
  | boolean
  | number
  | string
  | Uint8Array
  | bigint
  | AnyObject;

/**
 *
 */
export type PropertyDefinitionBase<T = unknown> = {
  //dataType: string;

  // friendly name for user
  title?: string;

  // brief description
  description?: string;

  ignore?: boolean;

  // property is optional .. value CAN be undefined
  optional?: boolean;

  constant?: boolean;

  // default value for property
  default?: T;

  accessors?: "get" | "set" | "both";

  // custom to/from JSON converters
  converter?: {
    fromObject(name: string, obj: JSONObject): T;
    toObject(prop: T): JSONObject;
  };

  // custom validator
  validator?: (value: unknown) => void;
}

export type PropertyDefinition<T = unknown> = PropertyDefinitionBase<T> & (
  | {
      /**
       * A boolean property
       */
      dataType: "boolean";

      // user-friendly name for when value is TRUE
      trueLabel?: string;

      // user-friendly name for when value is FALSE
      falseLabel?: string;
    }
  | {
      /**
       * An integer property
       */
      dataType: "integer";

      // Minimum-value
      minValue?: number;

      // Maximum-value
      maxValue?: number;

      // Optional step-size between min and max
      step?: number;
    }
  | {
      /**
       * An UTF-8 coded string property
       */
      dataType: "string";

      // Minimum-length
      minLength?: number;

      // Maximum-length
      maxLength?: number;

      // Steps between min and max length
      lengthStep?: number;
    }
  | {
      /**
       * A variable-length array of bytes
       */
      dataType: "u8[]";

      // Minimum-length
      minLength?: number;

      // Maximum-length
      maxLength?: number;

      // Steps between min and max length
      lengthStep?: number;
    }
  | {
      /**
       * An enumerated type property [value:string] -> [description:string]
       */
      dataType: "enum";

      // Hash-map of option values/description
      options: Record<string, string> | string[];
    }
  | {
      /**
       * A big number
       */
      dataType: "bignum";
    }
  | {
      /**
       * An object
       */
      dataType: "class";

      ctor: Constructable;
      //
      isTree?: boolean;
    }
  | {
      /**
       * A block
       */
      dataType: "slot";

      implements?: symbol;
    }
);

export type NoProperties = Record<never, PropertyValue>;

export type PropertyDataTypes = "boolean"|"string"|"integer"|"u8[]"|"enum"|"bignum"; //Exclude<PropertyDefinition["dataType"], string>;
export type PropertyInfos<IF> = Record<keyof IF, PropertyDefinition>;
export type PropertyKey<IF> = keyof PropertiesOf<IF>;
export type PropertyValues<IF> = Record<keyof IF, PropertyValue>;

/**
 * A schema-enhanced reference to a Property
 */
export interface IPropReference<T = unknown> {
  target: T;
  key: string;
  propertyInfo: PropertyDefinition<T[keyof T]>;
}
