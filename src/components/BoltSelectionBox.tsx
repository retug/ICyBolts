import { useEffect } from "react";
import * as THREE from "three";

import { useThree } from "@react-three/fiber";

import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper.js";

type BoltSelectionBoxProps = {
  selectedBoltIds: string[];
  setSelectedBoltIds: React.Dispatch<React.SetStateAction<string[]>>;
  setHoveredBoltIds: React.Dispatch<React.SetStateAction<string[]>>;
  setIsCtrlSelecting: React.Dispatch<React.SetStateAction<boolean>>;
};

export function BoltSelectionBox({
  setSelectedBoltIds,
  setHoveredBoltIds,
  setIsCtrlSelecting,
}: BoltSelectionBoxProps) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    const selectionBox = new SelectionBox(camera, scene);
    const helper = new SelectionHelper(gl, "selectBox");

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    let isDragging = false;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let hoveredBoltId: string | null = null;

    function setMouse(event: PointerEvent) {
      const rect = gl.domElement.getBoundingClientRect();

      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    }

    function setSelectionPoint(
      event: PointerEvent,
      target: { x: number; y: number; z: number }
    ) {
      setMouse(event);

      target.x = mouse.x;
      target.y = mouse.y;
      target.z = 0.5;
    }

    function getHoveredBolt(event: PointerEvent): string | null {
      setMouse(event);

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(scene.children, true);

      const hit = intersects.find(
        (i) => i.object.userData.selectableBolt === true
      );

      return hit?.object.userData.boltId ?? null;
    }

    function getSelectionPreviewIds(): string[] {
      const previewObjects = selectionBox.select();

      const previewIds = previewObjects
        .map((obj) => obj.userData.boltId)
        .filter((id): id is string => typeof id === "string");

      return Array.from(new Set(previewIds));
    }

    function onPointerMove(event: PointerEvent) {
      if (isDragging) {
        setSelectionPoint(event, selectionBox.endPoint);
        setHoveredBoltIds(getSelectionPreviewIds());
        return;
      }

      hoveredBoltId = getHoveredBolt(event);
      setHoveredBoltIds(hoveredBoltId ? [hoveredBoltId] : []);
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;
      if (target.closest("button, input, select, textarea")) return;

      isDragging = true;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;

      setIsCtrlSelecting(event.ctrlKey);

      setSelectionPoint(event, selectionBox.startPoint);
      setSelectionPoint(event, selectionBox.endPoint);
    }

    function onPointerUp(event: PointerEvent) {
      if (!isDragging || event.button !== 0) return;

      isDragging = false;
      setIsCtrlSelecting(false);

      const dx = Math.abs(event.clientX - pointerDownX);
      const dy = Math.abs(event.clientY - pointerDownY);
      const isClick = dx < 4 && dy < 4;

      if (isClick && hoveredBoltId) {
        setSelectedBoltIds((prev) => {
          if (event.ctrlKey) {
            return prev.includes(hoveredBoltId!)
              ? prev.filter((id) => id !== hoveredBoltId)
              : [...prev, hoveredBoltId!];
          }

          return [hoveredBoltId!];
        });

        setHoveredBoltIds([hoveredBoltId]);
        return;
      }

      setSelectionPoint(event, selectionBox.endPoint);

      const uniqueIds = getSelectionPreviewIds();

      setSelectedBoltIds((prev) =>
        event.ctrlKey ? Array.from(new Set([...prev, ...uniqueIds])) : uniqueIds
      );

      setHoveredBoltIds([]);
    }

    function onPointerLeave() {
      if (!isDragging) {
        hoveredBoltId = null;
        setHoveredBoltIds([]);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Control") {
        setIsCtrlSelecting(true);
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.key === "Control") {
        setIsCtrlSelecting(false);
      }
    }

    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerdown", onPointerDown);
    gl.domElement.addEventListener("pointerup", onPointerUp);
    gl.domElement.addEventListener("pointerleave", onPointerLeave);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.removeEventListener("pointerup", onPointerUp);
      gl.domElement.removeEventListener("pointerleave", onPointerLeave);

      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      helper.dispose();
    };
  }, [camera, scene, gl, setSelectedBoltIds, setHoveredBoltIds, setIsCtrlSelecting]);

  return null;
}