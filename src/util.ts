/**
 * Clone a simple JSON object
 */
export function clone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const newArr = [];
    for (const item of obj) {
      newArr.push(typeof item === 'object' ? clone(item) : item);
    }
    // tslint:disable-next-line:no-any
    return <T>(<any>newArr);
  } else {
    const newObj = <T>{};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const item = obj[key];
        newObj[key] =
          typeof item === 'object' && item !== null ? clone(item) : item;
      }
    }
    return newObj;
  }
}

/**
 * Efficient equality check
 */
// tslint:disable-next-line:no-any
export function deepEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);

  if (isArrayA && isArrayB) {
    if (a.length !== b.length) {
      return false;
    }

    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }

    return true;
  }

  if (isArrayA !== isArrayB) {
    return false;
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a);
    if (keysA.length !== Object.keys(b).length) {
      return false;
    }

    const isDateA = a instanceof Date;
    const isDateB = b instanceof Date;

    if (isDateA && isDateB) {
      return a.getTime() === b.getTime();
    }

    if (isDateA !== isDateB) {
      return false;
    }

    const isRegexA = a instanceof RegExp;
    const isRegexB = b instanceof RegExp;

    if (isRegexA && isRegexB) {
      return a.toString() === b.toString();
    }

    if (isRegexA !== isRegexA) {
      return false;
    }

    for (let i = 0; i < keysA.length; i++) {
      if (!Object.prototype.hasOwnProperty.call(b, keysA[i])) {
        return false;
      }
    }

    for (let i = 0; i < keysA.length; i++) {
      if (!deepEqual(a[keysA[i]], b[keysA[i]])) {
        return false;
      }
    }

    return true;
  }

  return false;
}
