import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TaskCard from "../components/TaskCard/TaskCard";
import "../styles/canvas.css";
import { auth, db } from "../firebase/firebaseConfig";
import { CgProfile } from "react-icons/cg";
import {
    updateTaskInFirebase,
    subscribeToTasks,
    deleteTaskFromFirebase,
    addTaskToFirebase,
} from "../firebase/firebaseTasks";
import { TaskContext } from "../context/TaskContext";
import { doc, getDoc } from "firebase/firestore";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

// Local Storage Helpers (personal tasks only)
const saveUnsavedTasks = (tasks) => {
    const unsaved = tasks.filter((task) => !task.saved && !task.teamId);
    localStorage.setItem("unsavedTasks", JSON.stringify(unsaved));
};
const loadUnsavedTasks = () => {
    return JSON.parse(localStorage.getItem("unsavedTasks")) || [];
};
const removeUnsavedTask = (id) => {
    const updated = loadUnsavedTasks().filter((task) => task.id !== id);
    localStorage.setItem("unsavedTasks", JSON.stringify(updated));
};

const CanvasBoard = () => {
    const { tasks, setTasks } = useContext(TaskContext);
    const [user, setUser] = useState(null);
    const [teamName, setTeamName] = useState("");
    const boardRef = useRef(null);
    const navigate = useNavigate();
    const query = useQuery();
    const teamId = query.get("teamId");

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            setUser(user);
            if (!user) navigate("/login");
        });
        return () => unsubscribeAuth();
    }, [navigate]);

    useEffect(() => {
        if (!user) return;
        const unsubscribeTasks = subscribeToTasks(
            (fetchedTasks) => {
                if (teamId) {
                    setTasks(fetchedTasks); // team tasks only
                } else {
                    const unsaved = loadUnsavedTasks();
                    setTasks([...fetchedTasks, ...unsaved]);
                }
            },
            user.uid,
            teamId
        );
        return () => unsubscribeTasks && unsubscribeTasks();
    }, [user, teamId, setTasks]);

    useEffect(() => {
        if (teamId) {
            const fetchTeamName = async () => {
                const docRef = doc(db, "teams", teamId);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setTeamName(docSnap.data().name);
                }
            };
            fetchTeamName();
        }
    }, [teamId]);

    useEffect(() => {
        if (!teamId) {
            saveUnsavedTasks(tasks);
        }
    }, [tasks, teamId]);

    const ensureCanvasHeightFitsTasks = () => {
        if (!boardRef.current) return;
        const buffer = 300;
        const maxY = Math.max(...tasks.map((task) => task.y + 200), 0);
        const neededHeight = maxY + buffer;
        if (boardRef.current.clientHeight < neededHeight) {
            boardRef.current.style.height = `${neededHeight}px`;
        }
    };

    const handleAddTask = async () => {
        if (!boardRef.current) return;
        const rect = boardRef.current.getBoundingClientRect();
        const cardWidth = 400;
        const cardHeight = 200;
        const maxX = rect.width - cardWidth;
        const maxY = rect.height - cardHeight;
        const randomX = Math.max(0, Math.random() * maxX);
        const randomY = Math.max(0, Math.random() * maxY);

        const newTask = {
            userId: user.uid,
            teamId: teamId || null,
            text: "",
            category: "📝",
            x: randomX,
            y: randomY,
            dueDate: "",
            isComplete: false,
            sketch: null,
            saved: false,
        };

        if (teamId) {
            await addTaskToFirebase({ ...newTask, saved: true });
        } else {
            setTasks((prevTasks) => [...prevTasks, { ...newTask, id: Date.now().toString() }]);
            ensureCanvasHeightFitsTasks();
        }
    };

    const updateTaskPosition = async (id, newX, newY) => {
        setTasks((prev) =>
            prev.map((task) => (task.id === id ? { ...task, x: newX, y: newY } : task))
        );
        const currentTask = tasks.find((t) => t.id === id);
        if (currentTask?.saved) {
            await updateTaskInFirebase(id, { x: newX, y: newY });
        }
    };

    const updateTaskCategory = async (id, taskCategory) => {
        setTasks((prev) =>
            prev.map((task) =>
                task.id === id ? { ...task, category: taskCategory } : task
            )
        );
        const currentTask = tasks.find((t) => t.id === id);
        if (currentTask?.saved) {
            await updateTaskInFirebase(id, { category: taskCategory });
        }
    };

    return (
        <div className="canvas-container">
            <header className="canvas-header">
                <h1 className="logo"><a href="/" style={{ textDecoration: 'none' }}>TaskCanvas 🎨</a></h1>
                <div className="header-btns-container">
                    <button className="header-btn" onClick={handleAddTask}>
                        + Add Task
                    </button>
                    <button className="header-btn" onClick={() => navigate("/teams")}>
                        + Add Team
                    </button>
                    <div className="profile-avatar-nav" onClick={() => navigate("/profile")}>
                        {user?.displayName?.charAt(0).toUpperCase() || <CgProfile size={20} />}
                    </div>
                </div>
            </header>

            {teamId && (
                <div className="team-banner">
                    <h3>🫂 Working in Team: {teamName}</h3>
                    <button
                        className="leave-team-btn"
                        onClick={() => navigate("/canvas")}
                    >
                        ❌
                    </button>
                </div>
            )}

            <main ref={boardRef} className="canvas-board">
                {tasks.length === 0 && (
                    <p className="empty-state">No tasks yet. Click "Add Task" to create one!</p>
                )}
                {tasks.map((task) => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        onDrag={updateTaskPosition}
                        onTextChange={(id, text) => {
                            setTasks((prevTasks) =>
                                prevTasks.map((task) =>
                                    task.id === id ? { ...task, text } : task
                                )
                            );
                            const currentTask = tasks.find((t) => t.id === id);
                            if (currentTask?.saved) {
                                updateTaskInFirebase(id, { text });
                            }
                        }}
                        onDateChange={(id, date) => {
                            setTasks((prev) =>
                                prev.map((task) => task.id === id ? { ...task, dueDate: date } : task)
                            );
                            const currentTask = tasks.find((t) => t.id === id);
                            if (currentTask?.saved) {
                                updateTaskInFirebase(id, { dueDate: date });
                            }
                        }}
                        onCategoryChange={updateTaskCategory}
                        canvasBoardRef={boardRef}
                        onDelete={async (taskId) => {
                            const taskToDelete = tasks.find((t) => t.id === taskId);
                            if (taskToDelete?.saved) {
                                await deleteTaskFromFirebase(taskId);
                            }
                            setTasks((prev) => prev.filter((task) => task.id !== taskId));
                        }}
                        onTaskSaved={(localId, savedTask) => {
                            setTasks((prev) =>
                                prev.map((task) =>
                                    task.id === localId ? { ...savedTask, savedInFirestore: true } : task
                                )
                            );
                            removeUnsavedTask(localId);
                        }}
                    />
                ))}
            </main>
        </div>
    );
};

export default CanvasBoard;
