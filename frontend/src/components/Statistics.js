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
    const {
      points,
      assists,
      rebounds,
      steals,
      blocks,
      minutes,
      fouls,
      turnovers,
      fg_pct,
      three_p_pct,
      ft_pct,
      player_id,
      game_id,
    } = newStat;
  
    if (!player_id || !game_id) {
      setError("Player and Game are required fields.");
      return;
    }

    const existingStat = statistics.find(
      (stat) => stat.player_id === player_id && stat.game_id === game_id
    );
  
    if (existingStat) {
      setError("This player already has statistics recorded for this game.");
      return;
    }
  
    if (
      points < 0 ||
      assists < 0 ||
      rebounds < 0 ||
      steals < 0 ||
      blocks < 0 ||
      minutes < 0 ||
      fouls < 0 ||
      turnovers < 0 ||
      fg_pct < 0 ||
      three_p_pct < 0 ||
      ft_pct < 0
    ) {
      setError("Statistic values cannot be negative.");
      return;
    }
  
    if (fg_pct > 100 || three_p_pct > 100 || ft_pct > 100) {
      setError("Percentage stats cannot exceed 100.");
      return;
    }
  
    if (minutes > 40) {
      setError("Minutes cannot exceed 40.");
      return;
    }
  
    if (points > 0 && fg_pct === 0 && ft_pct === 0) {
      setError("If a player has points, either FG% or FT% must be greater than 0.");
      return;
    }
  
    if (fouls > 5) {
      setError("Fouls cannot exceed 5.");
      return;
    }
  
    const game = games.find((g) => g.id === game_id);
    const player = players.find((p) => p.id === player_id);
    if (game && player) {
      if (
        player.team_id !== game.home_team_id &&
        player.team_id !== game.away_team_id
      ) {
        setError("Player must belong to one of the teams playing in the game.");
        return;
      }
    } else {
      setError("Invalid game or player selection.");
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
    const {
      points,
      assists,
      rebounds,
      steals,
      blocks,
      minutes,
      fouls,
      turnovers,
      fg_pct,
      three_p_pct,
      ft_pct,
      player_id,
      game_id,
    } = updatedStat;
  
    if (!player_id || !game_id) {
      setError("Player and Game are required fields.");
      return;
    }

    const existingStat = statistics.find(
      (stat) => stat.player_id === player_id && stat.game_id === game_id
    );
  
    if (existingStat) {
      setError("This player already has statistics recorded for this game.");
      return;
    }
  
    if (
      points < 0 ||
      assists < 0 ||
      rebounds < 0 ||
      steals < 0 ||
      blocks < 0 ||
      minutes < 0 ||
      fouls < 0 ||
      turnovers < 0 ||
      fg_pct < 0 ||
      three_p_pct < 0 ||
      ft_pct < 0
    ) {
      setError("Statistic values cannot be negative.");
      return;
    }
  
    if (fg_pct > 100 || three_p_pct > 100 || ft_pct > 100) {
      setError("Percentage stats cannot exceed 100.");
      return;
    }
  
    if (minutes > 40) {
      setError("Minutes cannot exceed 40.");
      return;
    }
  
    if (points > 0 && fg_pct === 0 && ft_pct === 0) {
      setError("If a player has points, either FG% or FT% must be greater than 0.");
      return;
    }
  
    if (fouls > 5) {
      setError("Fouls cannot exceed 5.");
      return;
    }
  
    const game = games.find((g) => g.id === game_id);
    const player = players.find((p) => p.id === player_id);
    if (game && player) {
      if (
        player.team_id !== game.home_team_id &&
        player.team_id !== game.away_team_id
      ) {
        setError("Player must belong to one of the teams playing in the game.");
        return;
      }
    } else {
      setError("Invalid game or player selection.");
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
    <div>
      <h1>Statistics</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {statistics.map((stat) =>
          editMode === stat.id ? (
            <li key={stat.id}>
              <select
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
              <select
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
              {Object.keys(stat).map(
                (key) =>
                  key !== "player_id" &&
                  key !== "game_id" &&
                  key !== "id" && (
                    <input
                      key={key}
                      type="number"
                      value={stat[key] || 0}
                      onChange={(e) =>
                        setStatistics((prev) =>
                          prev.map((s) =>
                            s.id === stat.id
                              ? {
                                  ...s,
                                  [key]: parseFloat(e.target.value) || 0,
                                }
                              : s
                          )
                        )
                      }
                    />
                  )
              )}
              <button
                onClick={() =>
                  handleUpdateStatistic(stat.id, {
                    ...stat,
                  })
                }
              >
                Save
              </button>
              <button onClick={() => setEditMode(null)}>Cancel</button>
            </li>
          ) : (
            <li key={stat.id}>
 Player: {getPlayerName(stat.player_id)}, Game: {getGameName(stat.game_id)} | 
      Points: {stat.points}, Assists: {stat.assists}, Rebounds: {stat.rebounds}, 
      Steals: {stat.steals}, Blocks: {stat.blocks}, Minutes: {stat.minutes}, 
      Fouls: {stat.fouls}, Turnovers: {stat.turnovers}, Field Goal %: {stat.fg_pct}, 
      3P %: {stat.three_p_pct}, FT %: {stat.ft_pct}              
      <button onClick={() => setEditMode(stat.id)}>Edit</button>
              <button onClick={() => handleDeleteStatistic(stat.id)}>Delete</button>
            </li>
          )
        )}
      </ul>
      <div>
        <h3>Add a New Statistic</h3>
        <label>
          Player:
          <select
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
        </label>
        <label>
          Game:
          <select
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
        </label>
        {Object.keys(newStat).map((key) =>
          key !== "player_id" && key !== "game_id" ? (
            <label key={key}>
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ")}:
              <input
                type="number"
                min="0"
                placeholder={key}
                value={newStat[key] || 0}
                onChange={(e) =>
                  setNewStat({
                    ...newStat,
                    [key]: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </label>
          ) : null
        )}
        <button onClick={handleAddStatistic}>Add Statistic</button>
      </div>
    </div>
  );
};

export default Statistics;
