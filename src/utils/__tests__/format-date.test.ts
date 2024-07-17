import { describe, expect, it } from 'vitest'
import { formatDate } from '../format-date'

describe('format-date helper', () => {
    it('should format date', () => {
        const date1 = new Date(2024, 7, 20)
        const date2 = new Date(2022, 8, 10)
        const date3 = new Date(2020, 9, 30)
        const date4 = new Date(2021, 10, 5)
        const date5 = new Date(2023, 1, 15)
        const date6 = new Date(2023, 3, 11)
        const date7 = new Date(2022, 4, 18)
        const date8 = new Date(2021, 5, 20)
        const date9 = new Date(2019, 6, 2)

        expect(formatDate(date1.toString())).toBe('August 20, 2024')
        expect(formatDate(date2.toString())).toBe('September 10, 2022')
        expect(formatDate(date3.toString())).toBe('October 30, 2020')
        expect(formatDate(date4.toString())).toBe('November 5, 2021')
        expect(formatDate(date5.toString())).toBe('February 15, 2023')
        expect(formatDate(date6.toString())).toBe('April 11, 2023')
        expect(formatDate(date7.toString())).toBe('May 18, 2022')
        expect(formatDate(date8.toString())).toBe('June 20, 2021')
        expect(formatDate(date9.toString())).toBe('July 2, 2019')
    })
})
