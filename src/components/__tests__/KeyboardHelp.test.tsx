import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { KeyboardHelp } from '../KeyboardHelp';

// Mock zustand store
vi.mock('@/stores', () => ({
  useBookStore: () => ({
    physicsEnabled: true,
    viewMode: 'stack',
  }),
}));

describe('KeyboardHelp', () => {
  it('should render keyboard help button', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    expect(helpButton).toBeInTheDocument();
  });

  it('should show help modal when button is clicked', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    fireEvent.click(helpButton);
    
    expect(screen.getByText('キーボード操作')).toBeInTheDocument();
  });

  it('should display all keyboard shortcuts', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    fireEvent.click(helpButton);
    
    // Check keyboard shortcuts
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('S')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('D')).toBeInTheDocument();
    expect(screen.getByText('Space')).toBeInTheDocument();
    expect(screen.getByText('物理演算ON/OFF')).toBeInTheDocument();
  });

  it('should display WASD shortcuts when physics is disabled', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    fireEvent.click(helpButton);
    
    expect(screen.getByText('W')).toBeInTheDocument();
    expect(screen.getByText('前方へ移動')).toBeInTheDocument();
  });

  it('should close modal when clicking help button again', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    fireEvent.click(helpButton);
    
    expect(screen.getByText('キーボード操作')).toBeInTheDocument();
    
    // Click help button again to close
    fireEvent.click(helpButton);
    
    expect(screen.queryByText('キーボード操作')).not.toBeInTheDocument();
  });

  it('should toggle help modal visibility', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    
    // Open modal
    fireEvent.click(helpButton);
    expect(screen.getByText('キーボード操作')).toBeInTheDocument();
    
    // Close modal
    fireEvent.click(helpButton);
    expect(screen.queryByText('キーボード操作')).not.toBeInTheDocument();
    
    // Reopen modal
    fireEvent.click(helpButton);
    expect(screen.getByText('キーボード操作')).toBeInTheDocument();
  });

  it('should display warning message when physics is enabled', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    fireEvent.click(helpButton);
    
    expect(screen.getByText('※ 物理演算がONの時はWASD移動は無効です')).toBeInTheDocument();
  });

  it('should have accessible button', () => {
    render(<KeyboardHelp />);
    
    const helpButton = screen.getByLabelText('キーボード操作ヘルプ');
    expect(helpButton).toHaveAttribute('aria-label', 'キーボード操作ヘルプ');
  });
});