import { RigidBody } from '@react-three/rapier';
import { Grid } from '@react-three/drei';

interface FloorProps {
  size?: number;
  position?: [number, number, number];
}

export const Floor = ({ size = 20, position = [0, -0.05, 0] }: FloorProps) => {
  return (
    <>
      {/* 物理演算用の透明な床 */}
      <RigidBody type="fixed" position={position}>
        <mesh>
          <boxGeometry args={[size, 0.1, size]} />
          <meshBasicMaterial visible={false} />
        </mesh>
      </RigidBody>
      
      {/* 上面のみ表示される床（不透明） */}
      <mesh 
        receiveShadow 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]}
      >
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial 
          color="#f5f5f5"
          side={0} // THREE.FrontSide - 表面のみ表示
        />
      </mesh>
      
      {/* グリッドで遠近感を演出 */}
      <Grid
        args={[size, size]}
        cellSize={0.167}
        cellThickness={0.5}
        cellColor="#cccccc"
        sectionSize={0.667}
        sectionThickness={1}
        sectionColor="#999999"
        fadeDistance={15}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0.001, 0]} // 床の少し上に配置
      />
    </>
  );
};