import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import "../styles/canvas.css";
import "../styles/teams.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <header className="canvas-header">
        <h1 className="logo"><a href="/" style={{ textDecoration: 'none' }}>TaskCanvas 🎨</a></h1>
        <div className="auth-buttons">
          <button className="header-btn" onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </header>

      <section className="Home">
        <h1>
          Turn Chaos into Canvas
          <span className="highlight"></span>🎨
        </h1>
        <h2 className="tagline">Sketch. Organize. Achieve.</h2>
        <p className="description">
          Plan your ideas visually on your personal canvas. Drag, doodle, and organize tasks creatively.
        </p>
        <button className="signup-btn" onClick={() => navigate('/signup')}>
          Get Started
        </button>
      </section>

      <section className="features">
        <h2>Why TaskCanvas?</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3>🎨 Visual Tasks</h3>
            <p>Move, sketch, and color-code your tasks just like sticky notes on a board.</p>
          </div>
          <div className="feature-card">
            <h3>🖋️ Doodle Support</h3>
            <p>Sketch ideas directly on tasks for quick brainstorming without leaving your canvas.</p>
          </div>
          <div className="feature-card">
            <h3>☁️ Cloud Sync</h3>
            <p>Tasks are safely saved in the cloud, ready on any device you log in from.</p>
          </div>
        </div>
      </section>

      <section className="teams-preview">
        <h2>Collaborate with Teams</h2>
        <p>Join forces with friends, classmates, or coworkers on shared canvases. Build together, plan together.</p>
        <div className="teams-preview-cards">
          <div className="team-preview-card">
            <h3>Create Teams</h3>
            <p>Start your own team to manage group projects visually.</p>
          </div>
          <div className="team-preview-card">
            <h3>Join Teams</h3>
            <p>Use team codes to quickly join existing shared canvases.</p>
          </div>
          <div className="team-preview-card">
            <h3>Collaborative Canvas</h3>
            <p>Work together in real-time, share ideas, and stay in sync.</p>
          </div>
        </div>
        <button className="signup-btn" onClick={() => navigate('/teams')}>
          Explore Teams
        </button>
      </section>

      <section className="cta">
        <h2>Ready to Sketch Your Success?</h2>
        <p>Create your first canvas and bring ideas to life visually.</p>
        <button className="signup-btn" onClick={() => navigate('/signup')}>
          Sign up
        </button>
      </section>

      <section className="testimonials">
        <h2>What Our Users Say</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <p>"I've used dozens of tools, but this is the first one that lets me brainstorm visually, like on paper."</p>
            <h4>— Priya, Marketing Lead</h4>
          </div>
          <div className="testimonial-card">
            <p>"Collaborating with classmates on TaskCanvas feels effortless. We can share ideas visually, stay organized, and actually enjoy planning our projects together."</p>
            <h4>Anmol, Design Student</h4>
          </div>
          <div className="testimonial-card">
            <p>"TaskCanvas helps me visualize my study schedule in a fun, flexible way. It’s like organizing my tasks on a canvas."</p>
            <h4>— Rohan, Computer Science Student</h4>
          </div>
          <div className="testimonial-card">
            <p>"Finally, a task manager that doesn’t feel like another boring list! TaskCanvas lets my creative side breathe."</p>
            <h4>— Sarah, Freelance Illustrator</h4>
          </div>
          <div className="testimonial-card">
            <p>"TaskCanvas made it incredibly easy for our remote team to brainstorm visually.
              Creating and joining team canvases feels natural — it brought back the fun to assign tasks!"</p>
            <h4>— Aman, Product Manager</h4>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>© {new Date().getFullYear()} TaskCanvas. Built with 💙 for creators who love clarity.</p>
      </footer>
    </>
  );
};

export default Home;
