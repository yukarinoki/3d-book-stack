import { Html } from '@react-three/drei';

interface TimelineLabelProps {
  label: string;
  position: [number, number, number];
}

export const TimelineLabel = ({ label, position }: TimelineLabelProps) => {
  return (
    <Html
      position={[position[0], -0.2, position[2]]}
      center
      style={{
        whiteSpace: 'nowrap',
        userSelect: 'none',
        pointerEvents: 'none',
      }}
    >
      <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-md text-sm font-medium">
        {label}
      </div>
    </Html>
  );
};