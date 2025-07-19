import { useCallback, useEffect, useState } from "react";
import { auth, db } from "../firebase/firebaseConfig";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    arrayUnion,
    deleteDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { AiFillDelete } from "react-icons/ai";
import "../styles/teams.css";

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState("");
    const [joinId, setJoinId] = useState("");
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setUser(user);
        });
        return () => unsubscribe();
    }, []);

    const fetchTeams = useCallback(async () => {
        if (!user) return;
        const q = query(
            collection(db, "teams"),
            where("members", "array-contains", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const teamList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setTeams(teamList);
    }, [user]);

    const handleCreateTeam = async () => {
        if (!teamName || !user) return;
        await addDoc(collection(db, "teams"), {
            name: teamName,
            createdBy: user.uid,
            members: [user.uid],
            membersDetail: [{ uid: user.uid, name: user.displayName }],
        });
        fetchTeams();
        setTeamName("");
    };

    const handleJoinTeam = async () => {
        if (!joinId || !user) return;
        const teamRef = doc(db, "teams", joinId);
        await updateDoc(teamRef, {
            members: arrayUnion(user.uid),
            membersDetail: arrayUnion({ uid: user.uid, name: user.displayName }),
        });
        fetchTeams();
        setJoinId("");
    };

    useEffect(() => {
        fetchTeams();
    }, [user, fetchTeams]);

    return (
        <div className="teams-container">
            <h2>Your Teams</h2>

            <div className="teams-actions">
                <input
                    type="text"
                    placeholder="New team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                />
                <button onClick={handleCreateTeam}>Create Team</button>

                <input
                    type="text"
                    placeholder="Join with Team ID"
                    value={joinId}
                    onChange={(e) => setJoinId(e.target.value)}
                />
                <button onClick={handleJoinTeam}>Join Team</button>
            </div>

            <div className="teams-list">
                {teams.map((team) => (
                    <div key={team.id} className="team-card">
                        <h3>{team.name}</h3>
                        {team.createdBy === user.uid && (
                            <p className="copy-id" onClick={() => navigator.clipboard.writeText(team.id)}>
                                Share this Team ID to add members:
                                <span>{team.id}</span>
                            </p>
                        )}

                        {team.members && (
                            <div className="team-members">
                                {team.membersDetail && team.membersDetail.map((member, index) => {
                                    let initials = 'U';

                                    if (member.name) {
                                        initials = member.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase();
                                    } else if (member.email) {
                                        const firstChar = member.email.charAt(0).toUpperCase();
                                        initials = isNaN(firstChar) ? firstChar : 'U';
                                    }

                                    return (
                                        <div key={index} className="member-avatar">
                                            {initials}
                                        </div>
                                    );
                                })}
                                <p
                                    style={{
                                        fontSize: "0.8rem",
                                        color: "#555",
                                        marginTop: "0.5rem",
                                    }}
                                >
                                    {team.members.length} member{team.members.length > 1 ? "s" : ""}
                                </p>
                            </div>
                        )}

                        <div className="team-card-btns">
                            <button onClick={() => navigate(`/canvas?teamId=${team.id}`)}>
                                Go to Team Canvas
                            </button>
                            {user && team.createdBy === user.uid && (
                                <button
                                    onClick={async () => {
                                        const confirmed = window.confirm("Are you sure you want to delete this team?");
                                        if (!confirmed) return;
                                        await deleteDoc(doc(db, "teams", team.id));
                                        fetchTeams();
                                    }}
                                    className="delete-btn"
                                >
                                    <AiFillDelete size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Teams;
