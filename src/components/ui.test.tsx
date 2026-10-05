import { render, screen } from '@testing-library/react';
import { ApiError } from '@/lib/api';
import { OrgContext } from '@/lib/useOrg';
import type { Organization } from '@/lib/types';
import { ErrorNotice } from './ui';

const org = { id: 'org1', name: 'Acme', slug: 'acme', role: 'owner', createdAt: '' } satisfies Organization;

describe('ErrorNotice', () => {
  it('renders nothing without an error', () => {
    const { container } = render(<ErrorNotice error={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('links to billing for plan-limit errors inside an org', () => {
    render(
      <OrgContext value={org}>
        <ErrorNotice error={new ApiError(402, 'The Free plan allows up to 3 projects.', 'PLAN_LIMIT')} />
      </OrgContext>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('The Free plan allows up to 3 projects.');
    expect(screen.getByRole('link', { name: 'See plans' })).toHaveAttribute('href', '/app/orgs/org1/billing');
  });
});
