import moment from 'moment'

/**
 * Returns an error for every value considered "empty" (Empty string, undefined, null)
 *
 * @param {*} val - The value to test
 */
export const required = (val) => {
  if (val == null || val === '' || val.length === 0) {
    return 'Field is required'
  }

  return undefined
}

/**
 * Returns a validator function that returns an Error for every string that does not repesent a valid date
 *
 * @param {string|moment} opts.minDate - Min required date, anything before but not exactly at this date will be considered illegal
 * @param {string|moment} opts.maxDate - Max required date, anything after but not exactly at this date will be considered illegal
 */
export const isDate = ({ minDate, maxDate }) => (val) => {
  // don't validate if no value is set
  if (required(val) !== undefined) {
    return undefined
  }

  const valAsMoment = moment(val, moment.ISO_8601)

  if (!valAsMoment.isValid()) {
    return 'Invalid Date'
  }

  if (minDate && valAsMoment.isBefore(moment(minDate))) {
    return 'Date is before min. date'
  }

  if (maxDate && valAsMoment.isAfter(moment(maxDate))) {
    return 'Date is after max. date'
  }

  return undefined
}

/**
 * Returns a validator function that returns an Error for every string that does not represent a number
 *
 * @function
 * @param {number} opts.decimals - Allowed Decimalplaces
 * @param {string} opts.decimalsProp - Allowed Decimalplaces (get from props with this key)
 * @param {bool} opts.realOnly - Disallows floats
 */
export const isNumber = ({ decimals, realOnly, decimalsProp }) => (val, vals, props) => {
  // don't validate if no value is set
  if (required(val) !== undefined) {
    return undefined
  }

  /* global isNan, isFinite */
  if (/[^.\d]/g.test(val) || isNaN(parseFloat(val)) || !isFinite(val)) {
    return 'Invalid Number'
  }

  if (decimals || decimalsProp) {
    const decimalNumbersAllowed = decimals || props[decimalsProp]

    if (required(decimalNumbersAllowed) === undefined) {
      const decimalNumbers = val.split('.')[1]

      if (decimalNumbers && decimalNumbers.length > decimalNumbersAllowed) {
        return `Too many decimals, only ${decimalNumbersAllowed} numbers after decimalpoint are legal`
      }
    }
  }

  if (realOnly && (parseFloat(val) !== parseInt(val, 10) || /[.]/g.test(val))) {
    return 'Only integer numbers are allowed'
  }

  return undefined
}

/**
 * Returns a validator function that combines multiple validators, returning their errors comma seperated
 *
 * @function
 * @param {...*} arguments - Validator functions
 * @param {array} arr - Validator functions as array
 */
export const all = (...args) => {
  // Allow from array or from arguments keyword
  let validators = Array.from(args)
  if (typeof validators[0] !== 'function') {
    validators = args[0]
  }

  return (val, values, props) => {
    console.log(validators)

    // reduce all validators to error messages or lack of such
    const allErrors = validators.reduce((errors, validator) => {
      const valError = validator(val, values, props)

      if (valError) {
        errors.push(valError)
      }

      return errors
    }, [])

    return allErrors.length ? allErrors.join(', ') : undefined
  }
}
