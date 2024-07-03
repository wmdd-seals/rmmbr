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
    const date = new Date(dateString)

    const month = months[date.getMonth()]

    return `${month} ${date.getDate()}, ${date.getFullYear()}`
}
