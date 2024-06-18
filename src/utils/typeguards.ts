export function isTruthyString(arg: string): arg is string {
    return typeof arg === 'string' && arg.length > 0
}
