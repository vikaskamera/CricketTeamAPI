const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('Server running at http://localhost:3000')
    })
  } catch (error) {
    console.log('DB error: ' + error.message)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDBObjectToResponseObj = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// Get Players API
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `
        SELECT 
            *
        FROM 
            cricket_team
        ORDER BY
            player_id;
    `

  const players = await db.all(getPlayersQuery)
  response.send(
    players.map(eachObject => convertDBObjectToResponseObj(eachObject)),
  )
})

// Add Player API
app.post('/players/', async (request, response) => {
  const player = request.body
  const {playerName, jerseyNumber, role} = player

  const addPlayerQuery = `
    INSERT INTO
      cricket_team (player_name, jersey_number, role)
    VALUES (
      '${playerName}',
      ${jerseyNumber},
      '${role}'
    );`

  const dbResponse = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

// Get player API
app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params

  const getPlayerQuery = `
    SELECT 
      *
    FROM 
      cricket_team
    WHERE 
      player_id=${playerId}
  `

  const player = await db.get(getPlayerQuery)
  response.send(convertDBObjectToResponseObj(player))
})

// Update player API
app.put('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const player = request.body
  const {playerName, jerseyNumber, role} = player

  const updatePlayerQuery = `
    UPDATE 
      cricket_team
    SET 
      player_name='${playerName}',
      jersey_number=${jerseyNumber},
      role='${role}'
    WHERE 
      player_id=${playerId}`

  const dbResponse = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

// Delete player API
app.delete('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
    DELETE FROM
      cricket_team
    WHERE 
      player_id=${playerId}`

  const dbResponse = await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
