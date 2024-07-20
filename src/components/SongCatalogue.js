import React, { useState, useEffect } from 'react';
import { getSongs, addSong, deleteSong } from '../services/api'; // Correct import path
import { Button, TextField, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';

const SongCatalogue = () => {
  const [songs, setSongs] = useState([]);
  const [newSong, setNewSong] = useState({ name: '', album: '', length: '' });

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const response = await getSongs();
    setSongs(response.data);
  };

  const handleAddSong = async () => {
    await addSong(newSong);
    setNewSong({ name: '', album: '', length: '' });
    fetchSongs();
  };

  const handleDeleteSong = async (id) => {
    await deleteSong(id);
    fetchSongs();
  };

  return (
    <div>
      <h2>Song Catalogue</h2>
      <TextField label="Name" value={newSong.name} onChange={(e) => setNewSong({ ...newSong, name: e.target.value })} />
      <TextField label="Album" value={newSong.album} onChange={(e) => setNewSong({ ...newSong, album: e.target.value })} />
      <TextField label="Length" value={newSong.length} onChange={(e) => setNewSong({ ...newSong, length: e.target.value })} />
      <Button onClick={handleAddSong}>Add Song</Button>
      <List>
        {songs.map((song) => (
          <ListItem key={song.id}>
            <ListItemText primary={song.name} secondary={`${song.album} - ${song.length}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteSong(song.id)}>
                <Delete />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default SongCatalogue;
