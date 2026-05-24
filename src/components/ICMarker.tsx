import { Text } from "@react-three/drei";

type ICMarkerProps = {
  x: number;
  y: number;
  showLabel?: boolean;
};

export function ICMarker({ x, y, showLabel = true }: ICMarkerProps) {
  return (
    <group position={[x, y, 2]}>
      <mesh>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.45}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color="#c084fc" />
      </mesh>

      {showLabel && (
        <Text
          position={[0.55, 0.35, 0]}
          fontSize={0.28}
          color="#c084fc"
          anchorX="left"
          anchorY="middle"
        >
          {`IC (${x.toFixed(2)}, ${y.toFixed(2)})`}
        </Text>
      )}
    </group>
  );
}