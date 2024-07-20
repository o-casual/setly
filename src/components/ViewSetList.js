import React, { useState, useEffect } from 'react';
import { List, ListItem, ListItemText, Paper, Button } from '@mui/material';
import { getSetListById } from '../services/api';

const ViewSetList = ({ setListId, onBack }) => {
  const [setList, setSetList] = useState(null);

  useEffect(() => {
    fetchSetList();
  }, [setListId]);

  const fetchSetList = async () => {
    try {
      const response = await getSetListById(setListId);
      setSetList(response.data);
    } catch (error) {
      console.error('Error fetching set list:', error);
    }
  };

  if (!setList) return <div>Loading...</div>;

  return (
    <Paper style={{ margin: '20px', padding: '20px' }}>
      <h3>{setList.name}</h3>
      <p>{setList.date}</p>
      <List>
        {setList.songs.map((song, index) => (
          <ListItem key={index}>
            <ListItemText primary={song.name} secondary={`${song.album} - ${song.length}`} />
          </ListItem>
        ))}
      </List>
      <Button onClick={onBack}>Back to Set List History</Button>
    </Paper>
  );
};

export default ViewSetList;
