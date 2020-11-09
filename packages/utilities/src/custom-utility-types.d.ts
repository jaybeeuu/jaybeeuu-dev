type ValueOrFactory<Value> = Value extends Function ? never : Value | (() => Value);
