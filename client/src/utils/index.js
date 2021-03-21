export const elementHasParent = (element, selector) => {
    return element.closest(selector);
}

export const elementIsInArray = (element, array) => {
    return array.indexOf(element) !== -1;
}