import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '~/app/_components/header'


// eslint-disable-next-line @typescript-eslint/no-unsafe-call
test('Hello world', () => {
  render(<Header/>)
  expect(screen.getByText('Header')).toBeDefined()
})

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
test('Check environment', () => {
    expect(process.env.NODE_ENV).toBe('test')
    expect(process.env.FLAG_TEST_ENV).toBe('true')
})