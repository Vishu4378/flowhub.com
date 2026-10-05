import { safeNext } from './guards';

vi.mock('next/navigation', () => ({ useRouter: vi.fn(), usePathname: vi.fn() }));

describe('safeNext', () => {
  it('allows dashboard and invite paths', () => {
    expect(safeNext('/app/projects?org=1')).toBe('/app/projects?org=1');
    expect(safeNext('/invite?token=abc')).toBe('/invite?token=abc');
  });

  it('falls back to /app for anything else', () => {
    expect(safeNext(null)).toBe('/app');
    expect(safeNext('https://evil.test')).toBe('/app');
    expect(safeNext('//evil.test/app')).toBe('/app');
    expect(safeNext('/pricing')).toBe('/app');
  });
});
