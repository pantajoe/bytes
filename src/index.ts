interface ByteFormatConfig {
  /**
   * The base to use for the conversion.
   *
   * @default 2
   */
  base?: 2 | 10

  /**
   * The default locale to use for parsing/formatting the output.
   *
   * @default 'en-US'
   */
  locale?: string
}

const BYTE_FORMAT_DEFAULTS: Required<ByteFormatConfig> = {
  base: 2,
  locale: 'en-US',
} as const

const BYTE_SIZES = [
  {
    short: 'Bytes',
    long: 'Bytes',
  },
  {
    short: 'KB',
    long: 'Kilobytes',
  },
  {
    short: 'MB',
    long: 'Megabytes',
  },
  {
    short: 'GB',
    long: 'Gigabytes',
  },
  {
    short: 'TB',
    long: 'Terabytes',
  },
  {
    short: 'PB',
    long: 'Petabytes',
  },
  {
    short: 'EB',
    long: 'Exabytes',
  },
  {
    short: 'ZB',
    long: 'Zettabytes',
  },
  {
    short: 'YB',
    long: 'Yottabytes',
  },
] as const
type ByteSize = (typeof BYTE_SIZES)[number]['short']
type LongByteSize = (typeof BYTE_SIZES)[number]['long']

type Unit = ByteSize | LongByteSize
type UnitAnyCase = Unit | Uppercase<Unit> | Lowercase<Unit>

export type StringValue =
  | `${number}`
  | `${number}${UnitAnyCase}`
  | `${number} ${UnitAnyCase}`

export interface ParseByteOptions extends ByteFormatConfig {}
export interface FormateByteOptions
  extends ByteFormatConfig,
    Omit<
      Intl.NumberFormatOptions,
      | 'style'
      | 'unit'
      | 'unitDisplay'
      | 'currencyDisplay'
      | 'currencySign'
      | 'currency'
    > {
  /**
   * Specify the number of decimals to include in the output.
   *
   * **Note**: If `minFractionDigits` or `maxFractionDigits` are set, this option will be ignored.
   *
   * @default 0
   */
  decimals?: number

  /**
   * Specify the unit to use for the output.
   *
   * Uses the closest unit to the given value per default.
   */
  unit?: ByteSize

  /**
   * Whether to use the long form of the unit.
   *
   * @default false
   */
  long?: boolean
}

/**
 * Parse the given bytesize string and return bytes.
 *
 * @param value - The string to parse
 * @param options - Options for the conversion from string to bytes
 * @throws Error if `value` is not a non-empty string or a number
 */
export function bytes(value: string, options?: ParseByteOptions): number {
  if (typeof value !== 'string' || value.length === 0)
    throw new TypeError(
      `Value is not a string or is empty. value=${JSON.stringify(value)}`,
    )

  if (value.length > 100)
    throw new TypeError(
      `Value exceeds the maximum length of 100 characters. value=${JSON.stringify(value)}`,
    )

  const match =
    /^(?<value>-?(?:\d+(([.,])\d+)*)?[.,]?\d+) *(?<type>bytes?|b|kb|kib|mb|mib|gb|gib|tb|tib|pb|pib|eb|eib|zb|zib|yb|yib|(kilo|kibi|mega|mebi|giga|gibi|tera|tebi|peta|pebi|exa|exbi|zetta|zebi|yotta|yobi)?bytes)?$/i.exec(
      value,
    )
  // Named capture groups need to be manually typed today.
  // https://github.com/microsoft/TypeScript/issues/32098
  const groups = match?.groups as { value: string; type?: string } | undefined
  if (!groups) return Number.NaN

  const n = parseLocalizedNumber(groups.value, options?.locale)
  const type = (groups.type || 'Bytes')
    .toUpperCase()
    .replace(/^KIBI/, 'KILO')
    .replace(/^MIBI/, 'MEGA')
    .replace(/^GIBI/, 'GIGA')
    .replace(/^TEBI/, 'TERA')
    .replace(/^PEBI/, 'PETA')
    .replace(/^EXBI/, 'EXA')
    .replace(/^ZEBI/, 'ZETTA')
    .replace(/^YIBI/, 'YOTTA')
    .replace(/^(.)IB$/, '$1B') as Uppercase<Unit> | 'B'
  const level = BYTE_SIZES.findIndex(
    (unit) => unit.short[0].toUpperCase() === type[0],
  )

  const base = fromBase(options?.base || BYTE_FORMAT_DEFAULTS.base)

  return n * base ** level
}

/**
 * Parse the given bytesize string and return bytes.
 *
 * @param value - The string to parse
 * @param options - Options for the conversion from string to bytes
 * @throws Error if `value` is not a non-empty string or a number
 */
