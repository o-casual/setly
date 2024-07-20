import React, { useEffect, useState } from 'react';
import SetListEditor from './components/SetListEditor';
import SetListHistory from './components/SetListHistory';
import ViewSetList from './components/ViewSetList';
import EditSetList from './components/EditSetList';
import { Button } from '@mui/material';
import axios from 'axios';

// Define the URL for initiating authentication
const AUTH_URL = 'http://localhost:5001/login';

const App = () => {
  const [currentView, setCurrentView] = useState('editor');
  const [selectedSetListId, setSelectedSetListId] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Function to parse URL parameters
    const getQueryParams = (url) => {
      const params = new URLSearchParams(new URL(url).search);
      return {
        access_token: params.get('access_token'),
        code: params.get('code')
      };
    };

    // Extract token from URL if present
    const queryParams = getQueryParams(window.location.href);
    if (queryParams.code) {
      // Send the authorization code to the backend
      axios.get(`http://localhost:5001/callback?code=${queryParams.code}`)
        .then(response => {
          // Handle successful response
          setAccessToken(response.data.access_token);
        })
        .catch(error => {
          console.error('Error fetching access token:', error);
        });
    }
  }, []);

  const handleSelectSetList = (id) => {
    setSelectedSetListId(id);
    setCurrentView('viewSetList');
  };

  const handleEditSetList = (id) => {
    setSelectedSetListId(id);
    setCurrentView('editSetList');
  };

  const handleBackToHistory = () => {
    setCurrentView('history');
  };

  const handleBackToEditor = () => {
    setCurrentView('editor');
  };

  // Function to handle authentication
  const handleLogin = () => {
    window.location.href = AUTH_URL;
  };

  return (
    <div>
      {currentView === 'editor' && (
        <>
          <SetListEditor />
          <Button onClick={handleLogin} style={{ marginTop: '20px' }}>
            Login with Spotify
          </Button>
        </>
      )}
      {currentView === 'history' && <SetListHistory onSelectSetList={handleSelectSetList} onEditSetList={handleEditSetList} />}
      {currentView === 'viewSetList' && <ViewSetList setListId={selectedSetListId} onBack={handleBackToHistory} />}
      {currentView === 'editSetList' && <EditSetList setListId={selectedSetListId} onBack={handleBackToHistory} />}
      {currentView !== 'editor' && (
        <Button onClick={handleBackToEditor} style={{ marginTop: '20px' }}>
          Back to Set List Editor
        </Button>
      )}
      {currentView === 'editor' && (
        <Button onClick={handleBackToHistory} style={{ marginTop: '20px' }}>
          View Historical Set Lists
        </Button>
      )}
    </div>
  );
};

export default App;
