export type Scalar = string | number

export type BlueprintInput = string | Buffer | object

export type ParserOptions = {
  debug?: boolean
  parameters?: Record<string, Scalar>
}

export type Resource = {
  name: string
  type: string
} & Record<string, unknown>

export type Parameter = {
  name: string
  type: 'arg' | 'argument' | 'env-var' | 'envVar' | 'config' | 'stdin'
} & (
  | {
      type: 'arg' | 'argument' | 'env-var' | 'envVar'
      input: string
    }
  | {
      type: 'config'
      settings?: Record<string, unknown>
    }
)

export type Output = {
  name: string
  value: string
}

export type Blueprint = {
  blueprintVersion?: string
  resources?: Array<Resource>
  values?: Record<string, Scalar>
  parameters?: Array<Parameter>
  outputs?: Array<Output>
  metadata?: Record<string, unknown>
}

export type ParserError = {
  message: string
} & (
  | {
      type: 'json_validation_error'
      error: unknown
    }
  | {
      type: 'invalid_input'
    }
)
export type ParserOuput =
  | {
      ok: true
      rawBlueprint: Record<string, unknown>
    }
  | {
      ok: false
      parseErrors: Array<ParserError>
    }

export type ValidationError = {
  type: string
  message: string
}

export type UnresolvedReference = {
  /** The location where the reference was found */
  path: string
  /** The content of the reference (e.g. $.resources.project-1.id) */
  ref: string
}

export type Reference = UnresolvedReference & {
  /** The object or array containing the reference */
  container: object | Array
  /** The key or index of the reference in the container */
  property: string | number
}

export type ReferenceError = {
  type: string
  message: string
}

export type BlueprintError = ParserError | ValidationError | ReferenceError

export type BlueprintOutput =
  | {
      result: 'valid'
      blueprint: Blueprint
      unresolvedRefs?: Array<UnresolvedReference>
    }
  | {
      result: 'reference_errors'
      blueprint: Blueprint
      unresolvedRefs?: Array<UnresolvedReference>
      errors: Array<ReferenceError>
    }
  | {
      result: 'parse_errors'
      errors: Array<ParserError>
    }
  | {
      result: 'validation_errors'
      errors: Array<ValidationError>
    }

export default function blueprintParserValidator(
  input: BlueprintInput,
  options: ParserOptions = {},
): BlueprintOutput

declare module '@sanity/blueprints-parser' {
  export default blueprintParserValidator
}
