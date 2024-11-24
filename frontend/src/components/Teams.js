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
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">Teams</h1>
        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <div>
              <span>{error}</span>
            </div>
          </div>
        )}

        <ul className="space-y-4">
          {teams.map((team) =>
            editMode === team.id ? (
              <li key={team.id} className="card bg-base-100 shadow-md p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">
                      <span className="label-text">Name</span>
                    </label>
                    <input
                      className="input input-bordered"
                      type="text"
                      value={team.name || ""}
                      onChange={(e) =>
                        setTeams((prev) =>
                          prev.map((t) =>
                            t.id === team.id
                              ? { ...t, name: e.target.value }
                              : t
                          )
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Division</span>
                    </label>
                    <input
                      className="input input-bordered"
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
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Wins</span>
                    </label>
                    <input
                      className="input input-bordered"
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
                  </div>
                  <div>
                    <label className="label">
                      <span className="label-text">Losses</span>
                    </label>
                    <input
                      className="input input-bordered"
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
                  </div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="checkbox"
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
                    />
                    <span>Top 25</span>
                  </label>
                  {team.top_25 && (
                    <div>
                      <label className="label">
                        <span className="label-text">Rank</span>
                      </label>
                      <input
                        className="input input-bordered"
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
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    className="btn btn-success"
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
                  <button
                    className="btn btn-outline"
                    onClick={() => setEditMode(null)}
                  >
                    Cancel
                  </button>
                </div>
              </li>
            ) : (
              <li key={team.id} className="card bg-base-100 shadow-md p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold">{team.name}</h3>
                    <p>
                      Division {team.division} - Wins: {team.wins}, Losses:{" "}
                      {team.losses}{" "}
                      {team.top_25 && (
                        <span className="badge badge-secondary">
                          Rank: {team.rank}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => setEditMode(team.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDeleteTeam(team.id)}
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
          <h3 className="text-xl font-bold mb-4">Add a New Team</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Name</span>
              </label>
              <input
                className="input input-bordered"
                type="text"
                placeholder="Name"
                value={newTeam.name}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, name: e.target.value })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Division</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Division"
                value={newTeam.division}
                onChange={(e) =>
                  setNewTeam({
                    ...newTeam,
                    division: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Wins</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Wins"
                value={newTeam.wins}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, wins: parseInt(e.target.value, 10) })
                }
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text">Losses</span>
              </label>
              <input
                className="input input-bordered"
                type="number"
                placeholder="Losses"
                value={newTeam.losses}
                onChange={(e) =>
                  setNewTeam({
                    ...newTeam,
                    losses: parseInt(e.target.value, 10),
                  })
                }
              />
            </div>
            <label className="flex items-center space-x-2 col-span-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={newTeam.top_25}
                onChange={(e) =>
                  setNewTeam({ ...newTeam, top_25: e.target.checked })
                }
              />
              <span>Top 25</span>
            </label>
            {newTeam.top_25 && (
              <div>
                <label className="label">
                  <span className="label-text">Rank</span>
                </label>
                <input
                  className="input input-bordered"
                  type="number"
                  placeholder="Rank"
                  value={newTeam.rank || ""}
                  onChange={(e) =>
                    setNewTeam({
                      ...newTeam,
                      rank: e.target.value
                        ? parseInt(e.target.value, 10)
                        : null,
                    })
                  }
                />
              </div>
            )}
          </div>
          <button className="btn btn-primary mt-4" onClick={handleAddTeam}>
            Add Team
          </button>
        </div>
      </div>
    </div>
  );
};

export default Teams;
