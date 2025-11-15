import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { render } from '../test/utils';
import { EmptyState } from './EmptyState';
import { Inbox } from '@mui/icons-material';

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(
      <EmptyState
        title="No results found"
        description="Try adjusting your filters or search terms"
      />
    );

    expect(screen.getByText('No results found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your filters or search terms')).toBeInTheDocument();
  });

  it('should render action button when provided', () => {
    render(
      <EmptyState
        title="No listings yet"
        description="Create your first listing"
        actionLabel="Create Listing"
        actionPath="/listings/new"
      />
    );

    const button = screen.getByRole('link', { name: /create listing/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', '/listings/new');
  });

  it('should not render action button when not provided', () => {
    render(
      <EmptyState
        title="No results"
        description="No items to display"
      />
    );

    const button = screen.queryByRole('link');
    expect(button).not.toBeInTheDocument();
  });

  it('should render custom icon when provided', () => {
    render(
      <EmptyState
        title="Empty inbox"
        description="No messages"
        icon={<Inbox data-testid="custom-icon" />}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should render default search icon when no icon provided', () => {
    const { container } = render(
      <EmptyState
        title="No results"
        description="Try again"
      />
    );

    // MUI's Search icon is rendered
    const searchIcon = container.querySelector('[data-testid="SearchIcon"]');
    expect(searchIcon).toBeInTheDocument();
  });
});
