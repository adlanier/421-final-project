import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchTeams,
  addTeam,
  updateTeam,
  deleteTeam,
  deleteRoster,
} from "../api/api";

// Teams Component
const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [activeTeam, setActiveTeam] = useState(null);

  useEffect(() => {
    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error(err));
  }, []);

  const startEditingTeam = (team) => {
    setActiveTeam(team);
    setIsEditing(true);
  };

  const updateTeamField = (e) => {
    const { name, value } = e.target;
    setActiveTeam((prev) => ({ ...prev, [name]: value }));
  };

  const saveTeam = (e) => {
    e.preventDefault();
    if (isAdding) {
      addTeam(activeTeam)
        .then(() => fetchTeams().then((res) => setTeams(res.data.teams)))
        .catch((err) => console.error(err));
    } else {
      updateTeam(activeTeam.id, activeTeam)
        .then(() => fetchTeams().then((res) => setTeams(res.data.teams)))
        .catch((err) => console.error(err));
    }
    setIsAdding(false);
    setIsEditing(false);
  };

  const deleteExistingTeam = (id) => {
    deleteTeam(id)
      .then(() =>
        setTeams((prevTeams) => prevTeams.filter((team) => team.id !== id))
      )
      .catch((err) => console.error(err));
  };

  const startAddingTeam = () => {
    setActiveTeam({
      name: "",
      division: 1,
      wins: 0,
      losses: 0,
      top_25: false,
      rank: null,
    });
    setIsAdding(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Teams</h1>
        <div className="flex justify-end mb-6">
          <button
            onClick={startAddingTeam}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Team
          </button>
        </div>
        <TeamTable
          teams={teams}
          onEdit={startEditingTeam}
          onDelete={deleteExistingTeam}
        />
        {(isEditing || isAdding) && (
          <TeamModal
            team={activeTeam}
            onFieldChange={updateTeamField}
            onSave={saveTeam}
            onCancel={() => {
              setIsEditing(false);
              setIsAdding(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

// Team Table
const TeamTable = ({ teams, onEdit, onDelete }) => {
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
    <div className="overflow-x-auto mb-10">
      <table className="table-auto w-full bg-white shadow-lg rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-left font-medium">Division</th>
            <th className="px-4 py-2 text-left font-medium">Wins</th>
            <th className="px-4 py-2 text-left font-medium">Losses</th>
            <th className="px-4 py-2 text-left font-medium">Rank</th>
            <th className="px-4 py-2 text-right"></th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team, index) => (
            <tr
              key={team.id}
              className={`${
                index % 2 === 0 ? "bg-gray-50" : "bg-white"
              } hover:bg-gray-100`}
            >
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => onEdit(team)}
              >
                {team.name}
              </td>
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => onEdit(team)}
              >
                {team.division}
              </td>
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => onEdit(team)}
              >
                {team.wins}
              </td>
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => onEdit(team)}
              >
                {team.losses}
              </td>
              <td
                className="px-4 py-2 cursor-pointer"
                onClick={() => onEdit(team)}
              >
                {team.rank || "N/A"}
              </td>
              <td className="px-4 py-2 text-right flex space-x-2">
                <button
                  onClick={() => onDelete(team.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
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
  );
};

// Team Modal
const TeamModal = ({ team, onFieldChange, onSave, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-lg w-full">
        <h3 className="text-2xl font-bold mb-6 text-gray-700">
          {team.id ? "Edit Team" : "Add Team"}
        </h3>
        <form className="space-y-6" onSubmit={onSave}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={team.name || ""}
              onChange={onFieldChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Division
            </label>
            <input
              type="number"
              name="division"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={team.division || ""}
              onChange={onFieldChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Wins
            </label>
            <input
              type="number"
              name="wins"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={team.wins || ""}
              onChange={onFieldChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Losses
            </label>
            <input
              type="number"
              name="losses"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={team.losses || ""}
              onChange={onFieldChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rank
            </label>
            <input
              type="number"
              name="rank"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={team.rank || ""}
              onChange={onFieldChange}
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Teams;
