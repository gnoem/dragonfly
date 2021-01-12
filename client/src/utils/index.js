export function elementHasParent(element, selector) {
    return element.closest(selector);
}

export function elementIsInArray(element, array) {
    return array.indexOf(element) !== -1;
}