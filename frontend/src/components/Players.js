import React, { useEffect, useState } from "react";
import { fetchPlayers, fetchTeams, addPlayer, deletePlayer, updatePlayer } from "../api/api";

const Players = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    position: "",
    jersey_num: null,
    height_inches: null,
    weight_lbs: null,
    class: 2023,
    injured: false,
    team_id: null,
  });
  const [editMode, setEditMode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPlayers()
      .then((res) => setPlayers(res.data.players))
      .catch((err) => console.error(err));

    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleAddPlayer = () => {
    const { name, jersey_num, height_inches, weight_lbs, class: playerClass, team_id } = newPlayer;
  
    if (!name || !team_id) {
      setError("Name and Team are required fields.");
      return;
    }
  
    if (jersey_num !== null && (jersey_num < 0 || jersey_num > 99)) {
      setError("Jersey number must be between 0 and 99.");
      return;
    }
  
    if (playerClass !== null && playerClass < 2016) {
      setError("Class must be 2016 or later.");
      return;
    }

    if ( height_inches < 0 || weight_lbs  < 0 ) {
     setError("Player height or weight cannot be negative");
     return;
    }

  // Check if a player with the same jersey number exists on the same team
  const existingPlayer = players.find(
    (player) => player.team_id === team_id && player.jersey_num === jersey_num
  );

  if (existingPlayer) {
    setError(
      `Jersey number ${jersey_num} is already taken by another player on this team.`
    );
    return;
  }
  
    setError("");
    addPlayer(newPlayer)
    .then(() => {
      fetchPlayers().then((res) => setPlayers(res.data.players));
      setNewPlayer({
        name: "",
        jersey_num: null,
        height_inches: null,
        weight_lbs: null,
        class: null,
        team_id: null,
      });
    })
    .catch((err) => console.error(err));
};
  

  const handleDeletePlayer = (id) => {
    deletePlayer(id)
      .then(() => fetchPlayers().then((res) => setPlayers(res.data.players)))
      .catch((err) => console.error(err));
  };

  const handleUpdatePlayer = (id, updatedPlayer) => {
    const { name, jersey_num, height_inches, weight_lbs , class: playerClass, team_id } = updatedPlayer;
  
    if (!name || !team_id) {
      setError("Name and Team are required fields.");
      return;
    }
  
    if (jersey_num !== null && (jersey_num < 0 || jersey_num > 99)) {
      setError("Jersey number must be between 0 and 99.");
      return;
    }
  
    if (playerClass !== null && playerClass < 2016) {
      setError("Class must be 2016 or later.");
      return;
    }
    
    if ( height_inches < 0 || weight_lbs  < 0 ) {
      setError("Player height or weight cannot be negative");
      return;
     }

    // Check if a player with the same jersey number exists on the same team
    const existingPlayer = players.find(
      (player) => player.team_id === team_id && player.jersey_num === jersey_num
    );

    if (existingPlayer) {
    setError(
        `Jersey number ${jersey_num} is already taken by another player on this team.`
      );
      return;
    }
      setError(""); 
    updatePlayer(id, updatedPlayer)
      .then(() => {
        setPlayers((prevPlayers) =>
          prevPlayers.map((player) =>
            player.id === id ? { ...player, ...updatedPlayer } : player
          )
        );
        setEditMode(null);
      })
      .catch((err) => console.error(err));
  };
  

  const getTeamName = (team_id) => {
    const team = teams.find((team) => team.id === team_id);
    return team ? team.name : "Unknown Team";
  };

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Players</h1>
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {players.map((player) =>
            editMode === player.id ? (
              <li key={player.id} className="card bg-base-100 shadow-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="text"
                      value={player.name || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? { ...p, name: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Position</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="text"
                      value={player.position || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? { ...p, position: e.target.value }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Jersey Number</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={player.jersey_num || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? {
                                  ...p,
                                  jersey_num: parseInt(e.target.value, 10),
                                }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Height (in)</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={player.height_inches || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? {
                                  ...p,
                                  height_inches: parseFloat(e.target.value),
                                }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Weight (lbs)</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={player.weight_lbs || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? {
                                  ...p,
                                  weight_lbs: parseFloat(e.target.value),
                                }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Class</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="number"
                      value={player.class || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? {
                                  ...p,
                                  class: parseInt(e.target.value, 10),
                                }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Injured</span>
                    </label>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={player.injured || false}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? { ...p, injured: e.target.checked }
                              : p
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Team</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={player.team_id || ""}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) =>
                            p.id === player.id
                              ? {
                                  ...p,
                                  team_id: parseInt(e.target.value, 10),
                                }
                              : p
                          )
                        )
                      }
                    >
                      <option value="">Select Team</option>
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
                      handleUpdatePlayer(player.id, {
                        name: player.name,
                        position: player.position,
                        jersey_num: player.jersey_num,
                        height_inches: player.height_inches,
                        weight_lbs: player.weight_lbs,
                        class: player.class,
                        injured: player.injured,
                        team_id: player.team_id,
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
              <li key={player.id} className="card bg-base-100 shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{player.name}</h3>
                    <p>
                      Position: {player.position} | Jersey: {player.jersey_num} | Team:{" "}
                      {getTeamName(player.team_id)}
                    </p>
                    <p>
                      Height: {player.height_inches} in | Weight: {player.weight_lbs} lbs | Class:{" "}
                      {player.class}
                    </p>
                    <p>Injured: {player.injured ? "Yes" : "No"}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setEditMode(player.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeletePlayer(player.id)}
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
          <h3 className="text-xl font-bold mb-4">Add a New Player</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Name"
                value={newPlayer.name}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Position</span>
              </label>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Position"
                value={newPlayer.position}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, position: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Jersey Number</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Jersey Number"
                value={newPlayer.jersey_num || ""}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    jersey_num: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Height (in)</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Height"
                value={newPlayer.height_inches || ""}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    height_inches: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Weight (lbs)</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Weight"
                value={newPlayer.weight_lbs || ""}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    weight_lbs: parseFloat(e.target.value),
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Class</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Class"
                value={newPlayer.class}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    class: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Injured</span>
              </label>
              <input
                type="checkbox"
                className="checkbox"
                checked={newPlayer.injured}
                onChange={(e) =>
                  setNewPlayer({ ...newPlayer, injured: e.target.checked })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Team</span>
              </label>
              <select
                className="select select-bordered"
                value={newPlayer.team_id || ""}
                onChange={(e) =>
                  setNewPlayer({
                    ...newPlayer,
                    team_id: parseInt(e.target.value, 10),
                  })
                }
              >
                <option value="">Select Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-primary mt-4" onClick={handleAddPlayer}>
            Add Player
          </button>
        </div>
      </div>
    </div>
  );
};

export default Players;
