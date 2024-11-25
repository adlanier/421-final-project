import dotenv from "dotenv";
import express from "express";
import pkg from "pg";
import cors from "cors";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});

pool
  .connect()
  .then(() => {
    console.log("Connected to DB");
  })
  .catch(() => {
    console.log("Didn't connect");
  });

(async () => {
  try {
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 
          FROM information_schema.columns 
          WHERE table_name='players' AND column_name='height_ft'
        ) THEN
          ALTER TABLE players RENAME COLUMN height_ft TO height_inches;
        END IF;
      END $$;
    `);
    console.log("Column renamed (height_ft to height_inches).");

    await pool.query(`
    
   CREATE TABLE IF NOT EXISTS teams (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       division INT NOT NULL, 
       wins INT NOT NULL DEFAULT 0,
       losses INT NOT NULL DEFAULT 0,
       top_25 BOOLEAN, 
       rank INT
   );

   CREATE TABLE IF NOT EXISTS players (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       position VARCHAR(255),
       jersey_num INT CHECK (jersey_num BETWEEN 0 AND 99),
       height_inches REAL,
       weight_lbs REAL,
       class INT CHECK (class >= 2016),
       injured BOOLEAN DEFAULT FALSE,
       team_id INT REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS games (
       id SERIAL PRIMARY KEY,
       scheduled_date DATE NOT NULL, 
       location VARCHAR(255),
       home_score INT NOT NULL, 
       away_score INT NOT NULL, 
       home_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
       away_team_id INT REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS statistics (
        id SERIAL PRIMARY KEY,
        points INT DEFAULT 0,
        assists INT DEFAULT 0,
        rebounds INT DEFAULT 0,
        steals INT DEFAULT 0,
        blocks INT DEFAULT 0,
        minutes INT DEFAULT 0,
        fouls INT DEFAULT 0,
        turnovers INT DEFAULT 0,
        fg_pct REAL DEFAULT 0.0,
        three_p_pct REAL DEFAULT 0.0,
        ft_pct REAL DEFAULT 0.0,
        player_id INT REFERENCES players(id) ON DELETE CASCADE,
        game_id INT REFERENCES games(id) ON DELETE CASCADE
    );

   `);
    console.log("Tables created successfully");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
})();




// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080;


// Middleware
app.use(express.static("public"));
app.use(express.json());

//TODO: Uncomment once we have frontend, and add frontend URL to .env

app.use(
 cors({
   origin: process.env.FRONTEND_URL,
   methods: ["GET", "POST", "PUT", "DELETE"],
   allowedHeaders: ["Content-Type", "Authorization"],
 })
);


// Endpoint to delete a player
app.delete("/delete-player/:id", async (req, res) => {
  //TODO: The record's id that we are deleting should be in the request parameters
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM players WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.status(200).json({ message: "Player deleted successfully" })

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to delete player" })
  }
});

// Endpoint to delete a team
app.delete("/delete-team/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM teams WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Team not found" });
    }
    res.status(200).json({ message: "Team deleted successfully" })

  } catch (err) {
    console.log(err)
    res.status(500).json({ error: "Unable to delete team" })
  }
});


// Endpoint to add a team
app.post("/add-team", async (req, res) => {
  try {
    const { name, division, wins, losses, top_25, rank } = req.body;

    if (!name || !division) {
      return res.status(400).json({ error: "Name and division are required" });
    }

    if (wins < 0 || losses < 0){
      return res.status(400).json({ error: "Wins and Losses cannot be negative" });
    }

    if (wins > 40 || losses > 40 || (wins + losses) > 40){
      return res.status(400).json({ error: "A college basketball teams play no more than 40 games in a season" });
    }

    if (top_25 && (rank > 25)){
      return res.status(400).json({ error: "A team in the top 25 cannot be ranked lower than 25" });
    }
    
    if (top_25 && (rank === null || rank < 1)){
      return res.status(400).json({ error: "A team in the top 25 cannot be ranked higher than 1" });
    }

    const result = await pool.query(`
      INSERT INTO teams (name, division, wins, losses, top_25, rank)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, division, wins || 0, losses || 0, top_25 || false, rank || null]
    );

    res.status(201).json({
      message: "Team added successfully",
      team: result.rows[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to add team" })
  }
});

// Endpoint to add a player
app.post("/add-player", async (req, res) => {
  try {
    const {
      name,
      position,
      jersey_num,
      height_inches,
      weight_lbs,
      class: playerClass,
      injured,
      team_id
    } = req.body;


    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (jersey_num !== undefined && (typeof jersey_num !== 'number' || jersey_num < 0 || jersey_num > 99)) {
      return res.status(400).json({ error: "Jersey number must be an integer between 0 and 99." });
    }
    
    if (height_inches < 0 || weight_lbs < 0 ) {
      return res.status(400).json({ error: "Player height and weight cannot be negative" });
    }

    if (playerClass !== undefined && (typeof playerClass !== 'number' || playerClass < 2016)) {
      return res.status(400).json({ error: "Class must be an integer of 2016 or later." });
    }

    if (team_id !== undefined && (typeof team_id !== 'number' || team_id <= 0)) {
      return res.status(400).json({ error: "team_id must be a positive integer." });
    }

    const duplicateCheck = await pool.query(
      "SELECT * FROM players WHERE team_id = $1 AND jersey_num = $2",
      [team_id, jersey_num]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: `Jersey number ${jersey_num} is already taken by another player on this team.`,
      });
    }

    const result = await pool.query(
      `INSERT INTO players (name, position, jersey_num, height_inches, weight_lbs, class, injured, team_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        name,
        position || null,
        jersey_num !== undefined ? jersey_num : null,
        height_inches !== undefined ? height_inches : null,
        weight_lbs !== undefined ? weight_lbs : null,
        playerClass !== undefined ? playerClass : null,
        injured !== undefined ? injured : false,
        team_id !== undefined ? team_id : null
      ]
    );

    res.status(201).json({
      message: "Player added successfully",
      player: result.rows[0]
    });
  } catch (err) {
    console.log(err);

    // SQL Error code: Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id. The referenced team does not exist." });
    }
    res.status(500).json({ error: "Unable to add player" })
  }
});


app.post("/add-game", async (req, res) => {
  try {
    const {
      scheduled_date,
      location,
      home_score,
      away_score,
      home_team_id,
      away_team_id
    } = req.body;

    if (
      !scheduled_date ||
      home_score === undefined ||
      away_score === undefined ||
      !home_team_id || !away_team_id
    ) {
      return res.status(400).json({
        error: "Scheduled date, home_score, away_score, home_team_id, and away_team_id are required fields."
      });
    }

    const teamConflict = await pool.query(
      `SELECT * FROM games
       WHERE DATE(scheduled_date) = $1
       AND (home_team_id = $2 OR away_team_id = $2 OR home_team_id = $3 OR away_team_id = $3)`,
      [scheduled_date, home_team_id, away_team_id]
    );

    if (teamConflict.rows.length > 0) {
      return res.status(400).json({ error: "A team cannot be scheduled for two games on the same day." });
    }

    if (
      home_score < 0 ||
      away_score < 0
    ) {
      return res.status(400).json({
        error: "Scores cannot be negative"
      });
    }

    if (home_team_id === away_team_id) {
      return res.status(400).json({
        error: "Home and Away teams cannot be the same.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO games (scheduled_date, location, home_score, away_score, home_team_id, away_team_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        scheduled_date,
        location || null,
        home_score,
        away_score,
        home_team_id,
        away_team_id
      ]
    );

    res.status(201).json({
      message: "Game added successfully",
      game: result.rows[0]
    });

  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id. The referenced team does not exist." });
    }
    console.error("Error adding game:", err);
    res.status(500).json({ error: "Unable to add game." });
  }
});

app.delete("/delete-game/:id", async (req, res) => {
  const { id } = req.params;
  const gameId = parseInt(id, 10);
  if (isNaN(gameId) || gameId <= 0) {
    return res.status(400).json({
      error: "Invalid game ID"
    });
  }

  try {
    const result = await pool.query(
      `DELETE FROM games WHERE id = $1 RETURNING *`,
      [gameId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    res.status(200).json({
      message: "Game deleted successfully"
    });


  } catch (err) {
    console.log(err);
    return res.status(500).json({
      error: "Unable to delete game"
    });
  }
})

app.post("/add-statistic", async (req, res) => {
  try {
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
      game_id
    } = req.body;

    if (!player_id || !game_id) {
      return res.status(400).json({
        error: "player_id and game_id are required fields."
      });
    }

    if (points < 0 || assists < 0 || rebounds < 0 || steals < 0 || blocks < 0 || minutes < 0 || fouls < 0 || turnovers < 0 || fg_pct < 0 || three_p_pct < 0 || ft_pct < 0) {
      return res.status(400).json({
        error: "Player stats cannot be negative"
      });
    }

    if (fg_pct > 100 || three_p_pct > 100 || ft_pct > 100) {
      return res.status(400).json({
        error: "Player percentage stats cannot be greater than 100"
      });
    }

    if (points > 0 && fg_pct === 0 && ft_pct === 0) {
      setError("If a player has points either FG% or FT% must be greater than 0.");
      return;
    }

    if (minutes > 40) {
      return res.status(400).json({
        error: "Player minutes cannot be longer than 40 minutes"
      });
    }

    if (fouls > 5) {
      return res.status(400).json({
        error: "Player fouls out after 5 fouls"
      });
    }

    const duplicateCheck = await pool.query(
      "SELECT * FROM statistics WHERE player_id = $1 AND game_id = $2",
      [player_id, game_id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: "This player already has statistics recorded for this game.",
      });
    }

    // player - team validation
    const game = await pool.query("SELECT home_team_id, away_team_id FROM games WHERE id = $1", [game_id]);
    const player = await pool.query("SELECT team_id FROM players WHERE id = $1", [player_id]);

    if (game.rows.length === 0 || player.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid game or player selection.",
      });
    }

    const { home_team_id, away_team_id } = game.rows[0];
    const { team_id } = player.rows[0];

    if (team_id !== home_team_id && team_id !== away_team_id) {
      return res.status(400).json({
        error: "Player must belong to one of the teams playing in the game.",
      });
    }

    const result = await pool.query(`
      INSERT INTO statistics (
        points, assists, rebounds, steals, blocks, minutes, fouls, turnovers,
        fg_pct, three_p_pct, ft_pct, player_id, game_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        points !== undefined ? points : 0,
        assists !== undefined ? assists : 0,
        rebounds !== undefined ? rebounds : 0,
        steals !== undefined ? steals : 0,
        blocks !== undefined ? blocks : 0,
        minutes !== undefined ? minutes : 0,
        fouls !== undefined ? fouls : 0,
        turnovers !== undefined ? turnovers : 0,
        fg_pct !== undefined ? fg_pct : 0.0,
        three_p_pct !== undefined ? three_p_pct : 0.0,
        ft_pct !== undefined ? ft_pct : 0.0,
        player_id,
        game_id
      ]
    );

    res.status(201).json({
      message: "Statistic added successfully",
      statistic: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id or player_id. The referenced team or player does not exist." });
    }
    console.log("Error adding statistic:", err);
    res.status(500).json({ error: "Unable to add statistic." });
  }
});

app.delete("/delete-statistic/:id", async (req, res) => {
  const { id } = req.params;

  const statisticId = parseInt(id, 10);
  if (isNaN(statisticId) || statisticId <= 0) {
    return res.status(400).json({ error: "Invalid statistic id" });
  }

  try {
    const result = await pool.query(
      "DELETE FROM statistics WHERE id = $1 RETURNING *",
      [statisticId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Statistic not found." });
    }

    res.status(200).json({
      message: "Statistic deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({ error: "Unable to delete statistic" });
  }
});

// Endpoint to update a team
app.put("/update-team/:id", async (req, res) => {
  //TODO: The values used to update this record should be sent in the request body
  // from a form. Make a form in the frontend
  const { id } = req.params;
  try {
    const { name, division, wins, losses, top_25, rank } = req.body;

    if (!name || !division) {
      return res.status(400).json({ error: "Name and division are required" });
    }

    if (wins < 0 || losses < 0){
      return res.status(400).json({ error: "Wins and Losses cannot be negative" });
    }

    if (wins > 40 || losses > 40 || (wins + losses) > 40){
      return res.status(400).json({ error: "A college basketball teams play no more than 40 games in a season" });
    }

    if (top_25 && (rank > 25)){
      return res.status(400).json({ error: "A team in the top 25 cannot be ranked lower than 25" });
    }
    
    if (top_25 && (rank < 1)){
      return res.status(400).json({ error: "A team in the top 25 cannot be ranked higher than 1" });
    }
    const existingRecord = await pool.query(`
      SELECT * FROM teams WHERE id = $1
      `, [id]);

    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: "Team not found" })
    }

    const result = await pool.query(`
      UPDATE teams SET 
        name = $1,
        division = $2,
        wins = $3,
        losses = $4,
        top_25 = $5,
        rank = $6
      WHERE id = $7
      RETURNING *`, [name, division, wins, losses, top_25, rank, id])

    res.status(200).json({
      message: "Team updated successfully",
      team: result.rows[0]
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Unable to update team" })
  }

});

app.put("/update-player/:id", async (req, res) => {
  //TODO: The values used to update this record should be sent in the request body
  // from a form. Make a form in the frontend
  const { id } = req.params;
  try {
    const {
      name,
      position,
      jersey_num,
      height_inches,
      weight_lbs,
      class: playerClass,
      injured,
      team_id
    } = req.body;


    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    if (jersey_num !== undefined && (typeof jersey_num !== 'number' || jersey_num < 0 || jersey_num > 99)) {
      return res.status(400).json({ error: "Jersey number must be an integer between 0 and 99." });
    }

    if (height_inches < 0 || weight_lbs < 0 ) {
      return res.status(400).json({ error: "Player height and weight cannot be negative" });
    }

    if (playerClass !== undefined && (typeof playerClass !== 'number' || playerClass < 2016)) {
      return res.status(400).json({ error: "Class must be an integer of 2016 or later." });
    }

    if (team_id !== undefined && (typeof team_id !== 'number' || team_id <= 0)) {
      return res.status(400).json({ error: "team_id must be a positive integer." });
    }

    const duplicateCheck = await pool.query(
      "SELECT * FROM players WHERE team_id = $1 AND jersey_num = $2",
      [team_id, jersey_num]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: `Jersey number ${jersey_num} is already taken by another player on this team.`,
      });
    }

    const existingRecord = await pool.query(`
      SELECT * FROM players WHERE id = $1
      `, [id]);

    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: "player not found" })
    }

    const result = await pool.query(`
      UPDATE players
      SET 
        name = $1,
        position = $2,
        jersey_num = $3,
        height_inches = $4,
        weight_lbs = $5,
        class = $6,
        injured = $7,
        team_id = $8
      WHERE id = $9
      RETURNING *`, [name, position, jersey_num, height_inches, weight_lbs, playerClass, injured, team_id, id]);
   

    res.status(200).json({
      message: "Player updated successfully",
      team: result.rows[0]
    });
  } catch (err) {
    console.log(err);

    // SQL Error code: Foreign key violation
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id. The referenced team does not exist." });
    }
    res.status(500).json({ error: "Unable to update player" })
  }

});

