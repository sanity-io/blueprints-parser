import {readFile} from 'node:fs/promises'
import {join} from 'node:path'
import schemas from '@sanity/blueprints-jsonschemas'
import Ajv from 'ajv/dist/2020.js'
import tap from 'tap'
import blueprintParserValidator from '../../src/index.js'
import mocks from '../mocks/all.js'

const cwd = process.cwd()
const ajv = new Ajv()

tap.test('Basic input', (t) => {
  t.plan(8)
  const input = {blueprintVersion: '2024-10-01'}
  const inputJSON = JSON.stringify(input)
  let result

  result = blueprintParserValidator(input)
  t.same(result.blueprint, input, 'Parser / validator accepted raw JS input')
  t.notOk(result.errors, 'Parser / validator found no issues')

  result = blueprintParserValidator(inputJSON)
  t.same(result.blueprint, input, 'Parser / validator accepted JSON input')
  t.notOk(result.errors, 'Parser / validator found no issues')

  result = blueprintParserValidator(Buffer.from(inputJSON))
  t.same(result.blueprint, input, 'Parser / validator accepted JSON buffer')
  t.notOk(result.errors, 'Parser / validator found no issues')

  result = blueprintParserValidator(input, {parameters: {ok: 'hello'}})
  t.same(result.blueprint, input, 'Parser / validator accepted raw JS input and scalar params')
  t.notOk(result.errors, 'Parser / validator found no issues')
})

tap.test('Basic input: errors', (t) => {
  t.plan(10)
  const input = {blueprintVersion: 'nah'}
  const invalidInput = '{'
  const validInput = {}
  let result

  result = blueprintParserValidator(invalidInput)
  t.same(
    result.blueprint,
    invalidInput,
    'Parser / validator returned invalid input for user debugging',
  )
  t.same(result.errors.length, 1, 'Parser / validator returned error on invalid JSON')

  result = blueprintParserValidator(undefined)
  t.notOk(result.blueprint, 'Parser / validator had no input to return (undefined)')
  t.same(result.errors.length, 1, 'Parser / validator returned error on invalid input (undefined)')

  result = blueprintParserValidator(input)
  t.same(result.blueprint, input, 'Parser / validator accepted raw JS input')
  t.same(result.errors.length, 1, 'Parser / validator returned a basic format error')

  result = blueprintParserValidator(validInput, {parameters: 'hi'})
  t.same(result.blueprint, validInput, 'Parser / validator accepted valid input')
  t.same(result.errors.length, 1, 'Parser / validator returned a basic format error')

  result = blueprintParserValidator(validInput, {parameters: {ok: {}}})
  t.same(result.blueprint, validInput, 'Parser / validator accepted valid input')
  t.same(result.errors.length, 1, 'Parser / validator returned a basic format error')
})

tap.test('Reference resolution', async (t) => {
  const references = Object.entries(mocks.references)
  const referenceErrors = Object.entries(mocks.referenceErrors)
  const tests = references.length * 3 + referenceErrors.length * 3
  t.plan(tests)

  // Basic reference resolution
  for (const [name, {input, parameters, expected, unresolved}] of references) {
    const {blueprint, unresolvedRefs, errors} = blueprintParserValidator(input, {
      debug: true,
      parameters,
    })
    t.same(blueprint, expected, `${name}: returned expected blueprint`)
    t.same(unresolvedRefs, unresolved, `${name}: returned expected unresolved references`)
    t.notOk(errors, `${name}: found no issues`)
    if (errors?.length) console.log(`${name} errors:`, errors)
  }

  // Basic reference errors
  for (const [name, {input, expected, unresolved}] of referenceErrors) {
    const {blueprint, unresolvedRefs, errors} = blueprintParserValidator(input, {
      debug: true,
      parameters: {},
    })
    t.same(blueprint, expected, `${name}: returned expected blueprint`)
    t.same(unresolvedRefs, unresolved, `${name}: returned expected unresolved references`)
    t.ok(errors, `${name}: parser / validator found an error`)
  }
})

tap.test('2024-10-01', async (t) => {
  const jsonSchema20241001 = schemas['2024-10-01'].sanity.blueprint

  const basic = Object.entries(mocks.basic)
  const basicErrors = Object.entries(mocks.basicErrors)
  const tests =
    basic.length * 3 +
    // allow tests to opt out of JSON Schema validation, when it's not as flexible as regular logic
    basicErrors.reduce((a, [, b]) => a + (b.metadata?.ignore ? 1 : 3), 0)
  t.plan(tests)

  // Check the basic structure of a document
  for (const [name, input] of basic) {
    const {errors} = blueprintParserValidator(input)
    t.notOk(errors, `${name}: parser / validator found no issues`)
    if (errors?.length) console.log(`${name} errors:`, errors)

    const valid = ajv.validate(jsonSchema20241001, input)
    t.ok(valid, `${name}: JSON Schema validator found no issues`)
    t.notOk(ajv.errors, `${name}: JSON Schema validator found no issues`)
    if (ajv.errors?.length) console.log(`${name} errors (AJV):`, ajv.errors)
  }

  // Basic validation errors
  for (const [name, input] of basicErrors) {
    const {errors} = blueprintParserValidator(input)
    t.ok(errors, `${name}: parser / validator found an error`)

    if (!input.metadata?.ignore) {
      const valid = ajv.validate(jsonSchema20241001, input)
      t.notOk(valid, `${name}: JSON Schema validator found an error`)
      t.ok(ajv.errors, `${name}: JSON Schema validator found an error`)
    }
  }
})
