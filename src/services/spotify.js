import axios from 'axios';

const SPOTIFY_API_URL = 'https://api.spotify.com/v1';

export const getArtistAlbums = async (accessToken, artistId) => {
  try {
    console.log('Access Token:', accessToken); // Debug output
    console.log('Artist ID:', artistId); // Debug output

    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    const response = await axios.get(`${SPOTIFY_API_URL}/artists/${artistId}/albums`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('API Response:', response.data); // Debug output
    return response.data.items;
  } catch (error) {
    console.error('Error fetching albums:', error.response ? error.response.data : error.message);
    throw error;
  }
};

export const getAlbumTracks = async (accessToken, albumId) => {
  try {
    console.log('Access Token:', accessToken); // Debug output
    console.log('Album ID:', albumId); // Debug output

    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    const response = await axios.get(`${SPOTIFY_API_URL}/albums/${albumId}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log('API Response:', response.data); // Debug output
    return response.data.items;
  } catch (error) {
    console.error('Error fetching album tracks:', error.response ? error.response.data : error.message);
    throw error;
  }
};
