import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { weeksFrom } from '../weeks-from'

describe('weeksFrom', () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('should return the correct number of weeks from a date in the past', () => {
        const date = '2000-01-01'
        vi.setSystemTime(new Date('2001-03-15'))
        const weeks = weeksFrom(date)
        expect(weeks).toBe(62)
    })

    it('should return 0 for the current date', () => {
        const currentDate = new Date().toISOString().split('T')[0]
        const weeks = weeksFrom(currentDate)
        expect(weeks).toBe(0)
    })

    it('should return 0 for a date in the future', () => {
        const futureDate = '3000-01-01'
        const weeks = weeksFrom(futureDate)
        expect(weeks).toBe(0)
    })
})
