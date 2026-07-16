import { describe, expect, it } from 'vitest'
import { classifyNotice } from './sms'

describe('rules-first notice classifier', () => {
  it('accepts numbered menu choices', () => expect(classifyNotice('5')).toBe('warrant'))
  it('matches exact legal phrases case-insensitively', () => expect(classifyNotice('COMPLAINT FOR POSSESSION')).toBe('complaint'))
  it('recognizes a summons description', () => expect(classifyNotice('I have a court summons with a date')).toBe('summons'))
  it('does not guess from ambiguous language', () => expect(classifyNotice('landlord sent me a paper')).toBeNull())
  it('does not classify unrelated emergency language as a notice', () => expect(classifyNotice('I am unsafe now')).toBeNull())
  it('handles malformed punctuation safely', () => expect(classifyNotice('*** warrant---of removal!!!')).toBe('warrant'))
})
