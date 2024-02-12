export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: unknown): value is Array<unknown> {
  return Array.isArray(value);
}

export function isNonEmptyArray(value: unknown): value is Array<unknown> {
  return isArray(value) && value.length > 0;
}

export function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isStringStringRecord(
  value: unknown,
): value is Record<string, string> {
  if (!isRecord(value)) {
    return false;
  }

  for (const val of Object.values(value)) {
    if (!isString(val)) {
      return false;
    }
  }

  return true;
}

export function isStringArray(value: unknown): value is string[] {
  if (!isArray(value)) {
    return false;
  }

  for (const val of value) {
    if (!isString(val)) {
      return false;
    }
  }

  return true;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0;
}

export function isNumber(
  value: number | unknown | null | undefined,
): value is number {
  return typeof value === 'number';
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isDate(
  value: Date | unknown | null | undefined,
): value is Date {
  return typeof value === 'object';
}

export function isArrayOrUndefined(
  value: unknown,
): value is Array<unknown> | undefined {
  return isUndefined(value) || Array.isArray(value);
}

export function isArrayOrUndefinedOrNull(
  value: unknown,
): value is Array<unknown> | undefined | null {
  return isNull(value) || isArrayOrUndefined(value);
}

export function isStringOrUndefined(
  value: unknown,
): value is string | undefined {
  return isUndefined(value) || isString(value);
}

export function isStringOrUndefinedOrNull(
  value: unknown,
): value is string | undefined | null {
  return isNull(value) || isUndefined(value) || isString(value);
}

export function isNumberOrUndefined(
  value: unknown,
): value is number | undefined {
  return isUndefined(value) || isNumber(value);
}

export function isNumberOrUndefinedOrNull(
  value: unknown,
): value is number | undefined | null {
  return isNull(value) || isUndefined(value) || isNumber(value);
}

export function isBooleanOrUndefined(
  value: unknown,
): value is boolean | undefined {
  return isUndefined(value) || isBoolean(value);
}

export function isBooleanOrUndefinedOrNull(
  value: unknown,
): value is boolean | undefined | null {
  return isNull(value) || isUndefined(value) || isBoolean(value);
}

export function isUndefinedOrNull(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}

export type func = (...args: unknown[]) => unknown | Promise<unknown>;

export function isFunction(input: unknown): input is func {
  return typeof input === 'function';
}

export function assertValue(
  input: unknown,
  // eslint-disable-next-line @typescript-eslint/ban-types
  T: func | Function | FunctionConstructor,
): boolean {
  const assertion = input instanceof T;
  console.assert(assertion);
  return assertion;
}
