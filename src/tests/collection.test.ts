import { describe, it, expect } from 'vitest'
import { dedupe, missing } from '../domain/collection.js'

describe('dedupe', () => {
  it('removes duplicates', () => {
    expect(dedupe(['BRA1', 'BRA1', 'ARG1'])).toEqual(['ARG1', 'BRA1'])
  })
  it('sorts the result', () => {
    expect(dedupe(['FWC3', 'ARG1', 'BRA1'])).toEqual(['ARG1', 'BRA1', 'FWC3'])
  })
  it('returns empty for empty input', () => {
    expect(dedupe([])).toEqual([])
  })
  it('handles single element', () => {
    expect(dedupe(['BRA1'])).toEqual(['BRA1'])
  })
})

describe('missing', () => {
  it('returns codes in theirs but not mine', () => {
    expect(missing(['BRA1', 'ARG1'], ['BRA1', 'ARG1', 'FWC3'])).toEqual(['FWC3'])
  })
  it('returns all theirs when mine is empty', () => {
    expect(missing([], ['BRA1', 'ARG1'])).toEqual(['ARG1', 'BRA1'])
  })
  it('returns empty when full overlap', () => {
    expect(missing(['BRA1', 'ARG1'], ['BRA1', 'ARG1'])).toEqual([])
  })
  it('returns empty when both empty', () => {
    expect(missing([], [])).toEqual([])
  })
  it('returns empty when theirs is empty', () => {
    expect(missing(['BRA1'], [])).toEqual([])
  })
  it('dedupes and sorts the result', () => {
    expect(missing(['BRA1'], ['FWC3', 'ARG1', 'FWC3'])).toEqual(['ARG1', 'FWC3'])
  })
  it('handles partial overlap correctly', () => {
    const mine = ['BRA1', 'BRA2', 'ARG1']
    const theirs = ['BRA1', 'BRA3', 'ARG1', 'ARG2']
    expect(missing(mine, theirs)).toEqual(['ARG2', 'BRA3'])
  })
})
