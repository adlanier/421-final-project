import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchTeams, addTeam, deleteTeam, deleteRoster } from "../api/api";

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
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const handleAddTeam = () => {
    const { name, division, wins, losses, rank, top_25 } = newTeam;

    if (!name || !division) {
      setError("Name and Division are required fields.");
      return;
    }

    if (wins < 0 || losses < 0) {
      setError("Wins and Losses cannot be negative.");
      return;
    }

    if (wins + losses > 40) {
      setError(
        "A college basketball team cannot play more than 40 games in a season."
      );
      return;
    }

    if (top_25 && (rank === null || rank < 1 || rank > 25)) {
      setError("Rank must be between 1 and 25 if the team is in the Top 25.");
      return;
    }

    setError("");
    addTeam(newTeam)
      .then(() => fetchTeams().then((res) => setTeams(res.data.teams)))
      .catch((err) => console.error(err));
  };

  const handleDeleteTeam = (id) => {
    deleteTeam(id)
      .then(() =>
        setTeams((prevTeams) => prevTeams.filter((team) => team.id !== id))
      )
      .catch((err) => console.error(err));
  };

  const handleDeleteRoster = (id) => {
    deleteRoster(id)
      .then(() => {
        toast.success(`Roster for team ${id} has been deleted successfully.`);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to delete the roster. Please try again.");
      });
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

        <div className="overflow-x-auto mb-6">
          <table className="table w-full bg-white shadow-md rounded-lg">
            <thead className="bg-gray-100 text-gray-600 uppercase text-sm">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Division</th>
                <th className="py-2 px-4 text-left">Wins</th>
                <th className="py-2 px-4 text-left">Losses</th>
                <th className="py-2 px-4 text-left">Top 25</th>
                <th className="py-2 px-4 text-left">Rank</th>
                <th className="py-2 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team, index) => (
                <tr
                  key={team.id}
                  className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}
                >
                  <td className="py-2 px-4">{team.name}</td>
                  <td className="py-2 px-4">{team.division}</td>
                  <td className="py-2 px-4">{team.wins}</td>
                  <td className="py-2 px-4">{team.losses}</td>
                  <td className="py-2 px-4">{team.top_25 ? "Yes" : "No"}</td>
                  <td className="py-2 px-4">{team.rank || "N/A"}</td>
                  <td className="py-2 px-4 flex space-x-2 items-center">
                    <button
                      className="btn btn-ghost btn-xs text-red-500"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.136 21H7.864a2 2 0 01-1.997-1.858L5 7m5 4v6m4-6v6M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"
                        />
                      </svg>
                    </button>
                    <button
                      className="btn btn-xs btn-error"
                      onClick={() => handleDeleteRoster(team.id)}
                    >
                      Delete Roster
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card bg-base-100 shadow-md p-6">
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
