import {firstVersion} from './constants.js'
import is from './is.js'
export default {find, resolve}

function find(rawBlueprint, options) {
  const {resources, parameters, outputs} = rawBlueprint
  const {debug} = options
  const foundRefs = []

  function walk(item, path) {
    if (is.object(item)) {
      for (const [name, value] of Object.entries(item)) {
        const cur = `${path}.${name}`
        if (is.ref(value)) foundRefs.push({path: cur, property: name, ref: value, item})
        else if (is.object(value) || is.array(value)) walk(value, cur)
      }
    }
    if (is.array(item)) {
      item.forEach((value, index) => {
        const cur = `${path}[${index}]`
        if (is.ref(value)) foundRefs.push({path: cur, property: value, ref: value, item, index})
        else if (is.object(value)) walk(value, cur)
      })
    }
  }

  // Top-level Blueprint properties that may contain a reference
  const properties = ['resources', 'parameters', 'outputs']
  for (const property of properties) {
    // Run over the list
    if (rawBlueprint[property]?.length) {
      // Inspect each property, or (recursively) walk if it's an object
      for (const item of rawBlueprint[property]) {
        const top = `${property}.${item.name}`
        walk(item, top)
      }
    }
  }

  /* c8 ignore next 4 */
  if (debug) {
    console.log(`[Debug] Found ${foundRefs.length} references:`, foundRefs.length ? foundRefs : '')
  }

  return foundRefs
}

function resolve(rawBlueprint, foundRefs, options) {
  const {parameters = {}} = options
  const refs = {}
  const unresolvedRefs = []
  const refErrors = []
  for (const foundRef of foundRefs) {
    const {path, property, ref, item} = foundRef
    const refPath = ref.replace(/^\$\./, '')
    // Early return from an already found reference
    if (refs[refPath]) {
      item[property] = refs[refPath]
      continue
    }

    // Parameters are special, (try to) find them in options.parameters passed by the caller
    const parts = refPath.split('.')
    const param = parts[1]
    if (['parameters', 'params'].includes(parts[0])) {
      const found = parameters[param]
      if (is.scalar(found)) {
        refs[refPath] = found
        if (is.object(item)) item[property] = refs[refPath]
        if (is.array(item)) {
          const index = item.findIndex(i => i === property)
          item[index] = refs[refPath]
        }
      } else {
        refErrors.push({
          message: `Reference error '${ref}': '${param}' not found in passed parameters`,
          type: 'missing_parameter',
        })
      }
      continue
    }

    // Will prob need to refactor the following to get a bit more readable, and introduce more subtle behavior
    const found = parts.reduce((obj, i) => {
      if (obj?.[i]) return obj[i]
      if (is.array(obj)) return obj.find(({name}) => name === i)
    }, rawBlueprint)
    if (is.scalar(found)) {
      refs[refPath] = found
      if (is.object(item)) item[property] = refs[refPath]
      if (is.array(item)) {
        const index = item.findIndex(i => i === property)
        item[index] = refs[refPath]
      }
    } else {
      unresolvedRefs.push(foundRef)
    }
  }

  return {
    resolvedBlueprint: rawBlueprint,
    unresolvedRefs: unresolvedRefs.length ? unresolvedRefs : undefined,
    refErrors,
  }
}