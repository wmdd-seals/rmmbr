export function daysUntil(date: string): number {
    return Math.max(Math.round((Date.parse(date) - Date.now()) / (1000 * 60 * 60 * 24)), 0)
}
