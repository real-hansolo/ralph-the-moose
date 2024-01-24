import { expect, test } from 'vitest'
import { render, screen } from '@testing-library/react'
import Header from '~/app/_components/header'


test('Hello world', () => {
  render(<Header/>)
  expect(screen.getByText('Header')).toBeDefined()
})
