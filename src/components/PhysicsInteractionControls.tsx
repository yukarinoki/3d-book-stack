import { usePhysicsInteraction } from '@/hooks/usePhysicsInteraction';
import type { InteractionMode } from '@/hooks/usePhysicsInteraction';

interface PhysicsInteractionControlsProps {
  physicsEnabled?: boolean;
}

export const PhysicsInteractionControls = ({ physicsEnabled = true }: PhysicsInteractionControlsProps) => {
  const { interactionMode, setInteractionMode, isGrabbing, grabbedBookId } = usePhysicsInteraction();

  const modes: { mode: InteractionMode; label: string; description: string }[] = [
    { mode: 'push', label: 'プッシュ', description: 'クリックして本を押す' },
    { mode: 'grab', label: 'つかむ', description: 'ドラッグして本を移動' },
    { mode: 'flick', label: 'フリック', description: 'スワイプして本を弾く' },
  ];

  const getModeDescription = () => {
    const currentMode = modes.find(m => m.mode === interactionMode);
    return currentMode?.description || '';
  };

  return (
    <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
      <h3 className="text-sm font-bold mb-2">物理操作モード</h3>
      
      {!physicsEnabled && (
        <p className="text-xs text-red-500 mb-2">物理エンジンが無効です</p>
      )}
      
      <div className="flex gap-2 mb-2">
        {modes.map(({ mode, label }) => (
          <button
            key={mode}
            onClick={() => setInteractionMode(mode)}
            disabled={!physicsEnabled}
            className={`
              px-3 py-1 rounded text-xs font-medium transition-colors
              ${interactionMode === mode
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
              ${!physicsEnabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {label}
          </button>
        ))}
      </div>
      
      <p className="text-xs text-gray-600">
        {getModeDescription()}
      </p>
      
      {isGrabbing && grabbedBookId && (
        <p className="text-xs text-green-600 mt-1">
          本をつかんでいます: {grabbedBookId}
        </p>
      )}
    </div>
  );
};