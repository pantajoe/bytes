[![codecov](https://codecov.io/gh/pantajoe/bytes/graph/badge.svg?token=T6FH2EEDT2)](https://codecov.io/gh/pantajoe/bytes)
[![Build Status](https://github.com/pantajoe/bytes/actions/workflows/ci.yml/badge.svg)](https://github.com/pantajoe/bytes/actions)
[![npm version](https://badge.fury.io/js/%40pantajoe%2Fbytes.svg)](https://badge.fury.io/js/%40pantajoe%2Fbytes)

# @pantajoe/bytes

> Convert bytes to human readable strings and vice versa:
> 1024 → 1KB and 1KB → 1024

A tiny utility (**4.96KB**) to convert bytes to a formatted string and vice versa.

## ✨ Highlights

- **Formatting**: Convert bytes to a human-readable string (e.g., `1KB`, `2.5MB`, `5GB`, etc.).
- **Parsing**: Convert a human-readable string to bytes (e.g., `1KB` -> `1024`, `2.5MB` -> `2621440`, `5GB` -> `5368709120`, etc.).
- **L10n**: Supports localization (e.g., `1.5KB` in German is `1,5KB`) via `Intl.NumberFormat`
- **Opionated**: The default format is `0.1` (e.g., `1.5KB`). You can customize the format.
- **Base 2**: Uses base 2 for calculations (e.g., `1KB = 1024 bytes`). (You can use base 10 if you prefer).
- **Tiny**: Only **5KB** in size.
- **Zero Dependencies**: No dependencies, just pure JavaScript.

## Installation

```bash
pnpm add @pantajoe/bytes

#or
npm install @pantajoe/bytes

# or
yarn add @pantajoe/bytes
```

## Usage

### Default Formatting/Parsing

```js
import { formatBytes, bytes } from '@pantajoe/bytes'

console.log(formatBytes(123412341, { decimals: 2 })) // "117.70 MB"
console.log(bytes('117.70 MB')) // 123417395.2

// Localization support in both directions
console.log(formatBytes(123412341, { decimals: 2, locale: 'de' })) // "117,70 MB"
console.log(bytes('117,70 MB', { locale: 'de' })) // 123417395.2

// Use a specified unit
console.log(formatBytes(123412341, { decimals: 2, unit: 'KB' })) // "120,519.86 KB"

// Use a long unit
console.log(formatBytes(123412341, { decimals: 2, unit: 'GB', long: true })) // "0.11 Gigabytes"

// Use a differnet base
console.log(formatBytes(123412341, { decimals: 2, base: 10 })) // "123.41 MB"
```

### Byte utilities

```js
import { megabytes, gigabytes, terabytes, petabytes, exabytes, yottabytes } from '@pantajoe/bytes'

console.log(megabytes(1)) // 1048576
console.log(gigabytes(1)) // 1073741824
console.log(terabytes(1)) // 1099511627776
console.log(petabytes(1)) // 1125899906842624
console.log(exabytes(1)) // 1152921504606847000
console.log(yottabytes(1)) // 1.2089258196146292e+24

// Use a different base
console.log(megabytes(1, { base: 10 })) // 1000000
console.log(gigabytes(1, { base: 10 })) // 1000000000
console.log(terabytes(1, { base: 10 })) // 1000000000000
console.log(petabytes(1, { base: 10 })) // 1000000000000000
console.log(exabytes(1, { base: 10 })) // 1000000000000000000
console.log(yottabytes(1, { base: 10 })) // 1e+24
```

### Custom Formatting/Parsing & utilities

`@pantajoe/bytes` is a tiny utility that allows you to create your own utility functions
via `createBytes` if you have preferences regarding default locale and base:

```js
// bytes.util.ts
import { createBytes } from '@pantajoe/bytes'

const {
  formatBytes,
  bytes,
  megabytes,
  gigabytes,
  terabytes,
  petabytes,
  exabytes,
  yottabytes
} = createBytes({ locale: 'de', base: 10 })
```

```js
// main.ts
import { formatBytes } from './bytes.util'

formatBytes(123412341, { decimals: 2 }) // "123,41 MB"
```
