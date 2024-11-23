import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Teams API
export const fetchTeams = () => axios.get(`${API_BASE_URL}/get-teams`);
export const addTeam = (teamData) =>
  axios.post(`${API_BASE_URL}/add-team`, teamData);
export const deleteTeam = (teamId) =>
  axios.delete(`${API_BASE_URL}/delete-team/${teamId}`);
export const updateTeam = (teamId, teamData) =>
  axios.put(`${API_BASE_URL}/update-team/${teamId}`, teamData);

// Players API
export const fetchPlayers = () => axios.get(`${API_BASE_URL}/get-players`);
export const addPlayer = (playerData) =>
  axios.post(`${API_BASE_URL}/add-player`, playerData);
export const deletePlayer = (playerId) =>
  axios.delete(`${API_BASE_URL}/delete-player/${playerId}`);
export const updatePlayer = (playerId, playerData) =>
  axios.put(`${API_BASE_URL}/update-player/${playerId}`, playerData);

// Games API
export const fetchGames = () => axios.get(`${API_BASE_URL}/get-games`);
export const addGame = (gameData) =>
  axios.post(`${API_BASE_URL}/add-game`, gameData);
export const deleteGame = (gameId) =>
  axios.delete(`${API_BASE_URL}/delete-game/${gameId}`);
export const updateGame = (gameId, gameData) =>
  axios.put(`${API_BASE_URL}/update-game/${gameId}`, gameData);

// Statistics API
export const fetchStatistics = () => axios.get(`${API_BASE_URL}/get-statistics`);
export const addStatistic = (statData) =>
  axios.post(`${API_BASE_URL}/add-statistic`, statData);
export const deleteStatistic = (statId) =>
  axios.delete(`${API_BASE_URL}/delete-statistic/${statId}`);
export const updateStatistic = (statId, statData) =>
  axios.put(`${API_BASE_URL}/update-statistic/${statId}`, statData);
