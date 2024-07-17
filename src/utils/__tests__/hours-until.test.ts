import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { hoursUntil } from '../hours-until'
describe('hoursFrom', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })
    it('should return the correct number of hours until a date in the future', () => {
        const dstDate = 'March 17, 2024, 04:00'
        const expectedHours = 48
        const date = new Date('March 15, 2024, 04:00')
        vi.setSystemTime(date)
        expect(hoursUntil(dstDate)).toBe(expectedHours)
    })
})
