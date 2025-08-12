import {
  formatProperties,
  nameFormat,
  parameterTypes,
  typeFormat,
  versionFormat,
} from './constants.js'
import is from './is.js'

export default {
  version: (blueprintVersion) => {
    const errors = []
    const type = 'invalid_version'
    if (!is.string(blueprintVersion) || !versionFormat.test(blueprintVersion)) {
      return errors.push({message: `Invalid version: ${blueprintVersion}`, type})
    }
    const [y, m, d] = blueprintVersion.split('-')
    if (y < '2024') {
      errors.push({message: `Invalid version year: ${y}`, type})
    }
    if (m < '01' || m > '12') {
      errors.push({message: `Invalid version month: ${m}`, type})
    }
    if (d < '01' || d > '31') {
      errors.push({message: `Invalid version day: ${d}`, type})
    }

    if (errors.length) return errors
  },

  resources: (resources) => {
    if (!is.defined(resources)) return

    if (!is.array(resources)) {
      return [
        {
          message: 'Resources must be an array',
          type: 'invalid_type',
        },
      ]
    }

    const errors = []
    const names = []
    resources.forEach((resource) => {
      if (!is.object(resource)) {
        return errors.push({
          // Maybe we should break out the stringified resource into a data field?
          message: `Resources must be an object, found: ${JSON.stringify(resource)}`,
          type: 'invalid_type',
        })
      }

      const {name, type} = resource
      if (!is.defined(name)) {
        errors.push({
          message: `Resource must have a 'name' property`,
          type: 'missing_required_property',
        })
      } else if (!is.string(name)) {
        errors.push({
          message: `Resource 'name' property must be a string, found: ${name}`,
          type: 'invalid_type',
        })
      } else {
        if (names.includes(name)) {
          errors.push({
            message: `All resource 'name' properties must be unique, found: ${name}`,
            type: 'duplicate_name',
          })
        }
        if (!nameFormat.test(name)) {
          errors.push({
            message: `Resource 'name' property is invalid, must conform to '${nameFormat}', found: ${name}`,
            type: 'invalid_format',
          })
        }
        names.push(name)
      }

      if (!is.defined(type)) {
        errors.push({
          message: `Resource must have a 'type' property`,
          type: 'missing_required_property',
        })
      } else if (!is.string(type)) {
        errors.push({
          message: `Resource 'type' property must be a string, found: ${type}`,
          type: 'invalid_type',
        })
      } else if (!typeFormat.test(type)) {
        errors.push({
          message: `Resource 'type' property is invalid, must conform to '${typeFormat}', found: ${type}`,
          type: 'invalid_format',
        })
      }
    })

    if (errors.length) return errors
  },

  values: (values) => {
    if (!is.defined(values)) return

    if (!is.object(values)) {
      return [
        {
          message: 'Values must be an object',
          type: 'invalid_type',
        },
      ]
    }

    const errors = []
    if (Object.keys(values).length) {
      Object.entries(values).forEach(([name, value]) => {
        if (!is.scalar(value)) {
          errors.push({
            message: `Values property '${name}' must be scalar (string or number)`,
            type: 'invalid_type',
          })
        }
        if (is.ref(value)) {
          errors.push({
            message: `Values property '${name}' cannot be a reference, found: ${value}`,
            type: 'invalid_type',
          })
        }
      })
    }

    if (errors.length) return errors
  },

  parameters: (parameters) => {
    if (!is.defined(parameters)) return

    if (!is.array(parameters)) {
      return [
        {
          message: 'Parameters must be an array',
          type: 'invalid_type',
        },
      ]
    }

    const errors = []
    const names = []
    if (parameters.length) {
      parameters.forEach((param) => {
        if (!is.object(param)) {
          return errors.push({
            // Maybe we should break out the stringified parameter into a data field?
            message: `Parameters must be an object, found: ${JSON.stringify(param)}`,
            type: 'invalid_type',
          })
        }

        const {name, type} = param
        if (!is.defined(name)) {
          errors.push({
            message: `Parameter must have a 'name' property`,
            type: 'missing_required_property',
          })
        } else if (!is.string(name)) {
          errors.push({
            message: `Parameter 'name' property must be a string, found: ${name}`,
            type: 'invalid_type',
          })
        } else {
          if (names.includes(name)) {
            errors.push({
              message: `All parameter 'name' properties must be unique, found: ${name}`,
              type: 'duplicate_name',
            })
          }
          if (!nameFormat.test(name)) {
            errors.push({
              message: `Parameter 'name' property is invalid, must conform to '${nameFormat}', found: ${name}`,
              type: 'invalid_format',
            })
          }
          names.push(name)
        }

        if (!is.defined(type)) {
          errors.push({
            message: `Parameter must have a 'type' property`,
            type: 'missing_required_property',
          })
        } else if (!is.string(type)) {
          errors.push({
            message: `Parameter 'type' property must be a string, found: ${type}`,
            type: 'invalid_type',
          })
        } else if (!parameterTypes.includes(type)) {
          errors.push({
            message: `Unknown parameter 'type', found: ${type}`,
            type: 'invalid_value',
          })
        }
      })
    }

    if (errors.length) return errors
  },

  outputs: (outputs) => {
    if (!is.defined(outputs)) return

    if (!is.array(outputs)) {
      return [
        {
          message: 'Outputs must be an array',
          type: 'invalid_type',
        },
      ]
    }

    const errors = []
    const names = []
    outputs.forEach((output) => {
      if (!is.object(output)) {
        return errors.push({
          // Maybe we should break out the stringified output into a data field?
          message: `Outputs must be an object, found: ${JSON.stringify(output)}`,
          type: 'invalid_type',
        })
      }

      const {name, value} = output
      if (!is.defined(name)) {
        errors.push({
          message: `Output must have a 'name' property`,
          type: 'missing_required_property',
        })
      } else if (!is.string(name)) {
        errors.push({
          message: `Output 'name' property must be a string, found: ${name}`,
          type: 'invalid_type',
        })
      } else {
        if (names.includes(name)) {
          errors.push({
            message: `All output 'name' properties must be unique, found: ${name}`,
            type: 'duplicate_name',
          })
        }
        if (!nameFormat.test(name)) {
          errors.push({
            message: `Output 'name' property is invalid, must conform to '${nameFormat}', found: ${name}`,
            type: 'invalid_format',
          })
        }
        names.push(name)
      }

      if (!is.defined(value)) {
        errors.push({
          message: `Output must have a 'value' property`,
          type: 'missing_required_property',
        })
      }
    })

    if (errors.length) return errors
  },

  metadata: (metadata) => {
    if (!is.defined(metadata)) return

    if (!is.object(metadata)) {
      return [
        {
          message: 'Metadata must be an object',
          type: 'invalid_type',
        },
      ]
    }
  },

  else: (rawBlueprint) => {
    const properties = Object.keys(rawBlueprint)
    if (!properties.length) return

    const errors = []

    for (const property of properties) {
      if (!formatProperties.includes(property)) {
        errors.push({
          message: `Found invalid Blueprint property: ${property}`,
          type: 'invalid_property',
        })
      }
    }

    if (errors.length) return errors
  },

  passedParameters: (options) => {
    const {parameters} = options
    if (!is.defined(parameters)) return

    if (!is.object(parameters)) {
      return [
        {
          message: 'Passed parameters must be an object',
          type: 'invalid_type',
        },
      ]
    }

    const errors = []

    for (const [name, value] of Object.entries(parameters)) {
      if (!is.scalar(value)) {
        errors.push({
          message: `Passed parameter '${name}' must be scalar (string or number)`,
          type: 'invalid_type',
        })
      }
    }

    if (errors.length) return errors
  },
}
