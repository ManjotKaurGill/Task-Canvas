import { useRef, useEffect, useState, useContext } from "react";
import "../../styles/TaskCard.css";
import { addTaskToFirebase, updateTaskInFirebase } from "../../firebase/firebaseTasks";
import { BiUndo, BiRedo } from "react-icons/bi";
import { TaskContext } from "../../context/TaskContext";
import { auth } from "../../firebase/firebaseConfig";
import SketchCanvas from "./SketchCanvas";
import DraggableWrapper from "./DraggableWrapper";

const TaskCard = ({
  task,
  onDrag,
  onTextChange,
  onDateChange,
  onCategoryChange,
  canvasBoardRef,
  onDelete,
  onTaskSaved,
}) => {
  const { handleCompletion } = useContext(TaskContext);
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const [penColor, setPenColor] = useState("#000000");
  const [ctx, setCtx] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const categoryOptions = ["📝", "🧠", "🏡", "🎂", "📚", "🎯", "🛒"];
  const categoryColors = {
    "🏡": "#cce036ff",
    "📝": "#96f996ff",
    "🎂": "#efd042ff",
    "🧠": "#FFD6D6",
    "📚": "#95fbd2ff",
    "🎯": "#f9b77eff",
    "🛒": "#c386fcff",
  };

  useEffect(() => {
    const canvasEl = cardRef.current.querySelector("canvas");
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
  }, [penColor, task.height, task.sketch, task.width]);

  useEffect(() => {
    if (ctx) ctx.strokeStyle = penColor;
  }, [penColor, ctx]);

  const expandCanvasIfNeeded = (x, y) => {
    const canvasEl = cardRef.current.querySelector("canvas");
    if (x > canvasEl.width - 20 || y > canvasEl.height - 20) {
      const oldImage = canvasEl.toDataURL();
      canvasEl.width += (x > canvasEl.width - 20) ? 200 : 0;
      canvasEl.height += (y > canvasEl.height - 20) ? 100 : 0;
      const img = new Image();
      img.src = oldImage;
      img.onload = () => ctx.drawImage(img, 0, 0);
    }

    if (canvasBoardRef?.current) {
      const taskCardBottom = task.y + canvasEl.height + 200;
      const currentHeight = canvasBoardRef.current.clientHeight;
      if (currentHeight < taskCardBottom) {
        canvasBoardRef.current.style.height = `${taskCardBottom}px`;
      }
    }
  };  

  const saveSnapshot = () => {
    const canvasEl = cardRef.current.querySelector("canvas");
    setHistory((prev) => [...prev, canvasEl.toDataURL()]);
    setRedoStack([]);
  };

  const undo = () => {
    const canvasEl = cardRef.current.querySelector("canvas");
    if (!history.length) return;
    const newHistory = [...history];
    const last = newHistory.pop();
    setRedoStack((prev) => [...prev, canvasEl.toDataURL()]);
    setHistory(newHistory);
    const img = new Image();
    img.src = last;
    img.onload = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    const canvasEl = cardRef.current.querySelector("canvas");
    if (!redoStack.length) return;
    const newRedo = [...redoStack];
    const next = newRedo.pop();
    setHistory((prev) => [...prev, canvasEl.toDataURL()]);
    setRedoStack(newRedo);
    const img = new Image();
    img.src = next;
    img.onload = () => {
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const saveCanvas = async () => {
    if (!ctx) return;
    const canvasEl = cardRef.current.querySelector("canvas");
    const imageData = canvasEl.toDataURL();

    if (!task.saved) {
      const savedTask = await addTaskToFirebase({
        userId: auth.currentUser.uid,
        text: task.text,
        category: task.category,
        dueDate: task.dueDate,
        sketch: imageData,
        x: task.x,
        y: task.y,
        width: canvasEl.width,
        height: canvasEl.height,
        isComplete: task.isComplete,
        teamId: task.teamId || null,
        saved: true,
      });
      onTaskSaved(task.id, { ...savedTask, saved: true });
    } else {
      await updateTaskInFirebase(task.id, {
        sketch: imageData,
        width: canvasEl.width,
        height: canvasEl.height,
      });
    }
  };

  return (
    <DraggableWrapper
      x={task.x}
      y={task.y}
      onDragEnd={(x, y) => onDrag(task.id, x, y)}
      canvasBoardRef={canvasBoardRef}
      className="task-card"
      style={{
        backgroundColor: categoryColors[task.category] || task.color,
      }}
    >
      <div ref={cardRef}>
        <input
          type="text"
          className="task-text-input"
          value={task.text}
          onChange={(e) => onTextChange(task.id, e.target.value)}
          placeholder="Task title..."
        />

        <div className="category-display">
          <button onClick={undo} disabled={!history.length} className="undo-redo-btn">
            <BiUndo />
          </button>
          <button onClick={redo} disabled={!redoStack.length} className="undo-redo-btn">
            <BiRedo />
          </button>
          <select
            className="category-select"
            value={task.category}
            onChange={(e) => onCategoryChange(task.id, e.target.value)}
          >
            {categoryOptions.map((icon) => (
              <option key={icon} value={icon}>{icon}</option>
            ))}
          </select>
          <input
            type="date"
            className="date-input"
            value={task.dueDate}
            onChange={(e) => onDateChange(task.id, e.target.value)}
          />
        </div>

        <div className="canvas-wrapper">
          <SketchCanvas
            penColor={penColor}
            canvasRef={canvasRef}
            isDrawing={isDrawing}
            setIsDrawing={setIsDrawing}
            ctx={ctx}
            setCtx={setCtx}
            expandCanvasIfNeeded={expandCanvasIfNeeded}
            saveSnapshot={saveSnapshot}
            localPos={{ x: task.x, y: task.y }}
            canvasBoardRef={canvasBoardRef}
            task={task}
          />
        </div>

        <div className="toolbar">
          <input
            type="color"
            value={penColor}
            onChange={(e) => setPenColor(e.target.value)}
            className="color-picker"
          />
          <div>
            <button className="clear-btn" onClick={() => onDelete(task.id)}>Delete</button>
            <button className="save-btn" onClick={saveCanvas}>Save Sketch</button>
            <button
              type="button"
              className={`custom-checkbox ${task.isComplete ? "checked" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                handleCompletion(task.id, task.isComplete, task.saved);
              }}
            />
          </div>
        </div>
      </div>
    </DraggableWrapper>
  );
};

export default TaskCard;
