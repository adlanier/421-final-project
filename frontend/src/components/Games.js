import React, { useEffect, useState } from "react";
import { fetchGames, fetchTeams, addGame, deleteGame, updateGame } from "../api/api";

const Games = () => {
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newGame, setNewGame] = useState({
    scheduled_date: "",
    location: "",
    home_score: 0,
    away_score: 0,
    home_team_id: null,
    away_team_id: null,
  });
  const [editMode, setEditMode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchGames()
      .then((res) => setGames(res.data.games))
      .catch((err) => console.error(err));

    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleAddGame = () => {
    const { scheduled_date,  home_score, away_score, home_team_id, away_team_id } = newGame;
  
    if (!scheduled_date || !home_team_id || !away_team_id) {
      setError("Scheduled date, Home Team, and Away Team are required fields.");
      return;
    }

    if (home_team_id === away_team_id) {
      setError("Home and Away teams cannot be the same.");
      return;
    }
  
    if (home_score < 0 || away_score < 0) {
      setError("Scores cannot be negative.");
      return;
    }

    setError("");
    if (!newGame.home_team_id || !newGame.away_team_id) {
      setError("Home and Away Teams are required fields.");
      return;
    }
    setError("");

  addGame(newGame)
    .then(() => fetchGames().then((res) => setGames(res.data.games)))
    .catch((err) => {
      console.error(err);
      setError(err.response?.data?.error || "An error occurred while adding the game.");
    });
};
  

  const handleDeleteGame = (id) => {
    deleteGame(id)
      .then(() => fetchGames().then((res) => setGames(res.data.games)))
      .catch((err) => console.error(err));
  };

  const handleUpdateGame = (id, updatedGame) => {
    const { scheduled_date, home_score, away_score, home_team_id, away_team_id } = updatedGame;
  
    if (!scheduled_date || !home_team_id || !away_team_id) {
      setError("Scheduled date, Home Team, and Away Team are required fields.");
      return;
    }
  
    if (home_score < 0 || away_score < 0) {
      setError("Scores cannot be negative.");
      return;
    }
    

    if (home_team_id === away_team_id) {
      setError("Home and Away teams cannot be the same.");
      return;
    }
  
    setError("");
    updateGame(id, updatedGame)
      .then(() => {
        fetchGames().then((res) => setGames(res.data.games));
        setEditMode(null);
      })
      .catch((err) => {
        console.error(err);
        setError(err.response?.data?.error || "An error occurred while updating the game.");
      });
  };
  

  const getTeamName = (teamId) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Invalid Date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Games</h1>
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {games.map((game) =>
            editMode === game.id ? (
              <li key={game.id} className="card bg-base-100 shadow-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Scheduled Date</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="date"
                      value={game.scheduled_date || ""}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, scheduled_date: e.target.value }
                              : g
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Location</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="text"
                      value={game.location || ""}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, location: e.target.value }
                              : g
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Home Score</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={game.home_score || 0}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, home_score: parseInt(e.target.value, 10) }
                              : g
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Away Score</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={game.away_score || 0}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, away_score: parseInt(e.target.value, 10) }
                              : g
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Home Team</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={game.home_team_id || ""}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, home_team_id: parseInt(e.target.value, 10) }
                              : g
                          )
                        )
                      }
                    >
                      <option value="">Select Home Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Away Team</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={game.away_team_id || ""}
                      onChange={(e) =>
                        setGames((prev) =>
                          prev.map((g) =>
                            g.id === game.id
                              ? { ...g, away_team_id: parseInt(e.target.value, 10) }
                              : g
                          )
                        )
                      }
                    >
                      <option value="">Select Away Team</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleUpdateGame(game.id, {
                        ...game,
                      })
                    }
                  >
                    Save
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setEditMode(null)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li key={game.id} className="card bg-base-100 shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{formatDate(game.scheduled_date)}</h3>
                    <p>
                      Location: {game.location} | Home: {getTeamName(game.home_team_id)} (
                      {game.home_score}) vs Away: {getTeamName(game.away_team_id)} (
                      {game.away_score})
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setEditMode(game.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            )
          )}
        </ul>

        <div className="card bg-base-100 shadow-md p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">Add a New Game</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Scheduled Date</span>
              </label>
              <input
                className="input input-bordered"
                type="date"
                value={newGame.scheduled_date}
                onChange={(e) =>
                  setNewGame({ ...newGame, scheduled_date: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Location</span>
              </label>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Location"
                value={newGame.location}
                onChange={(e) =>
                  setNewGame({ ...newGame, location: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Home Score</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Home Score"
                value={newGame.home_score}
                onChange={(e) =>
                  setNewGame({ ...newGame, home_score: parseInt(e.target.value, 10) })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Away Score</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Away Score"
                value={newGame.away_score}
                onChange={(e) =>
                  setNewGame({ ...newGame, away_score: parseInt(e.target.value, 10) })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Home Team</span>
              </label>
              <select
                className="select select-bordered"
                value={newGame.home_team_id || ""}
                onChange={(e) =>
                  setNewGame({
                    ...newGame,
                    home_team_id: parseInt(e.target.value, 10),
                  })
                }
              >
                <option value="">Select Home Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Away Team</span>
              </label>
              <select
                className="select select-bordered"
                value={newGame.away_team_id || ""}
                onChange={(e) =>
                  setNewGame({
                    ...newGame,
                    away_team_id: parseInt(e.target.value, 10),
                  })
                }
              >
                <option value="">Select Away Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={handleAddGame}>
            Add Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Games;
