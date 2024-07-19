export function dateConverterForDb(utcDateString: string): string {
    const offset = new Date().getTimezoneOffset()
    const date = new Date(utcDateString).getTime() + offset * 60 * 1000
    const convertedDate = new Date(date)
    return `${convertedDate.getFullYear()}-${('0' + (convertedDate.getMonth() + 1)).slice(-2)}-${('0' + convertedDate.getDate()).slice(-2)}`
}
