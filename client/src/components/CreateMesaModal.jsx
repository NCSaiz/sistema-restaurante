import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { X, Save, Loader } from 'lucide-react';
import { askConfirmation } from '../utils/sweetAlert';

function CreateMesaModal({ onClose, onSuccess, mesaToEdit }) {
  const token = useAuthStore(state => state.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    numero: '',
    capacidad: 4
  });

  useEffect(() => {
    if (mesaToEdit) {
      setFormData({
        numero: mesaToEdit.numero,
        capacidad: mesaToEdit.capacidad
      });
    } else {
      setFormData({
        numero: '',
        capacidad: 4
      });
    }
  }, [mesaToEdit]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mesaToEdit) {
        await axios.put(`/mesas/${mesaToEdit.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/mesas', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  };

const handleClose = async () => {
  const confirmado = await askConfirmation('¿Descartar cambios?', 'No se guardará la mesa.', 'Sí, descartar');
  if (confirmado) onClose();
};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-xl shadow-2xl w-full max-w-sm animate-fade-in">
        
        <div className="flex justify-between items-center p-4 border-b-2 border-gray-300 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">
            {mesaToEdit ? 'Editar Mesa' : 'Nueva Mesa'}
          </h2>

            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">{error}</div>}

          <div>
            <label className="block text-sm text-gray-900 font-medium mb-2">Número / Identificador</label>
            <input type="text" name="numero" required value={formData.numero} onChange={handleChange}
              placeholder="Ej: M-15"
              className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" />
          </div>

          <div>
            <label className="block text-sm text-gray-900 font-medium mb-2">Capacidad (Personas)</label>
            <input type="number" name="capacidad" required min="1" value={formData.capacidad} onChange={handleChange}
              className="w-full bg-gray-100 border-2 border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition rounded-lg"
                >
                Cancelar
            </button>
            <button type="submit" disabled={loading} className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50" style={{backgroundColor: '#9B6BA8'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#8B5A98'} onMouseLeave={(e) => e.target.style.backgroundColor = '#9B6BA8'}>
               {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateMesaModal;