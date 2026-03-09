# @jaybeeuu/is

## 3.0.0

### Major Changes

- [#198](https://github.com/jaybeeuu/jaybeeuu-dev/pull/198) [`986076c`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/986076c6a4c0ca0e143b2c955e21e7b2edcf8584) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Breaking: TypeScript module system changed from `ESNext` to `nodenext`. Requires Node.js ESM resolution. Import paths now require `.js` extensions.

### Minor Changes

- [#198](https://github.com/jaybeeuu/jaybeeuu-dev/pull/198) [`986076c`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/986076c6a4c0ca0e143b2c955e21e7b2edcf8584) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Breaking: Compost now requires a `compost.config.ts` file. API redesigned around configurable content types with user-defined type guards for validation. New V2 manifest format (V1 auto-upgrades). Posts-specific code moved to generic `/content` module.

- [#198](https://github.com/jaybeeuu/jaybeeuu-dev/pull/198) [`986076c`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/986076c6a4c0ca0e143b2c955e21e7b2edcf8584) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Add .optional to typepredicates, giving a simple way to declare a property as optional.

  Add user-defined type guard overload to the `is` function, allowing users to pass custom type guards directly: `is((data): data is MyType => ...)`. This provides a consistent API for all validation scenarios and seamlessly integrates with existing validation builders like `isObject`.

## 2.1.1

### Patch Changes

- [#192](https://github.com/jaybeeuu/jaybeeuu-dev/pull/192) [`fca31c0`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/fca31c081ea20e65c579e172ad4f00181c8852b7) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Add comprehensive slug validation tests and fix TypeScript build issues
  - Add unit tests for validateSlug function with proper regex anchoring
  - Fix slug validation regex to exclude invalid characters between Z and a
  - Resolve TypeScript errors in preact-router Link components with proper type declarations
  - Add Cloudflare \_headers file for correct feed content types
  - Fix CircleCI config typo and update dependencies
  - Update all dependencies

## 2.1.0

### Minor Changes

- [#186](https://github.com/jaybeeuu/jaybeeuu-dev/pull/186) [`e301391`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/e301391482f98912f9a51ec309e72431408cb6f0) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Add isKeyOf to allow users to require data be a key of an object.

## 2.0.2

### Patch Changes

- [#177](https://github.com/jaybeeuu/jaybeeuu-dev/pull/177) [`ef1b79d`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/ef1b79d66a27e2837ea87c78ad254e1eae784c3c) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Update dependencies, and update to eslint 9.0

## 2.0.1

### Patch Changes

- [#171](https://github.com/jaybeeuu/jaybeeuu-dev/pull/171) [`bb4d651`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/bb4d651bd3262478978fd8cb2e6c3ba56fb452e9) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Update all dependencies

## 2.0.0

### Major Changes

- [#167](https://github.com/jaybeeuu/jaybeeuu-dev/pull/167) [`1f2a946`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/1f2a946dd190c5b8171034481f48df4217b1ee69) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - CHanges to expose previously hidden methods on typ predicate, and improvements to error messages produced.

## 1.0.0

### Major Changes

- [#164](https://github.com/jaybeeuu/jaybeeuu-dev/pull/164) [`0a9a96e`](https://github.com/jaybeeuu/jaybeeuu-dev/commit/0a9a96e3be44a79d4782d089d23c6271fc245498) Thanks [@jaybeeuu](https://github.com/jaybeeuu)! - Move typeguards from `utilities` to new `is` package.
