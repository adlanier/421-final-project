import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Teams from "./components/Teams";
import Players from "./components/Players";
import Games from "./components/Games";
import Statistics from "./components/Statistics";
import TransferPlayer from "./components/TransferPlayer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <Router>
      <div data-theme="light" className="bg-gray-50 min-h-screen flex flex-col">
        {/* Nav Bar */}
        <header className="bg-white shadow-md">
          <div className="flex justify-between items-center h-16 px-4">
            {/* Avatar linking to Home */}
            <Link to="/">
              <img
                className="w-10 h-10 rounded-full cursor-pointer"
                src="/curry.png"
                alt="Rounded avatar"
              />
            </Link>
            <nav>
              <ul className="flex space-x-6 text-lg font-medium">
                <li>
                  <Link
                    to="/teams"
                    className="hover:text-gray-700 transition-colors duration-200"
                  >
                    Teams
                  </Link>
                </li>
                <li>
                  <Link
                    to="/players"
                    className="hover:text-gray-700 transition-colors duration-200"
                  >
                    Players
                  </Link>
                </li>
                <li>
                  <Link
                    to="/games"
                    className="hover:text-gray-700 transition-colors duration-200"
                  >
                    Games
                  </Link>
                </li>
                <li>
                  <Link
                    to="/statistics"
                    className="hover:text-gray-700 transition-colors duration-200"
                  >
                    Statistics
                  </Link>
                </li>
                <li>
                  <Link
                    to="/transfer"
                    className="hover:text-gray-700 transition-colors duration-200"
                  >
                    Transfer
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Navigate to="/teams" />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/players" element={<Players />} />
            <Route path="/games" element={<Games />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/transfer" element={<TransferPlayer />} />
            <Route
              path="*"
              element={
                <h1 className="text-center text-2xl">404 - Page Not Found</h1>
              }
            />
          </Routes>
        </main>

        {/* Toast Container */}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
};

export default App;
