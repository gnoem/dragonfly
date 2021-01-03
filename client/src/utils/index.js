/* export function elementHasParent(element, classname) {
    if (element.className && element.className.split(' ').indexOf(classname) >= 0) return true;
    return element.parentNode && elementHasParent(element.parentNode, classname);
} // */

export function elementHasParent(element, selector) {
    return element.closest(selector);
}