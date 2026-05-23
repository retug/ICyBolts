import * as THREE from "three";
import type { AppliedLoad } from "../types/bolts";

type AppliedLoadArrowProps = {
  load: AppliedLoad;
};

export function AppliedLoadArrow({ load }: AppliedLoadArrowProps) {
  const angleRad = (load.angleDeg * Math.PI) / 180;

  const direction = new THREE.Vector3(
    Math.cos(angleRad),
    Math.sin(angleRad),
    0
  ).normalize();

  const length = Math.max(1, load.magnitude * 0.15);

  return (
    <group position={[load.x, load.y, 1]}>
      <arrowHelper
        args={[
          direction,
          new THREE.Vector3(0, 0, 0),
          length,
          0xff0000,
          length * 0.25,
          length * 0.12,
        ]}
      />
    </group>
  );
}