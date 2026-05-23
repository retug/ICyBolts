import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper.js";

type BoltSelectionBoxProps = {
  setSelectedBoltIds: React.Dispatch<React.SetStateAction<string[]>>;
};

export function BoltSelectionBox({ setSelectedBoltIds }: BoltSelectionBoxProps) {
  const { camera, scene, gl } = useThree();

  useEffect(() => {
    const selectionBox = new SelectionBox(camera, scene);
    const helper = new SelectionHelper(gl, "selectBox");

    let isDragging = false;

    function setPoint(event: PointerEvent, target: typeof selectionBox.startPoint) {
      const rect = gl.domElement.getBoundingClientRect();

      target.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      target.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      target.z = 0.5;
    }

    function onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return;

      const target = event.target as HTMLElement;
      if (target.closest("button, input, select, textarea")) return;

      isDragging = true;

      if (!event.ctrlKey) {
        setSelectedBoltIds([]);
      }

      setPoint(event, selectionBox.startPoint);
    }

    function onPointerMove(event: PointerEvent) {
      if (!isDragging) return;
      setPoint(event, selectionBox.endPoint);
    }

    function onPointerUp(event: PointerEvent) {
      if (!isDragging || event.button !== 0) return;

      isDragging = false;

      setPoint(event, selectionBox.endPoint);

      const selected = selectionBox.select();

      const ids = selected
        .map((obj) => obj.userData.boltId)
        .filter((id): id is string => typeof id === "string");

      const uniqueIds = Array.from(new Set(ids));

      setSelectedBoltIds((prev) =>
        event.ctrlKey ? Array.from(new Set([...prev, ...uniqueIds])) : uniqueIds
      );
    }

    gl.domElement.addEventListener("pointerdown", onPointerDown);
    gl.domElement.addEventListener("pointermove", onPointerMove);
    gl.domElement.addEventListener("pointerup", onPointerUp);

    return () => {
      gl.domElement.removeEventListener("pointerdown", onPointerDown);
      gl.domElement.removeEventListener("pointermove", onPointerMove);
      gl.domElement.removeEventListener("pointerup", onPointerUp);
      helper.dispose();
    };
  }, [camera, scene, gl, setSelectedBoltIds]);

  return null;
}