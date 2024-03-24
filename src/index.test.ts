import * as utils from './index'

describe('#formatBytes', () => {
  let opts: utils.FormateByteOptions
  let result: string

  beforeEach(() => {
    const value = 50.4 * 1024 * 1024
    result = utils.formatBytes(value, opts)
  })

  describe('without any formatting options', () => {
    beforeAll(() => {
      opts = {}
    })

    it('should use the closest unit without any decimals in a short format', () => {
      expect(result).toBe('50 MB')
    })
  })

  describe('with base 10', () => {
    beforeAll(() => {
      opts = { base: 10, decimals: 2 }
    })

    it('should use the closest unit with base 10', () => {
      expect(result).toBe('52.85 MB')
    })
  })

  describe('with an invalid base', () => {
    it('should throw an error', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => utils.formatBytes(50, { base: 3 })).toThrow(
        'Unsupported base. base=3',
      )
    })
  })

  describe('with a specific unit', () => {
    beforeAll(() => {
      opts = { unit: 'KB' }
    })

    it('should use the specified unit', () => {
      expect(result).toBe('51,610 KB')
    })
  })

  describe('with a specific number of decimals', () => {
    beforeAll(() => {
      opts = { decimals: 2 }
    })

    it('should use the specified number of decimals', () => {
      expect(result).toBe('50.40 MB')
    })
  })

  describe('with a long format', () => {
    beforeAll(() => {
      opts = { long: true }
    })

    it('should use the long form of the unit', () => {
      expect(result).toBe('50 Megabytes')
    })
  })

  describe('with a specific locale, decimals and unit', () => {
    beforeAll(() => {
      opts = { locale: 'de-DE', decimals: 2, unit: 'KB' }
    })

    it('should use the specified locale', () => {
      expect(result).toBe('51.609,60 KB')
    })
  })

  describe('with all options', () => {
    beforeAll(() => {
      opts = { locale: 'de-DE', decimals: 2, unit: 'KB', long: true }
    })

    it('should use all options', () => {
      expect(result).toBe('51.609,60 Kilobytes')
    })
  })

  describe('with a negative value', () => {
    beforeAll(() => {
      opts = {}
    })

    it('should return a negative bytes string', () => {
      expect(utils.formatBytes(-50, opts)).toBe('-50 Bytes')
    })
  })

  describe('when passing an string', () => {
    beforeAll(() => {
      opts = {}
    })

    it('should throw an error', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => utils.formatBytes('50', opts)).toThrow(
        'Bytesize is not a number. bytes="50"',
      )
    })
  })

  describe('when passing an invalid value', () => {
    beforeAll(() => {
      opts = {}
    })

    it('should throw an error', () => {
      expect(() => utils.formatBytes(Number.NaN, opts)).toThrow(
        'Bytesize is not a number. bytes=NaN',
      )
    })
  })
})

describe('#bytes', () => {
  let locale: string | undefined
  let value: string
  let result: number

  beforeEach(() => {
    result = utils.bytes(value, { locale })
  })

  describe('with a simple number', () => {
    beforeAll(() => {
      value = '50'
    })

    it('should parse the number', () => {
      expect(result).toBe(50)
    })
  })

  describe('with a number and unit', () => {
    beforeAll(() => {
      value = '50 KB'
    })

    it('should parse the number and unit', () => {
      expect(result).toBe(50 * 1024)
    })
  })

  describe('with a number and long unit', () => {
    beforeAll(() => {
      value = '50 Kilobytes'
    })

    it('should parse the number', () => {
      expect(result).toBe(50 * 1024)
    })
  })

  describe('with a number and long unit and a locale', () => {
    beforeAll(() => {
      value = '50 Kilobytes'
      locale = 'de-DE'
    })

    it('should parse the number', () => {
      expect(result).toBe(50 * 1024)
    })
  })

  describe('with a number and unit and a locale', () => {
    beforeAll(() => {
      value = '50 KB'
      locale = 'de-DE'
    })

    it('should parse the number and unit', () => {
      expect(result).toBe(50 * 1024)
    })
  })

  describe('with a longer number and unit and a locale', () => {
    beforeAll(() => {
      value = '50.000,5 KB'
      locale = 'de-DE'
    })

    it('should parse the number and unit', () => {
      expect(result).toBe(50_000.5 * 1024)
    })
  })

  describe('with an empty string', () => {
    it('should throw an error', () => {
      expect(() => utils.bytes('', { locale })).toThrow(
        'Value is not a string or is empty. value=""',
      )
    })
  })

  describe('with a number', () => {
    it('should throw an error', () => {
      // @ts-expect-error - Testing invalid input
      expect(() => utils.bytes(50, { locale })).toThrow(
        'Value is not a string or is empty. value=50',
      )
    })
  })

  describe('with a string that exceeds 100 characters', () => {
    it('should throw an error', () => {
      expect(() => utils.bytes('x'.repeat(101), { locale })).toThrow(
        `Value exceeds the maximum length of 100 characters. value="${'x'.repeat(101)}"`,
      )
    })
  })
})

