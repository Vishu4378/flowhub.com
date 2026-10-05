import { reportError } from './reportError';

describe('reportError', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('posts each distinct error once, without query strings', () => {
    const fetch = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal('fetch', fetch);
    window.history.pushState({}, '', '/reset-password?token=secret');

    reportError(new TypeError('boom'));
    reportError(new TypeError('boom'));
    reportError(new RangeError('other'));

    expect(fetch).toHaveBeenCalledTimes(2);
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('http://localhost:3000/api/client-errors');
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ message: 'TypeError: boom', url: 'http://localhost:3000/reset-password' });
    expect(init.body).not.toContain('secret');
  });

  it('never throws when fetch fails', () => {
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('offline'); }));
    expect(() => reportError(new Error('unique-offline'))).not.toThrow();
  });
});
