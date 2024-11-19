import dotenv from "dotenv";
import express from "express";
import pkg from "pg";
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


// TODO: Uncomment this after we figure out and add schema.

(async () => {
 try {
   await pool.query(`
    
   CREATE TABLE teams (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       division INT NOT NULL, 
       wins INT NOT NULL DEFAULT 0,
       losses INT NOT NULL DEFAULT 0,
       top_25 BOOLEAN, 
       rank INT,
   );

   CREATE TABLE players (
       id SERIAL PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       position VARCHAR(255),
       jersey_num INT CHECK (jersey_num BETWEEN 0 AND 99),
       height_ft REAL,
       weight_lbs REAL,
       class INT CHECK (class >= 2016),
       injured BOOLEAN DEFAULT FALSE,
       team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    );

    CREATE TABLE games (
       id SERIAL PRIMARY KEY,
       scheduled_date DATE NOT NULL, 
       location VARCHAR(255),
       home_score INT NOT NULL, 
       away_score INT NOT NULL, 
       home_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
       away_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    ); 

    CREATE TABLE statistics (
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
        game_id INT REFERENCES games(id) ON DELETE CASCADE,
    );

   `);
   console.log("Tables created successfully");
 } catch(error){
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

//app.use(
//  cors({
//    origin: process.env.FRONTEND_URL,
//    methods: ["GET", "POST", "DELETE"],
//    allowedHeaders: ["Content-Type", "Authorization"],
//  })
//);


// Endpoint to delete a record
app.delete("/delete-record/:id", async (req, res) => {
  //TODO: The record's id that we are deleting should be in the request parameters
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM table WHERE id = $1", [id]);
    res.status(200).json({ message: "Record deleted successfully" })

  } catch(err){
    console.log(err);
    res.status(500).json({ error: "Unable to delete record" })
  }
});

// Endpoint to update a record
app.post("/update-record/:id", async (req, res) => {
  //TODO: The values used to update this record should be sent in the request body
  // from a form. Make a form in the frontend
  const { id } = req.params;

});

// Endpoint to add a record
app.post("/add-record", async (req, res) => {
  try {
    const { } = req.body;

    //TODO: Add check to make sure all fields are found

    //TODO: Update this once we know the schema.

//    const result = await pool.query(
//      "INSERT INTO table (field1, field2, field3....) VALUES ($1, $2, ....) RETURNING *",
//      []
//    )

    res.status(201).json({ message: "Record added successfully" })
  } catch (err){
    console.log(err);
    res.status(500).json({ error: "Unable to add record" })
  }
});




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
