import * as THREE from "three";

import type { BoltData } from "../types/bolts";

type BoltProps = {
  bolt: BoltData;
  showForceVector?: boolean;
};

export function Bolt({
  bolt,
  showForceVector = true,
}: BoltProps) {
  const {
    id,
    x,
    y,
    z = 0,
    renderSize,
    isSelected,
    isHovered,
    force,
  } = bolt;

  const shaftRadius =
    renderSize.diameter / 2;

  const headRadius =
    renderSize.headAcrossFlats / 2;

  const headHeight =
    renderSize.headHeight;

  const shaftLength =
    renderSize.shaftLength;

  // COLOR STATES
  const boltColor = isSelected
    ? "#f97316"
    : isHovered
    ? "#38bdf8"
    : "#2563eb";

  const headColor = isSelected
    ? "#fb923c"
    : isHovered
    ? "#7dd3fc"
    : "#1d4ed8";

  return (
    <group position={[x, y, z]}>
      {/* SHAFT */}
      <mesh
        userData={{
          boltId: id,
          selectableBolt: true,
        }}
        position={[
          0,
          0,
          -shaftLength / 2,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            shaftRadius,
            shaftRadius,
            shaftLength,
            32,
          ]}
        />

        <meshStandardMaterial
          color={boltColor}
          metalness={0.35}
          roughness={0.45}
        />
      </mesh>

      {/* HEX HEAD */}
      <mesh
        userData={{
          boltId: id,
          selectableBolt: true,
        }}
        position={[
          0,
          0,
          headHeight / 2,
        ]}
        rotation={[
          Math.PI / 2,
          0,
          0,
        ]}
      >
        <cylinderGeometry
          args={[
            headRadius,
            headRadius,
            headHeight,
            6,
          ]}
        />

        <meshStandardMaterial
          color={headColor}
          metalness={0.45}
          roughness={0.35}
        />
      </mesh>

      {/* FORCE VECTOR */}
      {showForceVector &&
        force && (
          <ForceVector
            force={force}
            diameter={
              renderSize.diameter
            }
          />
        )}
    </group>
  );
}

type ForceVectorProps = {
  force: {
    fx: number;
    fy: number;
    fz?: number;
  };

  diameter: number;
};

function ForceVector({
  force,
  diameter,
}: ForceVectorProps) {
  const vector =
    new THREE.Vector3(
      force.fx,
      force.fy,
      force.fz ?? 0
    );

  if (vector.length() < 1e-9) {
    return null;
  }

  const direction =
    vector.clone().normalize();

  // Visual scaling only
  const length = Math.max(
    diameter * 2,
    vector.length() * 0.05
  );

  return (
    <arrowHelper
      args={[
        direction,
        new THREE.Vector3(
          0,
          0,
          diameter * 1.5
        ),
        length,
        0xff3333,
        length * 0.25,
        length * 0.12,
      ]}
    />
  );
}