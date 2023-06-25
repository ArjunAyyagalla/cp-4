const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at port 3002");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertIntoResponse = (each) => {
  return {
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY player_id asc;`;
  const playerArray = await db.all(getPlayersQuery);
  response.send(playerArray.map((each) => convertIntoResponse(each)));
});

app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const addPlayersDetails = `
    INSERT INTO 
    cricket_team
    (player_name, jersey_number, role)
    VALUES
    ('${playerName}',${jerseyNumber},'${role}' );`;
  await db.run(addPlayersDetails);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const searchDetails = `
    SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId};`;
  const player = await db.get(searchDetails);
  response.send(convertIntoResponse(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatePlayersDetails = `
  UPDATE
  cricket_team
  SET
  player_name='${playerName}',
  jersey_number= ${jerseyNumber},
  role= '${role}'
  WHERE player_id=${playerId}`;

  await db.run(updatePlayersDetails);
  response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteDetails = `
   DELETE FROM
   cricket_team
   WHERE 
   player_id = ${playerId};`;
  await db.run(deleteDetails);
  response.send("Player Removed");
});

module.exports = app;
