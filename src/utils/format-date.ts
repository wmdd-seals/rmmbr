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
    const offset = new Date().getTimezoneOffset()
    const date = new Date(dateString).getTime() + offset * 60 * 1000
    const convertedDate = new Date(date)
    const month = months[convertedDate.getMonth()]

    return `${month} ${convertedDate.getDate()}, ${convertedDate.getFullYear()}`
}
