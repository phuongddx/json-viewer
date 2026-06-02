/**
 * Simple JSON Schema (draft-07 subset) validator.
 * Supports: type, required, properties, items, enum,
 *           minLength, maxLength, minimum, maximum, additionalProperties
 */

export interface ValidationError {
  path: string
  message: string
}

type SchemaType =
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'object'
  | 'array'

interface JsonSchema {
  type?: SchemaType | SchemaType[]
  required?: string[]
  properties?: Record<string, JsonSchema>
  items?: JsonSchema
  enum?: unknown[]
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  additionalProperties?: boolean | JsonSchema
  properties_min?: number
  properties_max?: number
  [key: string]: unknown
}

function getType(value: unknown): string {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function matchesType(value: unknown, schemaType: SchemaType | SchemaType[]): boolean {
  const actual = getType(value)
  if (Array.isArray(schemaType)) {
    return schemaType.includes(actual as SchemaType)
  }
  if (schemaType === 'integer') {
    return actual === 'number' && Number.isInteger(value)
  }
  return actual === schemaType
}

function validateNode(
  value: unknown,
  schema: JsonSchema,
  path: string,
  errors: ValidationError[]
): void {
  // type check
  if (schema.type !== undefined) {
    if (!matchesType(value, schema.type)) {
      const expected = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type
      errors.push({ path: path || '/', message: `Expected type "${expected}" but got "${getType(value)}"` })
      return // no point checking further if type is wrong
    }
  }

  // enum check
  if (schema.enum !== undefined) {
    const match = schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))
    if (!match) {
      errors.push({
        path: path || '/',
        message: `Value must be one of: ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}`,
      })
    }
  }

  // string constraints
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path: path || '/', message: `String length ${value.length} is less than minimum ${schema.minLength}` })
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path: path || '/', message: `String length ${value.length} exceeds maximum ${schema.maxLength}` })
    }
  }

  // number constraints
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path: path || '/', message: `Value ${value} is less than minimum ${schema.minimum}` })
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path: path || '/', message: `Value ${value} exceeds maximum ${schema.maximum}` })
    }
  }

  // object validation
  if (getType(value) === 'object' && value !== null) {
    const obj = value as Record<string, unknown>

    // required properties
    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({ path: path || '/', message: `Missing required property "${key}"` })
        }
      }
    }

    // validate each property that has a sub-schema
    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          const childPath = path ? `${path}.${key}` : key
          validateNode(obj[key], propSchema, childPath, errors)
        }
      }
    }

    // additionalProperties: disallow extra keys when explicitly false
    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties))
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
          errors.push({ path: path ? `${path}.${key}` : key, message: `Additional property "${key}" is not allowed` })
        }
      }
    }
  }

  // array validation
  if (getType(value) === 'array' && schema.items) {
    const arr = value as unknown[]
    for (let i = 0; i < arr.length; i++) {
      const childPath = path ? `${path}[${i}]` : `[${i}]`
      validateNode(arr[i], schema.items, childPath, errors)
    }
  }
}

/**
 * Validate a parsed JSON value against a JSON Schema object.
 * Returns an array of validation errors (empty if valid).
 */
export function validateJsonSchema(
  data: unknown,
  schema: JsonSchema
): ValidationError[] {
  const errors: ValidationError[] = []
  validateNode(data, schema, '', errors)
  return errors
}

/**
 * Parse a JSON Schema string and validate data against it.
 * Returns errors from parsing the schema and/or validation errors.
 */
export function validateWithSchemaString(
  data: unknown,
  schemaText: string
): { schemaErrors: ValidationError[]; validationErrors: ValidationError[] } {
  const schemaErrors: ValidationError[] = []
  let schema: JsonSchema | null = null

  try {
    schema = JSON.parse(schemaText)
  } catch {
    schemaErrors.push({ path: '/', message: 'Invalid JSON Schema: could not parse schema text' })
    return { schemaErrors, validationErrors: [] }
  }

  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    schemaErrors.push({ path: '/', message: 'JSON Schema must be an object' })
    return { schemaErrors, validationErrors: [] }
  }

  const validationErrors = validateJsonSchema(data, schema)
  return { schemaErrors, validationErrors }
}
