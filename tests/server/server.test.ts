/* eslint-disable @typescript-eslint/no-unsafe-call */
import { expect, test, describe } from 'vitest'

describe('Hello Server', () => {
    test('Check environment', () => {
        expect(process.env.NODE_ENV).toBe('test')
        expect(process.env.FLAG_TEST_ENV).toBe('true')
    })
})