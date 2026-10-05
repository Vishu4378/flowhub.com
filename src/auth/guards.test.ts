import { safeNext } from './guards';

vi.mock('next/navigation', () => ({ useRouter: vi.fn(), usePathname: vi.fn() }));

describe('safeNext', () => {
  it('allows dashboard and invite paths', () => {
    expect(safeNext('/app/orgs/1/projects')).toBe('/app/orgs/1/projects');
    expect(safeNext('/invite/abc')).toBe('/invite/abc');
  });

  it('falls back to /app for anything else', () => {
    expect(safeNext(null)).toBe('/app');
    expect(safeNext('https://evil.test')).toBe('/app');
    expect(safeNext('//evil.test/app')).toBe('/app');
    expect(safeNext('/pricing')).toBe('/app');
  });
});
