import React, { useState, useEffect } from "react";
import { transferPlayer } from "../api/api";
import { fetchPlayers, fetchTeams } from "../api/api";

const TransferPlayer = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [newTeam, setNewTeam] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch players and teams on component mount
  useEffect(() => {
    fetchPlayers()
      .then((res) => setPlayers(res.data.players))
      .catch((err) => console.error("Failed to fetch players:", err));

    fetchTeams()
      .then((res) => setTeams(res.data.teams))
      .catch((err) => console.error("Failed to fetch teams:", err));
  }, []);

  const handleTransfer = () => {
    if (!selectedPlayer || !newTeam) {
      setError("Both player and new team must be selected.");
      return;
    }
  
    transferPlayer(selectedPlayer, newTeam)
      .then((response) => {
        setSuccess(response.message);
        setError("");
        // Refresh player list to reflect the updated team
        fetchPlayers()
          .then((res) => setPlayers(res.data.players))
          .catch((err) => console.error("Failed to refresh players:", err));
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Failed to transfer player.");
        setSuccess("");
      });
  };
  

  return (
    <div className="p-6 bg-base-200 min-h-screen">
      <div className="max-w-3xl mx-auto card bg-base-100 shadow-md p-6">
        <h1 className="text-2xl font-bold mb-4">Transfer Player</h1>

        {error && <div className="alert alert-error mb-4">{error}</div>}
        {success && <div className="alert alert-success mb-4">{success}</div>}

        <div className="mb-4">
          <label className="label">
            <span className="label-text">Select Player</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={selectedPlayer || ""}
            onChange={(e) => setSelectedPlayer(parseInt(e.target.value, 10))}
          >
            <option value="">-- Select Player --</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} (Current Team: {player.team_id})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="label">
            <span className="label-text">Select New Team</span>
          </label>
          <select
            className="select select-bordered w-full"
            value={newTeam || ""}
            onChange={(e) => setNewTeam(parseInt(e.target.value, 10))}
          >
            <option value="">-- Select Team --</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleTransfer}>
          Transfer Player
        </button>
      </div>
    </div>
  );
};

export default TransferPlayer;
