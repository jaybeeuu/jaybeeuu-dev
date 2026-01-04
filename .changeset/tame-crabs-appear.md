---
"@jaybeeuu/is": minor
---

Add .optional to typepredicates, giving a simple way to declare a property as optional.

Add user-defined type guard overload to the `is` function, allowing users to pass custom type guards directly: `is((data): data is MyType => ...)`. This provides a consistent API for all validation scenarios and seamlessly integrates with existing validation builders like `isObject`.
