import axios from 'axios';

const instance = axios.create({
  baseURL: `http://192.168.1.91:8000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
