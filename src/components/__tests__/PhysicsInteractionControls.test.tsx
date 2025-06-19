import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PhysicsInteractionControls } from '../PhysicsInteractionControls';
import { usePhysicsInteraction } from '@/hooks/usePhysicsInteraction';

// Mock the physics interaction hook
vi.mock('@/hooks/usePhysicsInteraction');

describe('PhysicsInteractionControls', () => {
  const mockSetInteractionMode = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'push',
      setInteractionMode: mockSetInteractionMode,
      isGrabbing: false,
      grabbedBookId: null,
    });
  });

  it('should render all interaction mode buttons', () => {
    render(<PhysicsInteractionControls />);
    
    expect(screen.getByText('プッシュ')).toBeInTheDocument();
    expect(screen.getByText('つかむ')).toBeInTheDocument();
    expect(screen.getByText('フリック')).toBeInTheDocument();
  });

  it('should highlight active mode', () => {
    render(<PhysicsInteractionControls />);
    
    const pushButton = screen.getByText('プッシュ');
    expect(pushButton).toHaveClass('bg-blue-500');
  });

  it('should switch to grab mode when clicked', () => {
    render(<PhysicsInteractionControls />);
    
    const grabButton = screen.getByText('つかむ');
    fireEvent.click(grabButton);
    
    expect(mockSetInteractionMode).toHaveBeenCalledWith('grab');
  });

  it('should switch to flick mode when clicked', () => {
    render(<PhysicsInteractionControls />);
    
    const flickButton = screen.getByText('フリック');
    fireEvent.click(flickButton);
    
    expect(mockSetInteractionMode).toHaveBeenCalledWith('flick');
  });

  it('should display grabbed book info when grabbing', () => {
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'grab',
      setInteractionMode: mockSetInteractionMode,
      isGrabbing: true,
      grabbedBookId: 'book-123',
    });
    
    render(<PhysicsInteractionControls />);
    
    expect(screen.getByText('本をつかんでいます: book-123')).toBeInTheDocument();
  });

  it('should display mode descriptions', () => {
    render(<PhysicsInteractionControls />);
    
    expect(screen.getByText('クリックして本を押す')).toBeInTheDocument();
  });

  it('should update description when mode changes', () => {
    const { rerender } = render(<PhysicsInteractionControls />);
    
    expect(screen.getByText('クリックして本を押す')).toBeInTheDocument();
    
    // Change to grab mode
    (usePhysicsInteraction as any).mockReturnValue({
      interactionMode: 'grab',
      setInteractionMode: mockSetInteractionMode,
      isGrabbing: false,
      grabbedBookId: null,
    });
    
    rerender(<PhysicsInteractionControls />);
    
    expect(screen.getByText('ドラッグして本を移動')).toBeInTheDocument();
  });

  it('should be disabled when physics is disabled', () => {
    render(<PhysicsInteractionControls physicsEnabled={false} />);
    
    const pushButton = screen.getByText('プッシュ');
    const grabButton = screen.getByText('つかむ');
    const flickButton = screen.getByText('フリック');
    
    expect(pushButton).toBeDisabled();
    expect(grabButton).toBeDisabled();
    expect(flickButton).toBeDisabled();
  });

  it('should show physics disabled message', () => {
    render(<PhysicsInteractionControls physicsEnabled={false} />);
    
    expect(screen.getByText('物理エンジンが無効です')).toBeInTheDocument();
  });
});