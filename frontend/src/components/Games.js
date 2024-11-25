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
    <div>
      <h1>Games</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {games.map((game) =>
          editMode === game.id ? (
            <li key={game.id}>
              <input
                type="date"
                value={game.scheduled_date || ""}
                onChange={(e) =>
                  setGames((prev) =>
                    prev.map((g) =>
                      g.id === game.id ? { ...g, scheduled_date: e.target.value } : g
                    )
                  )
                }
              />
              <input
                type="text"
                value={game.location || ""}
                onChange={(e) =>
                  setGames((prev) =>
                    prev.map((g) =>
                      g.id === game.id ? { ...g, location: e.target.value } : g
                    )
                  )
                }
              />
              <input
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
              <input
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
              <select
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
              <select
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
              <button
                onClick={() =>
                  handleUpdateGame(game.id, {
                    ...game,
                  })
                }
              >
                Save
              </button>
              <button onClick={() => setEditMode(null)}>Cancel</button>
            </li>
          ) : (
            <li key={game.id}>
              {formatDate(game.scheduled_date)} - {game.location} | Home Team: {getTeamName(game.home_team_id)} 
              ({game.home_score}) vs Away Team: {getTeamName(game.away_team_id)} ({game.away_score})
              <button onClick={() => setEditMode(game.id)}>Edit</button>
              <button onClick={() => handleDeleteGame(game.id)}>Delete</button>
            </li>
          )
        )}
      </ul>
      <div>
        <h3>Add a New Game</h3>
        <label>
          Scheduled Date:
          <input
            type="date"
            value={newGame.scheduled_date}
            onChange={(e) => setNewGame({ ...newGame, scheduled_date: e.target.value })}
          />
        </label>
        <label>
          Location:
          <input
            type="text"
            placeholder="Location"
            value={newGame.location}
            onChange={(e) => setNewGame({ ...newGame, location: e.target.value })}
          />
        </label>
        <label>
          Home Score:
          <input
            type="number"
            placeholder="Home Score"
            value={newGame.home_score}
            onChange={(e) =>
              setNewGame({ ...newGame, home_score: parseInt(e.target.value, 10) })
            }
          />
        </label>
        <label>
          Away Score:
          <input
            type="number"
            placeholder="Away Score"
            value={newGame.away_score}
            onChange={(e) =>
              setNewGame({ ...newGame, away_score: parseInt(e.target.value, 10) })
            }
          />
        </label>
        <label>
          Home Team:
          <select
            value={newGame.home_team_id || ""}
            onChange={(e) =>
              setNewGame({ ...newGame, home_team_id: parseInt(e.target.value, 10) })
            }
          >
            <option value="">Select Home Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Away Team:
          <select
            value={newGame.away_team_id || ""}
            onChange={(e) =>
              setNewGame({ ...newGame, away_team_id: parseInt(e.target.value, 10) })
            }
          >
            <option value="">Select Away Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleAddGame}>Add Game</button>
      </div>
    </div>
  );
};

export default Games;
