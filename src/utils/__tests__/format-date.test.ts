import { describe, expect, it } from 'vitest'
import { formatDate } from '../format-date'

describe('format-date helper', () => {
    it('should format date', () => {
        const date1 = '2024-8-20'
        const date2 = '2022-9-10'
        const date3 = '2020-10-30'
        const date4 = '2021-11-5'
        const date5 = '2023-2-15'
        const date6 = '2023-4-11'
        const date7 = '2022-5-18'
        const date8 = '2021-6-20'
        const date9 = '2019-7-2'
        expect(formatDate(date1)).toBe('August 20, 2024')
        expect(formatDate(date2)).toBe('September 10, 2022')
        expect(formatDate(date3)).toBe('October 30, 2020')
        expect(formatDate(date4)).toBe('November 5, 2021')
        expect(formatDate(date5)).toBe('February 15, 2023')
        expect(formatDate(date6)).toBe('April 11, 2023')
        expect(formatDate(date7)).toBe('May 18, 2022')
        expect(formatDate(date8)).toBe('June 20, 2021')
        expect(formatDate(date9)).toBe('July 2, 2019')
    })
})
