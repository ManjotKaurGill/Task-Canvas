import { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import { TaskContext } from "../context/TaskContext";
import { logout } from "../firebase/authService";
import { doc, getDoc } from "firebase/firestore";
import "../styles/profile.css";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const { tasks } = useContext(TaskContext);
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
            fetchUserFirstName(currentUser.uid);
        }
    }, []);

    const fetchUserFirstName = async (uid) => {
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            setFirstName(docSnap.data().firstName || "");
        }
    };

    const totalSavedTasks = tasks.filter((task) => task.savedInFirestore).length;
    const completedTasks = tasks.filter((task) => task.isComplete).length;

    if (!user) return null;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <div className="profile-avatar">{user.email.charAt(0).toUpperCase()}</div>
                    <div className="profile-details">
                        <h2>Hello {firstName}!</h2>
                        <p>{user.email}</p>
                        <p>
                            Member since:{" "}
                            {user.metadata?.creationTime &&
                                new Date(user.metadata.creationTime).toLocaleDateString("en-GB")}
                        </p>
                    </div>
                </div>

                <div className="profile-stats">
                    <div>
                        <h3>{totalSavedTasks}</h3>
                        <p>Saved Tasks</p>
                    </div>
                    <div>
                        <h3>{completedTasks}</h3>
                        <p>Completed Tasks</p>
                    </div>
                </div>

                <div className="profile-actions">
                    <button className="profile-btn" onClick={() => navigate('/resetPassword')}>Change Password</button>
                    <button
                        className="profile-btn"
                        onClick={() => {
                            logout();
                            navigate('/');
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
