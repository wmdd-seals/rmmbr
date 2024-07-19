const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]

export function formatDate(dateString: string): string {
    const [year, month, day] = dateString.split('-')
    const monthString = months[Number(month) - 1]

    return `${monthString} ${day}, ${year}`
}
