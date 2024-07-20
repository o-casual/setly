import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { List, ListItem, ListItemText, Paper, TextField, Button } from '@mui/material';
import { getSetListById, updateSetList } from '../services/api';

const EditSetList = ({ setListId, onBack }) => {
  const [setList, setSetList] = useState(null);
  const [setName, setSetName] = useState('');
  const [setDate, setSetDate] = useState('');

  useEffect(() => {
    fetchSetList();
  }, [setListId]);

  const fetchSetList = async () => {
    try {
      const response = await getSetListById(setListId);
      setSetList(response.data);
      setSetName(response.data.name);
      setSetDate(response.data.date);
    } catch (error) {
      console.error('Error fetching set list:', error);
    }
  };

  const handleOnDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(setList.songs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSetList({ ...setList, songs: items });
  };

  const handleUpdateSetList = async () => {
    const updatedSetList = { ...setList, name: setName, date: setDate };
    try {
      await updateSetList(setListId, updatedSetList);
      onBack(); // Go back to the previous view
    } catch (error) {
      console.error('Error updating set list:', error);
    }
  };

  if (!setList) return <div>Loading...</div>;

  return (
    <Paper style={{ margin: '20px', padding: '20px' }}>
      <h3>Edit Set List</h3>
      <TextField
        label="Set List Name"
        value={setName}
        onChange={(e) => setSetName(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <TextField
        label="Date"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={setDate}
        onChange={(e) => setSetDate(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="setList">
          {(provided) => (
            <List {...provided.droppableProps} ref={provided.innerRef} style={{ marginBottom: '20px' }}>
              {setList.songs.map((song, index) => (
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
                      <ListItemText primary={song.name} secondary={`${song.album} - ${song.length}`} />
                    </ListItem>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <Button onClick={handleUpdateSetList} style={{ marginRight: '10px' }}>Save</Button>
      <Button onClick={onBack}>Back</Button>
    </Paper>
  );
};

export default EditSetList;
