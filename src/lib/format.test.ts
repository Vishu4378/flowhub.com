import { formatMoney, initials, timeAgo } from './format';

describe('format', () => {
  it('formats money from cents, hiding .00', () => {
    expect(formatMoney(1900, 'usd')).toBe('$19');
    expect(formatMoney(1950, 'usd')).toBe('$19.50');
  });

  it('takes up to two initials', () => {
    expect(initials('Ada Lovelace King')).toBe('AL');
    expect(initials('  cher ')).toBe('C');
  });

  it('describes past and future times', () => {
    const now = Date.now();
    expect(timeAgo(new Date(now - 3 * 60 * 60 * 1000).toISOString())).toBe('3 hours ago');
    expect(timeAgo(new Date(now + 8 * 24 * 60 * 60 * 1000).toISOString())).toBe('next week');
    expect(timeAgo(new Date(now).toISOString())).toBe('just now');
  });
});
