export function elementHasParent(element, selector) {
    return element.closest(selector);
}

export function elementIsInArray(element, array) {
    return array.indexOf(element) !== -1;
}

export function getArrayIndexFromKeyValue(key, value, array) {
    return array.findIndex(element => value === element[key]);
}