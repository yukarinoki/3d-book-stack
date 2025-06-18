import { RigidBody } from '@react-three/rapier';

interface FloorProps {
  size?: number;
  position?: [number, number, number];
}

export const Floor = ({ size = 20, position = [0, -2, 0] }: FloorProps) => {
  return (
    <RigidBody type="fixed" position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[size, 0.1, size]} />
        <meshStandardMaterial color="#e0e0e0" />
      </mesh>
    </RigidBody>
  );
};