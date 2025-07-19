import { useEffect } from "react";

const SketchCanvas = ({
  penColor,
  canvasRef,
  isDrawing,
  setIsDrawing,
  ctx,
  setCtx,
  expandCanvasIfNeeded,
  saveSnapshot,
  task,
}) => {
  useEffect(() => {
    const canvasEl = canvasRef.current;
    canvasEl.width = task.width || 400;
    canvasEl.height = task.height || 200;
    canvasEl.style.width = `${canvasEl.width}px`;
    canvasEl.style.height = `${canvasEl.height}px`;
    const context = canvasEl.getContext("2d");
    context.lineWidth = 2;
    context.strokeStyle = penColor;
    context.lineCap = "round";
    setCtx(context);

    if (task.sketch) {
      const img = new Image();
      img.src = task.sketch;
      img.onload = () => context.drawImage(img, 0, 0);
    }
  }, [penColor, task.height, task.sketch, task.width, canvasRef, setCtx]);

  useEffect(() => {
    if (ctx) ctx.strokeStyle = penColor;
  }, [penColor, ctx]);

  const getCoords = (e, rect) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!ctx) return;
    saveSnapshot();
    canvasRef.current.parentElement.classList.add("drawing");
    const rect = e.target.getBoundingClientRect();
    const { x, y } = getCoords(e, rect);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || !ctx) return;
    const rect = e.target.getBoundingClientRect();
    const { x, y } = getCoords(e, rect);
    expandCanvasIfNeeded(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    canvasRef.current.parentElement.classList.remove("drawing");
    ctx.closePath();
    setIsDrawing(false);
  };

  return (
    <canvas
      ref={canvasRef}
      className="task-sketch"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
      onTouchCancel={stopDrawing}
    />
  );
};

export default SketchCanvas;
