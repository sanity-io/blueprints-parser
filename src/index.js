import {firstVersion} from './constants.js'
import is from './is.js'
import references from './refs.js'
import validate from './validate.js'

export default function blueprintParserValidator(input, options = {}) {
  try {
    const {rawBlueprint, parseErrors} = parse(input)
    if (parseErrors?.length) {
      return {
        blueprint: rawBlueprint || input,
        errors: parseErrors,
      }
    }

    const version = rawBlueprint.blueprintVersion || firstVersion

    // Aggregate basic structural, spec violation, or input errors
    const initialErrors = []
      .concat(
        validate.version(version),
        validate.resources(rawBlueprint.resources),
        validate.values(rawBlueprint.values),
        validate.parameters(rawBlueprint.parameters),
        validate.outputs(rawBlueprint.outputs),
        validate.metadata(rawBlueprint.metadata),
        validate.else(rawBlueprint),
        validate.passedParameters(options),
      )
      .filter(Boolean)

    if (initialErrors.length) {
      return {
        blueprint: rawBlueprint,
        errors: initialErrors,
      }
    }

    const foundRefs = references.find(rawBlueprint, options)
    if (!foundRefs.length) {
      return {
        blueprint: rawBlueprint,
      }
    }

    const {resolvedBlueprint, unresolvedRefs, refErrors} = references.resolve(
      rawBlueprint,
      foundRefs,
      options,
    )

    const output = {blueprint: resolvedBlueprint}
    if (unresolvedRefs?.length) output.unresolvedRefs = unresolvedRefs
    if (refErrors.length) output.errors = refErrors

    return output

    /* c8 ignore next 4 */
  } catch (error) {
    console.log('Unknown Blueprint error', error)
    throw error
  }
}

function parse(input) {
  if (is.string(input) || input instanceof Buffer) {
    try {
      return {rawBlueprint: JSON.parse(input)}
    } catch (error) {
      return {
        parseErrors: [
          {
            message: 'Invalid Blueprint JSON',
            type: 'json_validation_error',
            error,
          },
        ],
      }
    }
  } else if (is.object(input)) {
    return {rawBlueprint: structuredClone(input)}
  }
  return {
    parseErrors: [
      {
        message: 'Invalid input',
        type: 'invalid_input',
      },
    ],
  }
}
