import React, { useEffect, useState } from "react";
import {
  fetchStatistics,
  fetchPlayers,
  fetchGames,
  fetchTeams,
  addStatistic,
  deleteStatistic,
  updateStatistic,
} from "../api/api";

const Statistics = () => {
  const [statistics, setStatistics] = useState([]);
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newStat, setNewStat] = useState({
    points: 0,
    assists: 0,
    rebounds: 0,
    steals: 0,
    blocks: 0,
    minutes: 0,
    fouls: 0,
    turnovers: 0,
    fg_pct: 0.0,
    three_p_pct: 0.0,
    ft_pct: 0.0,
    player_id: null,
    game_id: null,
  });
  const [editMode, setEditMode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics()
      .then((res) => setStatistics(res.data.statistics))
      .catch((err) => console.error(err));

    fetchPlayers()
      .then((res) => setPlayers(res.data.players))
      .catch((err) => console.error(err));

    fetchGames()
      .then((res) => setGames(res.data.games))
      .catch((err) => console.error(err));

    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleAddStatistic = () => {
    if (!newStat.player_id || !newStat.game_id) {
      setError("Player and Game are required fields.");
      return;
    }

    const invalidFields = Object.entries(newStat).filter(
      ([key, value]) =>
        key !== "player_id" && key !== "game_id" && value < 0
    );

    if (invalidFields.length > 0) {
      setError(
        `${invalidFields
          .map(([key]) => key.replace(/_/g, " "))
          .join(", ")} cannot have negative values.`
      );
      return;
    }

    setError("");

    addStatistic(newStat)
      .then(() => {
        fetchStatistics().then((res) => setStatistics(res.data.statistics));
        setNewStat({
          points: 0,
          assists: 0,
          rebounds: 0,
          steals: 0,
          blocks: 0,
          minutes: 0,
          fouls: 0,
          turnovers: 0,
          fg_pct: 0.0,
          three_p_pct: 0.0,
          ft_pct: 0.0,
          player_id: null,
          game_id: null,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteStatistic = (id) => {
    deleteStatistic(id)
      .then(() => fetchStatistics().then((res) => setStatistics(res.data.statistics)))
      .catch((err) => console.error(err));
  };

  const handleUpdateStatistic = (id, updatedStat) => {
    if (!updatedStat.player_id || !updatedStat.game_id) {
      setError("Player and Game are required fields.");
      return;
    }

    const invalidFields = Object.entries(updatedStat).filter(
      ([key, value]) =>
        key !== "player_id" && key !== "game_id" && value < 0
    );

    if (invalidFields.length > 0) {
      setError(
        `${invalidFields
          .map(([key]) => key.replace(/_/g, " "))
          .join(", ")} cannot have negative values.`
      );
      return;
    }

    setError("");

    updateStatistic(id, updatedStat)
      .then(() => {
        fetchStatistics().then((res) => setStatistics(res.data.statistics));
        setEditMode(null);
      })
      .catch((err) => console.error(err));
  };

  const getTeamName = (teamId) => {
    const team = teams.find((team) => team.id === teamId);
    return team ? team.name : "Unknown Team";
  };

  const getGameLabel = (game) => {
    const homeTeam = getTeamName(game.home_team_id);
    const awayTeam = getTeamName(game.away_team_id);
    return `${homeTeam} vs ${awayTeam}`;
  };

  const getPlayerName = (playerId) => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : "Unknown Player";
  };

  const getGameName = (gameId) => {
    const game = games.find((g) => g.id === gameId);
    return game ? getGameLabel(game) : "Unknown Game";
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Statistics</h1>
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {statistics.map((stat) =>
            editMode === stat.id ? (
              <li key={stat.id} className="card bg-base-100 shadow-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Player</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={stat.player_id || ""}
                      onChange={(e) =>
                        setStatistics((prev) =>
                          prev.map((s) =>
                            s.id === stat.id
                              ? { ...s, player_id: parseInt(e.target.value, 10) }
                              : s
                          )
                        )
                      }
                    >
                      <option value="">Select Player</option>
                      {players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Game</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={stat.game_id || ""}
                      onChange={(e) =>
                        setStatistics((prev) =>
                          prev.map((s) =>
                            s.id === stat.id
                              ? { ...s, game_id: parseInt(e.target.value, 10) }
                              : s
                          )
                        )
                      }
                    >
                      <option value="">Select Game</option>
                      {games.map((game) => (
                        <option key={game.id} value={game.id}>
                          {getGameLabel(game)}
                        </option>
                      ))}
                    </select>
                  </div>
                  {Object.keys(stat).map(
                    (key) =>
                      key !== "player_id" &&
                      key !== "game_id" &&
                      key !== "id" && (
                        <div key={key}>
                          <label className="label">
                            <span className="label-text">
                              {key.replace(/_/g, " ").toUpperCase()}
                            </span>
                          </label>
                          <input
                            className="input input-bordered"
                            type="number"
                            value={stat[key] || 0}
                            onChange={(e) =>
                              setStatistics((prev) =>
                                prev.map((s) =>
                                  s.id === stat.id
                                    ? { ...s, [key]: parseFloat(e.target.value) || 0 }
                                    : s
                                )
                              )
                            }
                          />
                        </div>
                      )
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="btn btn-success"
                    onClick={() =>
                      handleUpdateStatistic(stat.id, {
                        ...stat,
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
              <li key={stat.id} className="card bg-base-100 shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">
                      Player: {getPlayerName(stat.player_id)}
                    </h3>
                    <p>
                      Game: {getGameName(stat.game_id)} | Points: {stat.points}, Assists:{" "}
                      {stat.assists}, Rebounds: {stat.rebounds}, Steals: {stat.steals}, Blocks:{" "}
                      {stat.blocks}, Minutes: {stat.minutes}, Fouls: {stat.fouls}, Turnovers:{" "}
                      {stat.turnovers}, FG%: {stat.fg_pct}, 3P%: {stat.three_p_pct}, FT%:{" "}
                      {stat.ft_pct}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setEditMode(stat.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteStatistic(stat.id)}
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
          <h3 className="text-xl font-bold mb-4">Add a New Statistic</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Player</span>
              </label>
              <select
                className="select select-bordered"
                value={newStat.player_id || ""}
                onChange={(e) =>
                  setNewStat({ ...newStat, player_id: parseInt(e.target.value, 10) })
                }
              >
                <option value="">Select Player</option>
                {players.map((player) => (
                  <option key={player.id} value={player.id}>
                    {player.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">
                <span className="label-text">Game</span>
              </label>
              <select
                className="select select-bordered"
                value={newStat.game_id || ""}
                onChange={(e) =>
                  setNewStat({ ...newStat, game_id: parseInt(e.target.value, 10) })
                }
              >
                <option value="">Select Game</option>
                {games.map((game) => (
                  <option key={game.id} value={game.id}>
                    {getGameLabel(game)}
                  </option>
                ))}
              </select>
            </div>
            {Object.keys(newStat).map((key) =>
              key !== "player_id" && key !== "game_id" ? (
                <div key={key}>
                  <label className="label">
                    <span className="label-text">
                      {key.replace(/_/g, " ").toUpperCase()}
                    </span>
                  </label>
                  <input
                    className="input input-bordered"
                    type="number"
                    min="0"
                    placeholder={key.replace(/_/g, " ").toUpperCase()}
                    value={newStat[key] || 0}
                    onChange={(e) =>
                      setNewStat({
                        ...newStat,
                        [key]: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              ) : null
            )}
          </div>
          <button className="btn btn-primary mt-4" onClick={handleAddStatistic}>
            Add Statistic
          </button>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
