import React, { useEffect, useState } from "react";
import { fetchTeams, addTeam, deleteTeam, updateTeam } from "../api/api";

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [newTeam, setNewTeam] = useState({
    name: "",
    division: 1,
    wins: 0,
    losses: 0,
    top_25: false,
    rank: null,
  });
  const [editMode, setEditMode] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleAddTeam = () => {
    if (!newTeam.name || !newTeam.division) {
      setError("Name and Division are required.");
      return;
    }
    setError("");
    addTeam(newTeam)
      .then(() => {
        fetchTeams().then((res) => setTeams(res.data.teams));
        setNewTeam({
          name: "",
          division: 1,
          wins: 0,
          losses: 0,
          top_25: false,
          rank: null,
        });
      })
      .catch((err) => console.error(err));
  };

  const handleDeleteTeam = (id) => {
    deleteTeam(id)
      .then(() => fetchTeams().then((res) => setTeams(res.data.teams)))
      .catch((err) => console.error(err));
  };

  const handleUpdateTeam = (id, updatedTeam) => {
    if (!updatedTeam.name || !updatedTeam.division) {
      setError("Name and Division are required.");
      return;
    }
    setError("");

    updateTeam(id, updatedTeam)
      .then(() => {
        setTeams((prevTeams) =>
          prevTeams.map((team) =>
            team.id === id ? { ...team, ...updatedTeam } : team
          )
        );
        setEditMode(null);
      })
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Teams</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {teams.map((team) =>
          editMode === team.id ? (
            <li key={team.id}>
              <input
                type="text"
                value={team.name || ""}
                onChange={(e) =>
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === team.id ? { ...t, name: e.target.value } : t
                    )
                  )
                }
              />
              <input
                type="number"
                value={team.division || ""}
                onChange={(e) =>
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === team.id
                        ? { ...t, division: parseInt(e.target.value, 10) }
                        : t
                    )
                  )
                }
              />
              <input
                type="number"
                value={team.wins || ""}
                onChange={(e) =>
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === team.id
                        ? { ...t, wins: parseInt(e.target.value, 10) }
                        : t
                    )
                  )
                }
              />
              <input
                type="number"
                value={team.losses || ""}
                onChange={(e) =>
                  setTeams((prev) =>
                    prev.map((t) =>
                      t.id === team.id
                        ? { ...t, losses: parseInt(e.target.value, 10) }
                        : t
                    )
                  )
                }
              />
              <label>
                <input
                  type="checkbox"
                  checked={team.top_25 || false}
                  onChange={(e) =>
                    setTeams((prev) =>
                      prev.map((t) =>
                        t.id === team.id
                          ? { ...t, top_25: e.target.checked }
                          : t
                      )
                    )
                  }
                />{" "}
                Top 25
              </label>
              {team.top_25 && (
                <input
                  type="number"
                  value={team.rank || ""}
                  onChange={(e) =>
                    setTeams((prev) =>
                      prev.map((t) =>
                        t.id === team.id
                          ? {
                              ...t,
                              rank: e.target.value
                                ? parseInt(e.target.value, 10)
                                : null,
                            }
                          : t
                      )
                    )
                  }
                />
              )}
              <button
                onClick={() =>
                  handleUpdateTeam(team.id, {
                    name: team.name,
                    division: team.division,
                    wins: team.wins,
                    losses: team.losses,
                    top_25: team.top_25,
                    rank: team.rank,
                  })
                }
              >
                Save
              </button>
              <button onClick={() => setEditMode(null)}>Cancel</button>
            </li>
          ) : (
            <li key={team.id}>
              {team.name} (Division {team.division}) - Wins: {team.wins}, Losses:{" "}
              {team.losses} {team.top_25 ? `(Rank: ${team.rank})` : ""}
              <button onClick={() => setEditMode(team.id)}>Edit</button>
              <button onClick={() => handleDeleteTeam(team.id)}>Delete</button>
            </li>
          )
        )}
      </ul>
      <div>
        <h3>Add a New Team</h3>
        <div>
          <label>
            Name:
            <input
              type="text"
              placeholder="Name"
              value={newTeam.name}
              onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
            />
          </label>
        </div>
        <div>
          <label>
            Division:
            <input
              type="number"
              placeholder="Division"
              value={newTeam.division}
              onChange={(e) =>
                setNewTeam({ ...newTeam, division: parseInt(e.target.value, 10) })
              }
            />
          </label>
        </div>
        <div>
          <label>
            Wins:
            <input
              type="number"
              placeholder="Wins"
              value={newTeam.wins}
              onChange={(e) =>
                setNewTeam({ ...newTeam, wins: parseInt(e.target.value, 10) })
              }
            />
          </label>
        </div>
        <div>
          <label>
            Losses:
            <input
              type="number"
              placeholder="Losses"
              value={newTeam.losses}
              onChange={(e) =>
                setNewTeam({ ...newTeam, losses: parseInt(e.target.value, 10) })
              }
            />
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={newTeam.top_25}
              onChange={(e) => setNewTeam({ ...newTeam, top_25: e.target.checked })}
            />{" "}
            Top 25
          </label>
        </div>
        {newTeam.top_25 && (
          <div>
            <label>
              Rank:
              <input
                type="number"
                placeholder="Rank"
                value={newTeam.rank || ""}
                onChange={(e) =>
                  setNewTeam({
                    ...newTeam,
                    rank: e.target.value ? parseInt(e.target.value, 10) : null,
                  })
                }
              />
            </label>
          </div>
        )}
        <button onClick={handleAddTeam}>Add Team</button>
      </div>
    </div>
  );
};

export default Teams;
