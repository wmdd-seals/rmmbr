export function monthsUntil(date: string): number {
    const now = new Date()
    const incoming = new Date(date)
    const passedYearsMonths = (incoming.getFullYear() - now.getFullYear()) * 12

    return passedYearsMonths + incoming.getMonth() - now.getMonth()
}