app.put("/update-game/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const {
      scheduled_date,
      location,
      home_score,
      away_score,
      home_team_id,
      away_team_id
    } = req.body;

    if (
      !scheduled_date ||
      home_score === undefined ||
      away_score === undefined ||
      !home_team_id || !away_team_id
    ) {
      return res.status(400).json({
        error: "Scheduled date, home_score, away_score, home_team_id, and away_team_id are required fields."
      })
    }

    if (home_team_id === away_team_id) {
      return res.status(400).json({
        error: "Home and Away teams cannot be the same.",
      });
    }

    const teamConflict = await pool.query(
      `SELECT * FROM games
       WHERE DATE(scheduled_date) = $1
       AND (home_team_id = $2 OR away_team_id = $2 OR home_team_id = $3 OR away_team_id = $3)`,
      [scheduled_date, home_team_id, away_team_id]
    );

    if (teamConflict.rows.length > 0) {
      return res.status(400).json({ error: "A team cannot be scheduled for two games on the same day." });
    }

    if (
      home_score < 0 ||
      away_score < 0
    ) {
      return res.status(400).json({
        error: "Scores cannot be negative"
      });
    }

    const existingRecord = await pool.query(`
      SELECT * FROM games WHERE id = $1
      `, [id]);

    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: "game not found" })
    }

    const result = await pool.query(
      `
      UPDATE games
      SET
        scheduled_date = $1,
        location = $2,
        home_score = $3,
        away_score = $4,
        home_team_id = $5,
        away_team_id = $6
      WHERE id = $7
      RETURNING *;
      `,
      [
        scheduled_date,
        location,
        home_score,
        away_score,
        home_team_id,
        away_team_id,
        id
      ]
    );
    

    res.status(200).json({
      message: "Game updated successfully",
      game: result.rows[0]
    });

  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id. The referenced team does not exist." });
    }
    console.error("Error updating game:", err);
    res.status(500).json({ error: "Unable to update game." });
  }
});

