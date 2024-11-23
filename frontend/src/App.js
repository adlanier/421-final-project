import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Teams from "./components/Teams";
import Players from "./components/Players";
import Games from "./components/Games";
import Statistics from "./components/Statistics";

const App = () => {
  return (
    <Router>
      <div>
        {/* Navigation Bar */}
        <nav style={{ margin: "10px" }}>
          <Link to="/teams" style={{ marginRight: "10px" }}>Teams</Link>
          <Link to="/players" style={{ marginRight: "10px" }}>Players</Link>
          <Link to="/games" style={{ marginRight: "10px" }}>Games</Link>
          <Link to="/statistics" style={{ marginRight: "10px" }}>Statistics</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Navigate to="/teams" />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/players" element={<Players />} />
          <Route path="/games" element={<Games />} />
          <Route path="/statistics" element={<Statistics />} />
          <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
