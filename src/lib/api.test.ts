import { api, ApiError, setUnauthorizedHandler, tokenStore } from './api';

function mockFetch(status: number, body?: unknown) {
  const fn = vi.fn().mockResolvedValue(
    new Response(body === undefined ? null : JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
  vi.stubGlobal('fetch', fn);
  return fn;
}

describe('api client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('sends the bearer token and JSON body', async () => {
    tokenStore.set('tok');
    const fetch = mockFetch(201, { id: 'p1' });
    await api.projects.create('org1', { name: 'X' });
    const [url, init] = fetch.mock.calls[0];
    expect(url).toBe('/api/organizations/org1/projects');
    expect(init.method).toBe('POST');
    expect(init.headers.Authorization).toBe('Bearer tok');
    expect(JSON.parse(init.body)).toEqual({ name: 'X' });
  });

  it('builds query strings only when filters are set', async () => {
    const fetch = mockFetch(200, []);
    await api.projects.list('o', {});
    await api.projects.list('o', { status: 'archived', search: 'web site' });
    expect(fetch.mock.calls.map((c) => c[0])).toEqual([
      '/api/organizations/o/projects',
      '/api/organizations/o/projects?status=archived&search=web+site',
    ]);
  });

  it('joins validation messages and keeps the error code', async () => {
    mockFetch(400, { message: ['name is too short', 'email must be an email'] });
    await expect(api.auth.login({ email: '', password: '' })).rejects.toThrow(
      'name is too short. email must be an email',
    );
    mockFetch(402, { message: 'Upgrade to add more.', code: 'PLAN_LIMIT' });
    const error = await api.projects.create('o', { name: 'X' }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 402, code: 'PLAN_LIMIT' });
  });

  it('returns undefined for 204 responses', async () => {
    mockFetch(204);
    await expect(api.notifications.markAllRead()).resolves.toBeUndefined();
  });

  it('signs out on 401 only when a token was sent', async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { message: 'Incorrect email or password' });
    await expect(api.auth.login({ email: 'a@b.c', password: 'x' })).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();

    tokenStore.set('expired');
    mockFetch(401, { message: 'Invalid or expired token' });
    await expect(api.auth.me()).rejects.toThrow();
    expect(handler).toHaveBeenCalledOnce();
  });

  it('notifies token subscribers', () => {
    const listener = vi.fn();
    const unsubscribe = tokenStore.subscribe(listener);
    tokenStore.set('a');
    tokenStore.clear();
    unsubscribe();
    tokenStore.set('b');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
