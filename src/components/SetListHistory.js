import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Button, IconButton, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; // Updated import
import { getSetLists, deleteSetList, duplicateSetList } from '../services/api'; // Make sure to include duplicateSetList in the service file

const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours > 0 ? hours + 'h ' : ''}${minutes}m ${secs}s`;
};

const SetListHistory = ({ onSelectSetList, onEditSetList }) => {
  const [setLists, setSetLists] = useState([]);

  useEffect(() => {
    fetchSetLists();
  }, []);

  const fetchSetLists = async () => {
    try {
      const response = await getSetLists();
      setSetLists(response.data);
    } catch (error) {
      console.error('Error fetching set lists:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteSetList(id);
      fetchSetLists(); // Refresh the list
    } catch (error) {
      console.error('Error deleting set list:', error);
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await duplicateSetList(id); // Call to API for duplicating set list
      fetchSetLists(); // Refresh the list
    } catch (error) {
      console.error('Error duplicating set list:', error);
    }
  };

  return (
    <Paper style={{ margin: '20px', padding: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Historical Set Lists
      </Typography>
      <List>
        {setLists.map((setList) => (
          <ListItem key={setList.id}>
            <ListItemText
              primary={setList.name}
              secondary={`${setList.date} - ${setList.songs.length} songs, Total Length: ${formatTime(setList.total_length)}`}
            />
            <Button onClick={() => onSelectSetList(setList.id)} style={{ marginRight: '8px' }}>
              View
            </Button>
            <Button onClick={() => onEditSetList(setList.id)} style={{ marginRight: '8px' }}>
              Edit
            </Button>
            <IconButton edge="end" aria-label="duplicate" onClick={() => handleDuplicate(setList.id)}>
              <ContentCopyIcon />
            </IconButton>
            <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(setList.id)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default SetListHistory;
