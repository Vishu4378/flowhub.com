import { routes } from './routes';

describe('routes', () => {
  it('puts ids in the query string', () => {
    expect(routes.org('o1', 'billing')).toBe('/app/billing?org=o1');
    expect(routes.org('o1', 'billing', { checkout: 'success' })).toBe('/app/billing?org=o1&checkout=success');
    expect(routes.project('o1', 'p1')).toBe('/app/project?org=o1&id=p1');
    expect(routes.invite('a/b+c')).toBe('/invite?token=a%2Fb%2Bc');
    expect(routes.adminOrg('x')).toBe('/app/admin/organization?id=x');
  });
});
