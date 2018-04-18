/**
 * Convert a dash / dot / underline / separation of spaces in camelCase: foo-bar → fooBar
 * @param {string} string
 * @returns {string}
 */
export function toCamelCase(string) {
    return string.replace(/[\s\t\n\-\_]+(\w)/g, (all, letter) =>
        letter.toUpperCase()
    );
}
