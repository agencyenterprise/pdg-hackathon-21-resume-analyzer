import { render, screen } from '@testing-library/react'
import React from 'react'
import { App } from '.'

describe('App', () => {
  beforeEach(() => {
    render(<App />)
  })

  it('renders', () => {
    expect(screen.getByText('Hello hackathon2')).toBeTruthy()
  })
})
