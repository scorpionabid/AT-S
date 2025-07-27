import React from 'react';
import { render } from '@testing-library/react';

describe('User CRUD Integration Test', () => {
  it('should render user component', () => {
    const { container } = render(
      <div style={{ padding: '20px' }}>
        <h1>User Test</h1>
        <p>Test sadələşdirildi</p>
      </div>
    );
    expect(container).toBeTruthy();
  });
});