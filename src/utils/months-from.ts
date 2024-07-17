export function monthsFrom(date: string): number {
    const now = new Date()
    const incoming = new Date(date)
    const passedYearsMonths = (now.getFullYear() - incoming.getFullYear()) * 12

    return passedYearsMonths + now.getMonth() - incoming.getMonth()
}
