import * as THREE from "three";
import type { AppliedLoad } from "../types/bolts";

type AppliedLoadArrowProps = {
  load: AppliedLoad;
};

const LOAD_BLUE = "#38bdf8";
const LOAD_HOVER = "#7dd3fc";
const LOAD_SELECTED = "#f97316";

export function AppliedLoadArrow({ load }: AppliedLoadArrowProps) {
  const angleRad = (load.angleDeg * Math.PI) / 180;

  const direction = new THREE.Vector3(
    Math.cos(angleRad),
    Math.sin(angleRad),
    0
  ).normalize();

  const color = load.isSelected
    ? LOAD_SELECTED
    : load.isHovered
    ? LOAD_HOVER
    : LOAD_BLUE;

  const length = Math.max(1.5, Math.abs(load.magnitude) * 0.15);

  return (
    <group
      position={[load.x, load.y, 1.4]}
      userData={{
        selectableLoad: true,
        loadId: load.id,
      }}
    >
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

      {/* Invisible selection target */}
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

      {/* Visible load point */}
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

  const curve = new THREE.EllipseCurve(
    0,
    0,
    radius,
    radius,
    positive ? 0.2 : Math.PI + 0.2,
    positive ? Math.PI * 1.65 : Math.PI * 2.65,
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