export function daysUntil(date: string): number {
    return Math.max(Math.floor((Date.parse(date) - Date.now()) / (1000 * 60 * 60 * 24)), 1)
}
