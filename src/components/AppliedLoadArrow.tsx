import * as THREE from "three";
import { Text } from "@react-three/drei";

import type { AppliedLoad } from "../types/bolts";

type AppliedLoadArrowProps = {
  load: AppliedLoad;
  showLabel?: boolean;
};

const LOAD_BLUE = "#38bdf8";
const LOAD_HOVER = "#7dd3fc";
const LOAD_SELECTED = "#f97316";

export function AppliedLoadArrow({
  load,
  showLabel = true,
}: AppliedLoadArrowProps) {
  const angleRad = (load.angleDeg * Math.PI) / 180;

  const fx =
    load.inputMode === "components"
      ? load.fx
      : load.magnitude * Math.cos(angleRad);

  const fy =
    load.inputMode === "components"
      ? load.fy
      : load.magnitude * Math.sin(angleRad);

  const forceMagnitude = Math.sqrt(fx ** 2 + fy ** 2);

  const direction =
    forceMagnitude > 1e-9
      ? new THREE.Vector3(fx, fy, 0).normalize()
      : new THREE.Vector3(1, 0, 0);

  const color = load.isSelected
    ? LOAD_SELECTED
    : load.isHovered
      ? LOAD_HOVER
      : LOAD_BLUE;

  const length = Math.max(1.5, forceMagnitude * 0.15);

  return (
    <group
      position={[load.x, load.y, 1.4]}
      userData={{
        selectableLoad: true,
        loadId: load.id,
      }}
    >
      {forceMagnitude > 1e-9 && (
        <arrowHelper
          args={[
            direction,
            new THREE.Vector3(0, 0, 0),
            length,
            new THREE.Color(color),
            length * 0.25,
            length * 0.12,
          ]}
        />
      )}

      <mesh
        userData={{
          selectableLoad: true,
          loadId: load.id,
        }}
        position={[
          direction.x * length * 0.5,
          direction.y * length * 0.5,
          0,
        ]}
      >
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      <mesh
        userData={{
          selectableLoad: true,
          loadId: load.id,
        }}
      >
        <sphereGeometry args={[0.14, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
        />
      </mesh>

      {Math.abs(load.moment ?? 0) > 1e-9 && (
        <MomentArrow load={load} color={color} />
      )}

      {showLabel && (
        <Text
          position={[0.45, 0.45, 0]}
          fontSize={0.24}
          color={color}
          anchorX="left"
          anchorY="middle"
        >
          {`F=${forceMagnitude.toFixed(2)}${
            Math.abs(load.moment ?? 0) > 1e-9
              ? `, M=${load.moment.toFixed(2)}`
              : ""
          }`}
        </Text>
      )}
    </group>
  );
}

function MomentArrow({
  load,
  color,
}: {
  load: AppliedLoad;
  color: string;
}) {
  const radius = 0.85;
  const positive = load.moment > 0;

  const startAngle = positive ? 0.15 : Math.PI * 1.85;
  const endAngle = positive ? Math.PI * 1.65 : Math.PI * 0.35;

  const curve = new THREE.EllipseCurve(
    0,
    0,
    radius,
    radius,
    startAngle,
    endAngle,
    !positive,
    0
  );

  const points = curve.getPoints(48);

  const geometry = new THREE.BufferGeometry().setFromPoints(
    points.map((p) => new THREE.Vector3(p.x, p.y, 0))
  );

  const endPoint = points[points.length - 1];
  const tangentPoint = points[points.length - 2];

  const tangent = new THREE.Vector3(
    endPoint.x - tangentPoint.x,
    endPoint.y - tangentPoint.y,
    0
  ).normalize();

  return (
    <group
      userData={{
        selectableLoad: true,
        loadId: load.id,
      }}
    >
      <line geometry={geometry}>
        <lineBasicMaterial color={color} linewidth={2} />
      </line>

      <arrowHelper
        args={[
          tangent,
          new THREE.Vector3(endPoint.x, endPoint.y, 0),
          0.35,
          new THREE.Color(color),
          0.18,
          0.1,
        ]}
      />

      <mesh
        userData={{
          selectableLoad: true,
          loadId: load.id,
        }}
      >
        <torusGeometry args={[radius, 0.12, 8, 32]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
}