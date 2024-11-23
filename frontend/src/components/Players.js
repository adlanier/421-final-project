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
  const [editMode, setEditMode] = useState(null); // Stores the ID of the player being edited
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
    if (!newPlayer.name || !newPlayer.team_id) {
      setError("Name and Team are required fields.");
      return;
    }

    setError("");

    addPlayer(newPlayer)
      .then(() => {
        fetchPlayers().then((res) => setPlayers(res.data.players));
        setNewPlayer({
          name: "",
          position: "",
          jersey_num: null,
          height_inches: null,
          weight_lbs: null,
          class: 2023,
          injured: false,
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
    if (!updatedPlayer.name || !updatedPlayer.team_id) {
      setError("Name and Team are required fields.");
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
    <div>
      <h1>Players</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {players.map((player) =>
          editMode === player.id ? (
            <li key={player.id}>
              <input
                type="text"
                value={player.name || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id ? { ...p, name: e.target.value } : p
                    )
                  )
                }
              />
              <input
                type="text"
                value={player.position || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id ? { ...p, position: e.target.value } : p
                    )
                  )
                }
              />
              <input
                type="number"
                value={player.jersey_num || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id
                        ? { ...p, jersey_num: parseInt(e.target.value, 10) }
                        : p
                    )
                  )
                }
              />
              <input
                type="number"
                value={player.height_inches || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id
                        ? { ...p, height_inches: parseFloat(e.target.value) }
                        : p
                    )
                  )
                }
              />
              <input
                type="number"
                value={player.weight_lbs || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id
                        ? { ...p, weight_lbs: parseFloat(e.target.value) }
                        : p
                    )
                  )
                }
              />
              <input
                type="number"
                value={player.class || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id
                        ? { ...p, class: parseInt(e.target.value, 10) }
                        : p
                    )
                  )
                }
              />
              <label>
                <input
                  type="checkbox"
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
                />{" "}
                Injured
              </label>
              <select
                value={player.team_id || ""}
                onChange={(e) =>
                  setPlayers((prev) =>
                    prev.map((p) =>
                      p.id === player.id
                        ? { ...p, team_id: parseInt(e.target.value, 10) }
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
              <button
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
              <button onClick={() => setEditMode(null)}>Cancel</button>
            </li>
          ) : (
            <li key={player.id}>
              {player.name} - {player.position} | Jersey: {player.jersey_num} | Team:{" "}
              {getTeamName(player.team_id)} | Height in Inches: {player.height_inches} | Weight
              in Pounds: {player.weight_lbs} | Class: {player.class} | Injured:{" "}
              {player.injured ? "Yes" : "No"}
              <button onClick={() => setEditMode(player.id)}>Edit</button>
              <button onClick={() => handleDeletePlayer(player.id)}>Delete</button>
            </li>
          )
        )}
      </ul>
      <div>
        <h3>Add a New Player</h3>
        <label>
          Name:
          <input
            type="text"
            placeholder="Name"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          />
        </label>
        <label>
          Position:
          <input
            type="text"
            placeholder="Position"
            value={newPlayer.position}
            onChange={(e) => setNewPlayer({ ...newPlayer, position: e.target.value })}
          />
        </label>
        <label>
          Jersey Number:
          <input
            type="number"
            placeholder="Jersey Number"
            value={newPlayer.jersey_num || ""}
            onChange={(e) =>
              setNewPlayer({ ...newPlayer, jersey_num: parseInt(e.target.value, 10) })
            }
          />
        </label>
        <label>
          Height (in):
          <input
            type="number"
            placeholder="Height"
            value={newPlayer.height_inches || ""}
            onChange={(e) =>
              setNewPlayer({ ...newPlayer, height_inches: parseFloat(e.target.value) })
            }
          />
        </label>
        <label>
          Weight (lbs):
          <input
            type="number"
            placeholder="Weight"
            value={newPlayer.weight_lbs || ""}
            onChange={(e) =>
              setNewPlayer({ ...newPlayer, weight_lbs: parseFloat(e.target.value) })
            }
          />
        </label>
        <label>
          Class (Year):
          <input
            type="number"
            placeholder="Class"
            value={newPlayer.class}
            onChange={(e) =>
              setNewPlayer({ ...newPlayer, class: parseInt(e.target.value, 10) })
            }
          />
        </label>
        <label>
          Injured:
          <input
            type="checkbox"
            checked={newPlayer.injured}
            onChange={(e) => setNewPlayer({ ...newPlayer, injured: e.target.checked })}
          />
        </label>
        <label>
          Team:
          <select
            value={newPlayer.team_id || ""}
            onChange={(e) =>
              setNewPlayer({ ...newPlayer, team_id: parseInt(e.target.value, 10) })
            }
          >
            <option value="">Select Team</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </label>
        <button onClick={handleAddPlayer}>Add Player</button>
      </div>
    </div>
  );
};

export default Players;
