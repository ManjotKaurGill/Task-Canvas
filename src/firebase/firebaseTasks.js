import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    updateDoc,
    query,
    where,
    getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const tasksCollectionName = "tasks";

export const addTaskToFirebase = async (task) => {
    const docRef = await addDoc(collection(db, tasksCollectionName), {
        ...task,
        teamId: task.teamId || null,
    });
    return { id: docRef.id, ...task, saved: true };
};

export const updateTaskInFirebase = async (taskId, updatedTask) => {
    const taskDoc = doc(db, tasksCollectionName, taskId);
    await updateDoc(taskDoc, updatedTask);
};

export const deleteTaskFromFirebase = async (taskId) => {
    const taskDoc = doc(db, tasksCollectionName, taskId);
    await deleteDoc(taskDoc);
};

export const getTasksFromFirebase = async () => {
    const user = auth.currentUser;
    if (!user) return [];

    const q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};

export const subscribeToTasks = (setTasks, userId, teamId = null) => {
    let q;
    if (teamId) {
        q = query(
            collection(db, "tasks"),
            where("teamId", "==", teamId),
        );
    } else {
        q = query(
            collection(db, "tasks"),
            where("userId", "==", userId),
            where("teamId", "==", null),
        );
    }

    return onSnapshot(q, (querySnapshot) => {
        const tasksData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            saved: true,
        }));
        setTasks(tasksData);
    });
};
