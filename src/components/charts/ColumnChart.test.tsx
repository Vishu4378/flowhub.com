import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnChart } from './ColumnChart';

const data = [
  { key: 'a', label: 'Sep 1', title: 'Week of Sep 1', value: 2 },
  { key: 'b', label: 'Sep 8', title: 'Week of Sep 8', value: 7 },
  { key: 'c', label: 'Sep 15', title: 'Week of Sep 15', value: 3 },
];

describe('ColumnChart', () => {
  it('labels only the peak and the latest column', () => {
    const { container } = render(<ColumnChart data={data} valueLabel="Projects" />);
    const valueLabels = [...container.querySelectorAll('text.font-medium')].map((t) => t.textContent);
    expect(valueLabels.sort()).toEqual(['3', '7']);
  });

  it('shows a tooltip on hover', () => {
    render(<ColumnChart data={data} valueLabel="Projects" />);
    fireEvent.mouseEnter(screen.getByLabelText('Week of Sep 8: 7 projects'));
    expect(screen.getByText('Week of Sep 8')).toBeInTheDocument();
    expect(screen.getByText('7 projects')).toBeInTheDocument();
  });

  it('switches to an accessible table', async () => {
    render(<ColumnChart data={data} valueLabel="Projects" />);
    await userEvent.click(screen.getByRole('button', { name: 'View as table' }));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });
});