export const parseBytes = bytes

/**
 * Formats the given bytes into a human-readable string.
 * Per default, it will use the closest unit to the given value.
 *
 * @param bytes - The bytes to format
 * @param options - Options for the conversion from bytes to string
 */
export function formatBytes(
  bytes: number,
  options?: FormateByteOptions,
): string {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes))
    throw new TypeError(
      `Bytesize is not a number. bytes=${Number.isNaN(bytes) ? 'NaN' : JSON.stringify(bytes)}`,
    )

  const {
    decimals = 0,
    long = false,
    unit: requestedUnit,
    locale = BYTE_FORMAT_DEFAULTS.locale,
    base: givenBase,
    ...l10nOptions
  } = options || {}
  const base = fromBase(givenBase || BYTE_FORMAT_DEFAULTS.base)

  const absoluteBytes = Math.abs(bytes)

  const requestedUnitIndex = BYTE_SIZES.findIndex(
    (unit) => unit.short === requestedUnit,
  )
  const level =
    requestedUnitIndex >= 0
      ? requestedUnitIndex
      : Math.min(
          Math.floor(Math.log(absoluteBytes) / Math.log(base)),
          BYTE_SIZES.length - 1,
        )
  const unit = BYTE_SIZES[level][long ? 'long' : 'short']

  const value = bytes / base ** level
  const fractionDigits = decimals < 0 ? undefined : decimals
  const formattedValue = new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
    ...l10nOptions,
  }).format(value)

  return `${formattedValue} ${unit}`
}

/**
 * Parse a localized number to a float.
 * @param stringNumber - the localized number
 * @param locale - [optional] the locale that the number is represented in. Omit this parameter to use the current locale.
 */
function parseLocalizedNumber(
  stringNumber: string,
  locale = BYTE_FORMAT_DEFAULTS.locale,
) {
  const thousandSeparator = new Intl.NumberFormat(locale)
    .format(11111)
    .replace(/\p{Number}/gu, '')
  const decimalSeparator = new Intl.NumberFormat(locale)
    .format(1.1)
    .replace(/\p{Number}/gu, '')

  return Number.parseFloat(
    stringNumber
      .replace(new RegExp(`\\${thousandSeparator}`, 'g'), '')
      .replace(new RegExp(`\\${decimalSeparator}`), '.'),
  )
}

type ByteConversionUtils = {
  [K in Exclude<Lowercase<(typeof BYTE_SIZES)[number]['long']>, 'bytes'>]: (
    value: number,
    opts?: Pick<ByteFormatConfig, 'base'>,
  ) => number
}
const byteConversionUtils: ByteConversionUtils = BYTE_SIZES.reduce(
  (acc, { long }, level) => {
    if (long === 'Bytes') return acc

    const functionName = long.toLowerCase() as Lowercase<typeof long>
    acc[functionName] = (value, opts) =>
      value * fromBase(opts?.base || BYTE_FORMAT_DEFAULTS.base) ** level
    return acc
  },
  {} as ByteConversionUtils,
)

export const {
  kilobytes,
  megabytes,
  gigabytes,
  terabytes,
  petabytes,
  exabytes,
  zettabytes,
  yottabytes,
} = byteConversionUtils

interface ByteUtilities extends ByteConversionUtils {
  bytes: typeof bytes
  parseBytes: typeof bytes
  formatBytes: typeof formatBytes
}

export function createBytes(options: ByteFormatConfig): ByteUtilities {
  const byteFormat = { ...BYTE_FORMAT_DEFAULTS, ...options }
  const byteConversionUtils: ByteConversionUtils = BYTE_SIZES.reduce(
    (acc, { long }, level) => {
      if (long === 'Bytes') return acc

      const functionName = long.toLowerCase() as Lowercase<typeof long>
      acc[functionName] = (value, opts) => {
        return value * fromBase(opts?.base || byteFormat.base) ** level
      }
      return acc
    },
    {} as ByteConversionUtils,
  )

  return {
    ...byteConversionUtils,
    bytes: (value, opts) =>
      bytes(value, {
        base: byteFormat.base,
        locale: byteFormat.locale,
        ...opts,
      }),
    parseBytes: (value, opts) =>
      bytes(value, {
        base: byteFormat.base,
        locale: byteFormat.locale,
        ...opts,
      }),
    formatBytes: (value, opts) =>
      formatBytes(value, {
        base: byteFormat.base,
        locale: byteFormat.locale,
        ...opts,
      }),
  }
}

function fromBase(base: 2 | 10) {
  if (base === 2) return 1024
  if (base === 10) return 1000

  throw new TypeError(`Unsupported base. base=${base}`)
}
