import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CanvasBoard from "./pages/canvasBoard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Teams from "./pages/TeamsPage";
import { TaskProvider } from "./context/TaskContext";
import './App.css';
import Home from "./components/Home";
import ResetPassword from "./components/ResetPassword";
import ProfilePage from "./pages/ProfilePage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <TaskProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/canvas" element={<CanvasBoard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/teams" element={<Teams />} />
        </Routes>
        <ToastContainer position="top-center" />
      </Router>
    </TaskProvider>
  );
}

export default App;
