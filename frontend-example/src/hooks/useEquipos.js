import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useEquipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEquipos() {
      setLoading(true);
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://192.168.1.100:3001';
        const res = await axios.post(`${API_URL}/saveAirtable`, {
          table: 'equipos',
          action: 'list'
        });
        setEquipos(res.data.records || []);
      } catch (err) {
        setEquipos([]);
      }
      setLoading(false);
    }
    fetchEquipos();
  }, []);

  return { equipos, loading };
}
