import axios from 'axios';

const instance = axios.create({
  baseURL: `http://10.75.215.241:8000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
