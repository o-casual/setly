import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List, ListItem, ListItemText, Paper, TextField, Button, Select, MenuItem, FormControl, InputLabel, IconButton } from '@mui/material';
import { getSongs, addSong, updateSong, deleteSong, addSetList } from '../services/api';
import { getArtistAlbums, getAlbumTracks } from '../services/spotify';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${secs}s`;
};

const SetListEditor = () => {
  const [songs, setSongs] = useState([]);
  const [setList, setSetList] = useState([]);
  const [setName, setSetName] = useState('');
  const [setDate, setSetDate] = useState('');
  const [newSongName, setNewSongName] = useState('');
  const [newSongAlbum, setNewSongAlbum] = useState('');
  const [newSongLength, setNewSongLength] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [albumFilter, setAlbumFilter] = useState('');
  const [isNewAlbum, setIsNewAlbum] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [editingSongId, setEditingSongId] = useState(null);
  const [editingSongName, setEditingSongName] = useState('');
  const [editingSongAlbum, setEditingSongAlbum] = useState('');
  const [editingSongLength, setEditingSongLength] = useState('');

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [searchTerm, albumFilter]);

  const fetchSongs = async () => {
    try {
      const response = await getSongs();
      const fetchedSongs = response.data;

      // Filter songs based on search term and album filter
      const filteredSongs = fetchedSongs.filter(song =>
        song.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (albumFilter ? song.album === albumFilter : true)
      );

      setSongs(filteredSongs);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleAddSong = async () => {
    const album = isNewAlbum ? newAlbumName : newSongAlbum;
    const newSong = { name: newSongName, album: album, length: parseInt(newSongLength) };
    try {
      const response = await addSong(newSong);
      setSongs([...songs, response.data]);
      setNewSongName('');
      setNewSongAlbum('');
      setNewSongLength('');
      setIsNewAlbum(false);
      setNewAlbumName('');
    } catch (error) {
      console.error('Error adding song:', error);
    }
  };

  const handleEditSong = (song) => {
    setEditingSongId(song.id);
    setEditingSongName(song.name);
    setEditingSongAlbum(song.album);
    setEditingSongLength(song.length);
  };

  const handleSaveSong = async () => {
    const updatedSong = { name: editingSongName, album: editingSongAlbum, length: parseInt(editingSongLength) };
    try {
      await updateSong(editingSongId, updatedSong);
      const updatedSongs = songs.map((song) =>
        song.id === editingSongId ? { ...song, ...updatedSong } : song
      );
      setSongs(updatedSongs);
      setEditingSongId(null);
      setEditingSongName('');
      setEditingSongAlbum('');
      setEditingSongLength('');
    } catch (error) {
      console.error('Error updating song:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSongId(null);
    setEditingSongName('');
    setEditingSongAlbum('');
    setEditingSongLength('');
  };

  const handleDeleteSong = async (id) => {
    try {
      await deleteSong(id);
      setSongs(songs.filter((song) => song.id !== id));
    } catch (error) {
      console.error('Error deleting song:', error);
    }
  };

  const handleDeleteSetListSong = (index) => {
    const newSetList = Array.from(setList);
    newSetList.splice(index, 1);
    setSetList(newSetList);
  };

  const handleOnDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceItems = Array.from(source.droppableId === 'catalog' ? songs : setList);
    const destinationItems = Array.from(destination.droppableId === 'catalog' ? songs : setList);
    const [movedItem] = sourceItems.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      // Reorder within the same list
      sourceItems.splice(destination.index, 0, movedItem);

      if (source.droppableId === 'catalog') {
        setSongs(sourceItems); // Update the filtered list in state
      } else {
        setSetList(sourceItems);
      }
    } else {
      // Move to a different list
      if (destination.droppableId === 'catalog') {
        // Move item from setList to catalog
        setSetList(setList.filter(item => item.id !== movedItem.id));
        setSongs([...songs, movedItem]); // Add to catalog
      } else {
        // Move item from catalog to setList
        setSongs(songs.filter(item => item.id !== movedItem.id));
        setSetList([...setList, { ...movedItem, id: `${movedItem.id}-${Date.now()}` }]); // Add to set list
      }
    }
  };

  const handleAddSetList = async () => {
    const totalLength = setList.reduce((sum, song) => sum + song.length, 0);
    try {
      await addSetList({ name: setName, date: setDate, songs: setList, total_length: totalLength });
      setSetName('');
      setSetDate('');
      setSetList([]);
    } catch (error) {
      console.error('Error adding set list:', error);
    }
  };

  const existingAlbums = [...new Set(songs.map(song => song.album))];

  const totalSongs = setList.length;
  const totalLength = setList.reduce((sum, song) => sum + song.length, 0);

  const importFromSpotify = async () => {
    const accessToken = new URLSearchParams(window.location.search).get('access_token');
    const artistId = '0srVTNI2U8J7vytCTprEk4'; // Replace with the actual artist ID for 'These New South Whales'

    try {
      const albums = await getArtistAlbums(accessToken, artistId);
      for (const album of albums) {
        const tracks = await getAlbumTracks(accessToken, album.id);
        for (const track of tracks) {
          const newSong = { name: track.name, album: album.name, length: Math.floor(track.duration_ms / 1000) };
          const response = await addSong(newSong);
          setSongs((prevSongs) => [...prevSongs, response.data]);
        }
      }
    } catch (error) {
      console.error('Error importing from Spotify:', error);
    }
  };

  // Slice the songs array to limit to 10 items
  const displayedSongs = songs.slice(0, 10);

  return (
    <div>
      <h2>Set List Editor</h2>
      <Button onClick={importFromSpotify}>Import from Spotify</Button>
      <TextField
        label="Set List Name"
        value={setName}
        onChange={(e) => setSetName(e.target.value)}
      />
      <TextField
        label="Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={setDate}
        onChange={(e) => setSetDate(e.target.value)}
      />
      <h3>Add New Song</h3>
      <TextField
        label="Song Name"
        value={newSongName}
        onChange={(e) => setNewSongName(e.target.value)}
      />
      <FormControl>
        <InputLabel>Album</InputLabel>
        <Select
          value={isNewAlbum ? newAlbumName : newSongAlbum}
          onChange={(e) => setIsNewAlbum(e.target.value === 'new')}>
          <MenuItem value="">Select an Album</MenuItem>
          {existingAlbums.map((album, index) => (
            <MenuItem key={index} value={album}>{album}</MenuItem>
          ))}
          <MenuItem value="new">New Album</MenuItem>
        </Select>
      </FormControl>
      {isNewAlbum && (
        <TextField
          label="New Album Name"
          value={newAlbumName}
          onChange={(e) => setNewAlbumName(e.target.value)}
        />
      )}
      <TextField
        label="Length (seconds)"
        type="number"
        value={newSongLength}
        onChange={(e) => setNewSongLength(e.target.value)}
      />
      <Button onClick={handleAddSong}>Add Song</Button>
      <TextField
        label="Search Songs"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: '20px', marginBottom: '20px' }}
      />
      <FormControl>
        <InputLabel>Filter by Album</InputLabel>
        <Select
          value={albumFilter}
          onChange={(e) => setAlbumFilter(e.target.value)}
        >
          <MenuItem value="">All Albums</MenuItem>
          {existingAlbums.map((album, index) => (
            <MenuItem key={index} value={album}>{album}</MenuItem>
          ))}
        </Select>
      </FormControl>
      <div style={{ marginBottom: '20px' }}>
        <h3>Total Songs: {totalSongs}</h3>
        <h3>Total Length: {formatTime(totalLength)}</h3>
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Droppable droppableId="catalog">
            {(provided) => (
              <Paper {...provided.droppableProps} ref={provided.innerRef} style={{ margin: '0 20px', width: '45%' }}>
                <h3>Available Songs</h3>
                <List>
                  {displayedSongs.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id.toString()} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: '16px',
                            margin: '0 0 8px 0',
                            backgroundColor: '#fff',
                            color: '#000',
                            border: '1px solid #ddd',
                            ...provided.draggableProps.style,
                          }}
                        >
                          {editingSongId === song.id ? (
                            <>
                              <TextField
                                label="Song Name"
                                value={editingSongName}
                                onChange={(e) => setEditingSongName(e.target.value)}
                              />
                              <TextField
                                label="Album"
                                value={editingSongAlbum}
                                onChange={(e) => setEditingSongAlbum(e.target.value)}
                              />
                              <TextField
                                label="Length (seconds)"
                                type="number"
                                value={editingSongLength}
                                onChange={(e) => setEditingSongLength(e.target.value)}
                              />
                              <IconButton onClick={handleSaveSong}>
                                <SaveIcon />
                              </IconButton>
                              <IconButton onClick={handleCancelEdit}>
                                <CancelIcon />
                              </IconButton>
                            </>
                          ) : (
                            <>
                              <ListItemText primary={song.name} secondary={`${song.album} - ${formatTime(song.length)}`} />
                              <IconButton onClick={() => handleEditSong(song)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton onClick={() => handleDeleteSong(song.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </>
                          )}
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              </Paper>
            )}
          </Droppable>
          <Droppable droppableId="setList">
            {(provided) => (
              <Paper {...provided.droppableProps} ref={provided.innerRef} style={{ margin: '0 20px', width: '45%' }}>
                <h3>Set List</h3>
                <List>
                  {setList.map((song, index) => (
                    <Draggable key={song.id} draggableId={song.id.toString()} index={index}>
                      {(provided) => (
                        <ListItem
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: 'none',
                            padding: '16px',
                            margin: '0 0 8px 0',
                            backgroundColor: '#fff',
                            color: '#000',
                            border: '1px solid #ddd',
                            ...provided.draggableProps.style,
                          }}
                        >
                          <ListItemText primary={song.name} secondary={`${song.album} - ${formatTime(song.length)}`} />
                          <IconButton onClick={() => handleDeleteSetListSong(index)}>
                            <DeleteIcon />
                          </IconButton>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              </Paper>
            )}
          </Droppable>
        </div>
      </DragDropContext>
      <Button onClick={handleAddSetList}>Save Set List</Button>
    </div>
  );
};

export default SetListEditor;
