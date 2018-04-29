export function toCamelCase(string) {
    return string.replace(/[\s\t\n\-\_]+(\w)/g, (all, letter) =>
        letter.toUpperCase()
    );
}
