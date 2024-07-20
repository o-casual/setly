const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5001;

const client_id = '958bf0aa148f4c649bf68c980b539203';
const client_secret = '943d91787b97491d8912dcc15d6ce85d';
const redirect_uri = 'http://localhost:3000/callback';

app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send('Server is running');
});

// Spotify login route
app.get('/login', (req, res) => {
  const scope = 'user-library-read';
  const authUrl = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
    });

  // Console logs for debugging
  console.log('Login route triggered');
  console.log('Authorization URL:', authUrl);

  res.redirect(authUrl);
});

// Spotify callback route
app.get('/callback', async (req, res) => {
  console.log('Callback route triggered');
  console.log('Query params:', req.query);

  const code = req.query.code;
  if (!code) {
    return res.status(400).send('Missing authorization code');
  }

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: querystring.stringify({
      code: code,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    })
  };

  try {
    const response = await axios(authOptions);
    const access_token = response.data.access_token;
    console.log('Access token:', access_token);
    // Redirect to frontend with access token
    res.redirect(`http://localhost:3000?access_token=${access_token}`);
  } catch (error) {
    console.error('Failed to fetch access token:', error.response?.data || error.message);
    res.status(error.response?.status || 500).send('Failed to authenticate');
  }
});

// API Routes for Songs and Set Lists
let songs = [
  { id: 1, name: 'Song1', album: 'Album1', length: 200 },
  { id: 2, name: 'Song2', album: 'Album2', length: 180 },
];

let setLists = [
  { id: 1, name: 'SetList1', date: '2024-01-01', songs: [1, 2], total_length: 380 },
];

app.get('/songs', (req, res) => {
  res.json(songs);
});

app.post('/songs', (req, res) => {
  const newSong = { ...req.body, id: songs.length + 1 };
  songs.push(newSong);
  res.status(201).json(newSong);
});

app.put('/songs/:id', (req, res) => {
  const songId = parseInt(req.params.id, 10);
  const songIndex = songs.findIndex(song => song.id === songId);
  if (songIndex !== -1) {
    songs[songIndex] = { ...req.body, id: songId };
    res.json(songs[songIndex]);
  } else {
    res.status(404).json({ error: 'Song not found' });
  }
});

app.delete('/songs/:id', (req, res) => {
  const songId = parseInt(req.params.id, 10);
  songs = songs.filter(song => song.id !== songId);
  res.status(204).send();
});

app.get('/setlists', (req, res) => {
  res.json(setLists);
});

app.get('/setlists/:id', (req, res) => {
  const setListId = parseInt(req.params.id, 10);
  const setList = setLists.find(setList => setList.id === setListId);
  if (setList) {
    res.json(setList);
  } else {
    res.status(404).json({ error: 'Set list not found' });
  }
});

app.post('/setlists', (req, res) => {
  const newSetList = { ...req.body, id: setLists.length + 1 };
  setLists.push(newSetList);
  res.status(201).json(newSetList);
});

app.put('/setlists/:id', (req, res) => {
  const setListId = parseInt(req.params.id, 10);
  const setListIndex = setLists.findIndex(setList => setList.id === setListId);
  if (setListIndex !== -1) {
    setLists[setListIndex] = { ...req.body, id: setListId };
    res.json(setLists[setListIndex]);
  } else {
    res.status(404).json({ error: 'Set list not found' });
  }
});

app.delete('/setlists/:id', (req, res) => {
  const setListId = parseInt(req.params.id, 10);
  setLists = setLists.filter(setList => setList.id !== setListId);
  res.status(204).send();
});

// Add this new endpoint for duplicating a set list
app.post('/setlists/:id/duplicate', (req, res) => {
  const setListId = parseInt(req.params.id, 10);
  const setListToDuplicate = setLists.find(setList => setList.id === setListId);

  if (!setListToDuplicate) {
    return res.status(404).json({ error: 'Set list not found' });
  }

  // Create a copy of the set list
  const duplicatedSetList = {
    ...setListToDuplicate,
    id: setLists.length + 1, // Generate a new ID
    name: `${setListToDuplicate.name} (Copy)`, // Modify name to indicate it's a copy
  };

  setLists.push(duplicatedSetList);
  res.status(201).json(duplicatedSetList);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