describe('#parseBytes', () => {
  let value: string
  let result: number

  beforeEach(() => {
    result = utils.parseBytes(value)
  })

  describe('with a simple number', () => {
    beforeAll(() => {
      value = '50'
    })

    it('should parse the number', () => {
      expect(result).toBe(50)
    })
  })

  describe('should equal to bytes', () => {
    it('should equal to bytes', () => {
      expect(utils.parseBytes).toBe(utils.bytes)
    })
  })
})

describe.each([
  { unit: 'kilobytes', power: 1 },
  { unit: 'megabytes', power: 2 },
  { unit: 'gigabytes', power: 3 },
  { unit: 'terabytes', power: 4 },
  { unit: 'petabytes', power: 5 },
  { unit: 'exabytes', power: 6 },
  { unit: 'zettabytes', power: 7 },
  { unit: 'yottabytes', power: 8 },
] as const)('#$unit', ({ unit, power }) => {
  it('should convert number to the correct number of bytes', () => {
    expect(utils[unit](5)).toBe(5 * 1024 ** power)
  })
})

describe('#createBytes', () => {
  let byteUtils: ReturnType<typeof utils.createBytes>

  beforeEach(() => {
    byteUtils = utils.createBytes({ base: 10, locale: 'de-DE' })
  })

  it('should return an object with all byte conversion functions', () => {
    expect(byteUtils.bytes).toBeInstanceOf(Function)
    expect(byteUtils.formatBytes).toBeInstanceOf(Function)
    expect(byteUtils.kilobytes).toBeInstanceOf(Function)
    expect(byteUtils.megabytes).toBeInstanceOf(Function)
    expect(byteUtils.gigabytes).toBeInstanceOf(Function)
    expect(byteUtils.terabytes).toBeInstanceOf(Function)
    expect(byteUtils.petabytes).toBeInstanceOf(Function)
    expect(byteUtils.exabytes).toBeInstanceOf(Function)
    expect(byteUtils.zettabytes).toBeInstanceOf(Function)
    expect(byteUtils.yottabytes).toBeInstanceOf(Function)
  })

  describe('when calling the bytes function', () => {
    let result: number

    beforeEach(() => {
      result = byteUtils.bytes('50 KB')
    })

    it('should return the correct number of bytes', () => {
      expect(result).toBe(50 * 1000)
    })
  })

  describe('when calling the parseBytes function', () => {
    let result: number

    beforeEach(() => {
      result = byteUtils.parseBytes('50 KB')
    })

    it('should return the correct number of bytes', () => {
      expect(result).toBe(50 * 1000)
    })

    it('should equal to bytes', () => {
      expect(byteUtils.parseBytes).toBe(byteUtils.bytes)
    })
  })

  describe('when calling the formatBytes function', () => {
    let result: string

    beforeEach(() => {
      result = byteUtils.formatBytes(50 * 1000)
    })

    it('should return the correct formatted string', () => {
      expect(result).toBe('50 KB')
    })
  })

  describe.each([
    { unit: 'kilobytes', power: 1 },
    { unit: 'megabytes', power: 2 },
    { unit: 'gigabytes', power: 3 },
    { unit: 'terabytes', power: 4 },
    { unit: 'petabytes', power: 5 },
    { unit: 'exabytes', power: 6 },
    { unit: 'zettabytes', power: 7 },
    { unit: 'yottabytes', power: 8 },
  ] as const)('#$unit', ({ unit, power }) => {
    it('should convert number to the correct number of bytes', () => {
      expect(byteUtils[unit](5)).toBe(5 * 1000 ** power)
    })
  })
})
