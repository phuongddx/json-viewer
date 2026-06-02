import { useState, useCallback, useMemo } from 'react'
import { JsonInput } from '../json-input/json-input'
import { validateWithSchemaString } from '../../utils/json-schema-validate'
import styles from './schema-validator.module.css'

const SAMPLE_SCHEMA = `{
  "type": "object",
  "required": ["name", "age"],
  "properties": {
    "name": { "type": "string", "minLength": 1 },
    "age": { "type": "number", "minimum": 0 },
    "email": { "type": "string" }
  },
  "additionalProperties": false
}`

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)

const XCircleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
)

export function SchemaValidator() {
  const [dataText, setDataText] = useState('')
  const [schemaText, setSchemaText] = useState(SAMPLE_SCHEMA)

  const dataError = useMemo(() => {
    if (!dataText.trim()) return null
    try {
      JSON.parse(dataText)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid JSON'
    }
  }, [dataText])

  const dataValid = dataText.trim() !== '' && !dataError

  const schemaError = useMemo(() => {
    if (!schemaText.trim()) return null
    try {
      JSON.parse(schemaText)
      return null
    } catch (e) {
      return e instanceof Error ? e.message : 'Invalid JSON'
    }
  }, [schemaText])

  const schemaValid = schemaText.trim() !== '' && !schemaError

  const { schemaErrors, validationErrors } = useMemo(() => {
    if (!dataValid || !schemaValid) return { schemaErrors: [], validationErrors: [] }
    const parsedData = JSON.parse(dataText)
    return validateWithSchemaString(parsedData, schemaText)
  }, [dataText, schemaText, dataValid, schemaValid])

  const hasSchemaErrors = schemaErrors.length > 0
  const hasValidationErrors = validationErrors.length > 0
  const isFullyValid = dataValid && schemaValid && !hasSchemaErrors && !hasValidationErrors
  const hasResult = dataValid && schemaValid && !hasSchemaErrors

  const handleBeautify = useCallback((setter: (v: string) => void, text: string) => {
    try {
      setter(JSON.stringify(JSON.parse(text), null, 2))
    } catch { /* ignore */ }
  }, [])

  const handleMinify = useCallback((setter: (v: string) => void, text: string) => {
    try {
      setter(JSON.stringify(JSON.parse(text)))
    } catch { /* ignore */ }
  }, [])

  return (
    <div className={styles.container}>
      <div className={styles.panels}>
        <div className={styles.panel}>
          <JsonInput
            value={dataText}
            error={dataError}
            isValid={dataValid}
            onChange={setDataText}
            onBeautify={() => handleBeautify(setDataText, dataText)}
            onMinify={() => handleMinify(setDataText, dataText)}
            onClear={() => setDataText('')}
            placeholder="Paste your JSON data here..."
          />
        </div>
        <div className={styles.panel}>
          <JsonInput
            value={schemaText}
            error={schemaError}
            isValid={schemaValid}
            onChange={setSchemaText}
            onBeautify={() => handleBeautify(setSchemaText, schemaText)}
            onMinify={() => handleMinify(setSchemaText, schemaText)}
            onClear={() => setSchemaText('')}
            placeholder="Paste your JSON Schema here..."
          />
        </div>
      </div>

      <div className={styles.resultsSection}>
        {hasResult ? (
          <>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsTitle}>Validation Results</span>
              <span className={`${styles.badge} ${isFullyValid ? styles.badgeSuccess : styles.badgeError}`}>
                {isFullyValid ? 'Valid' : `${validationErrors.length} error${validationErrors.length !== 1 ? 's' : ''}`}
              </span>
            </div>

            {hasValidationErrors ? (
              <ul className={styles.errorList}>
                {validationErrors.map((err, i) => (
                  <li key={i} className={styles.errorItem}>
                    <span className={styles.errorIcon}><XCircleIcon /></span>
                    <span>
                      {err.path && <span className={styles.errorPath}>{err.path}</span>}
                      {err.path ? ' — ' : ''}
                      <span className={styles.errorMessage}>{err.message}</span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.validMessage}>
                <span className={styles.validIcon}><CheckIcon /></span>
                JSON data is valid against the schema
              </div>
            )}
          </>
        ) : hasSchemaErrors ? (
          <>
            <div className={styles.resultsHeader}>
              <span className={styles.resultsTitle}>Schema Errors</span>
              <span className={`${styles.badge} ${styles.badgeError}`}>
                {schemaErrors.length} error{schemaErrors.length !== 1 ? 's' : ''}
              </span>
            </div>
            <ul className={styles.schemaErrorList}>
              {schemaErrors.map((err, i) => (
                <li key={i} className={styles.schemaErrorItem}>
                  {err.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className={styles.placeholder}>
            Enter valid JSON data and a JSON Schema to validate
          </div>
        )}
      </div>
    </div>
  )
}
