export function daysFrom(date: string): number {
    return Math.max(Math.floor((Date.now() - Date.parse(date)) / (1000 * 60 * 60 * 24)), 0)
}
