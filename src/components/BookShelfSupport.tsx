import { Box } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';

interface BookShelfSupportProps {
  position: [number, number, number];
  physicsEnabled?: boolean;
}

export const BookShelfSupport = ({ position, physicsEnabled = true }: BookShelfSupportProps) => {
  const supportWidth = 0.02; // 2cm
  const supportHeight = 0.25; // 25cm (一般的な本の高さより少し高い)
  const supportDepth = 0.15; // 15cm
  
  const renderSupport = () => (
    <Box
      args={[supportWidth, supportHeight, supportDepth]}
      position={position}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#8B4513" metalness={0.1} roughness={0.8} />
    </Box>
  );

  if (physicsEnabled) {
    return (
      <RigidBody type="fixed" position={position}>
        {renderSupport()}
      </RigidBody>
    );
  }

  return renderSupport();
};