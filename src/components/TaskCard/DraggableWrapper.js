import { useRef, useEffect, useState, useCallback } from "react";

const DraggableWrapper = ({
  children,
  x,
  y,
  onDragEnd,
  canvasBoardRef,
  className,
  style = {},
}) => {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [localPos, setLocalPos] = useState({ x, y });
  const [scale, setScale] = useState(1);
  const initialDistance = useRef(null);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    setIsDragging(true);
    const rect = ref.current.getBoundingClientRect();
    setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      initialDistance.current = Math.sqrt(dx * dx + dy * dy);
    } else {
      const touch = e.touches[0];
      const rect = ref.current.getBoundingClientRect();
      setIsDragging(true);
      setOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
  };

  const moveTo = (x, y) => {
    setLocalPos({ x, y });
  };

  const handleMove = useCallback(
    (x, y) => {
      if (!canvasBoardRef?.current) return;
      const canvasRect = canvasBoardRef.current.getBoundingClientRect();
      const newX = x - canvasRect.left - offset.x;
      const newY = y - canvasRect.top - offset.y;
      moveTo(newX, newY);
    },
    [canvasBoardRef, offset]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return;
      handleMove(e.clientX, e.clientY);
    },
    [isDragging, handleMove]
  );

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && initialDistance.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleFactor = newDistance / initialDistance.current;
      setScale(Math.min(Math.max(scaleFactor, 0.7), 2)); // limit scale
    } else if (isDragging && e.touches.length === 1) {
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const endDrag = useCallback(() => {
    if (isDragging) {
      onDragEnd(localPos.x, localPos.y);
      setIsDragging(false);
    }
  }, [isDragging, localPos, onDragEnd]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", endDrag);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", endDrag);
    };
  }, [isDragging, handleMouseMove, endDrag]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        left: localPos.x,
        top: localPos.y,
        cursor: isDragging ? "grabbing" : "grab",
        position: "absolute",
        transform: `scale(${scale})`,
        transition: isDragging ? "none" : "transform 0.2s ease",
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={endDrag}
    >
      {children}
    </div>
  );
};

export default DraggableWrapper;