app.put("/update-statistic/:id", async (req, res) => {
  const { id } = req.params;
  try {
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
      game_id
    } = req.body;

    if (!player_id || !game_id) {
      return res.status(400).json({
        error: "player_id and game_id are required fields."
      });
    }

    if (points < 0 || assists < 0 || rebounds < 0 || steals < 0 || blocks < 0 || minutes < 0 || fouls < 0 || turnovers < 0 || fg_pct < 0 || three_p_pct < 0 || ft_pct < 0) {
      return res.status(400).json({
        error: "Player stats cannot be negative"
      });
    }

    if (fg_pct > 100 || three_p_pct > 100 || ft_pct > 100) {
      return res.status(400).json({
        error: "Player percentage stats cannot be greater than 100"
      });
    }

    if (points > 0 && fg_pct === 0 && ft_pct === 0) {
      setError("If a player has points either FG% or FT% must be greater than 0.");
      return;
    }

    if (minutes > 40) {
      return res.status(400).json({
        error: "Player minutes cannot be longer than 40 minutes"
      });
    }

    if (fouls > 5) {
      return res.status(400).json({
        error: "Player fouls out after 5 fouls"
      });
    }

    const duplicateCheck = await pool.query(
      "SELECT * FROM statistics WHERE player_id = $1 AND game_id = $2",
      [player_id, game_id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({
        error: "This player already has statistics recorded for this game.",
      });
    }

    // player - team validation
    const game = await pool.query("SELECT home_team_id, away_team_id FROM games WHERE id = $1", [game_id]);
    const player = await pool.query("SELECT team_id FROM players WHERE id = $1", [player_id]);

    if (game.rows.length === 0 || player.rows.length === 0) {
      return res.status(400).json({
        error: "Invalid game or player selection.",
      });
    }

    const { home_team_id, away_team_id } = game.rows[0];
    const { team_id } = player.rows[0];

    if (team_id !== home_team_id && team_id !== away_team_id) {
      return res.status(400).json({
        error: "Player must belong to one of the teams playing in the game.",
      });
    }

    const existingRecord = await pool.query(`
      SELECT * FROM statistics WHERE id = $1
      `, [id]);

    if (existingRecord.rows.length === 0) {
      return res.status(404).json({ error: "statistic not found" })
    }

    const result = await pool.query(`
      UPDATE statistics
      SET
        points = $1,
        assists = $2,
        rebounds = $3,
        steals = $4,
        blocks = $5,
        minutes = $6,
        fouls = $7,
        turnovers = $8,
        fg_pct = $9,
        three_p_pct = $10,
        ft_pct = $11,
        player_id = $12,
        game_id = $13
      WHERE id = $14
      RETURNING *;
    `, [
      points !== undefined ? points : 0,
      assists !== undefined ? assists : 0,
      rebounds !== undefined ? rebounds : 0,
      steals !== undefined ? steals : 0,
      blocks !== undefined ? blocks : 0,
      minutes !== undefined ? minutes : 0,
      fouls !== undefined ? fouls : 0,
      turnovers !== undefined ? turnovers : 0,
      fg_pct !== undefined ? fg_pct : 0.0,
      three_p_pct !== undefined ? three_p_pct : 0.0,
      ft_pct !== undefined ? ft_pct : 0.0,
      player_id,
      game_id,
      id
    ]);
    

    res.status(200).json({
      message: "Statistic updated successfully",
      statistic: result.rows[0]
    });
  } catch (err) {
    if (err.code === '23503') {
      return res.status(400).json({ error: "Invalid team_id or player_id. The referenced team or player does not exist." });
    }
    console.log("Error updating statistic:", err);
    res.status(500).json({ error: "Unable to update statistic." });
  }
});

app.get("/get-games", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM games`)
    res.status(200).json({ games: result.rows })

  } catch (err) {
    console.log("Error get games:", err);
    res.status(500).json({ error: "Unable to get games." });
  }
})

app.get("/get-players", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM players`)
    res.status(200).json({ players: result.rows })

  } catch (err) {
    console.log("Error get players:", err);
    res.status(500).json({ error: "Unable to get players." });
  }
})

app.get("/get-teams", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM teams`)
    res.status(200).json({ teams: result.rows })

  } catch (err) {
    console.log("Error get teams:", err);
    res.status(500).json({ error: "Unable to get teams." });
  }
})

app.get("/get-statistics", async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM statistics`)
    res.status(200).json({ statistics: result.rows })

  } catch (err) {
    console.log("Error get statistics:", err);
    res.status(500).json({ error: "Unable to get statistics." });
  }
})


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`http://localhost:${PORT}/`)
})
