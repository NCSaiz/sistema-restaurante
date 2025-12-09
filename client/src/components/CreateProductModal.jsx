import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { X, Save, Loader } from 'lucide-react';
import { askConfirmation } from '../utils/sweetAlert';

function CreateProductModal({ onClose, onSuccess, productToEdit }) {
  const token = useAuthStore(state => state.token);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    categoria: 'plato_fondo',
    estacion: 'cocina_caliente',
    disponible: true
  });

 useEffect(() => {
    if (productToEdit) {
      setFormData({
        nombre: productToEdit.nombre,
        precio: productToEdit.precio,
        categoria: productToEdit.categoria,
        estacion: productToEdit.estacion,
        disponible: productToEdit.disponible
      });
    } else {
      setFormData({
        nombre: '',
        precio: '',
        categoria: 'plato_fondo',
        estacion: 'cocina_caliente',
        disponible: true
      });
    }
  }, [productToEdit]);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (productToEdit) {
        await axios.put(`/productos/${productToEdit.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/productos', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError('Error al guardar producto');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = async () => {
  const confirmado = await askConfirmation('¿Cerrar formulario?', 'Perderás los datos del plato.', 'Sí, cerrar');
  if (confirmado) onClose();
};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-300 rounded-xl shadow-2xl w-full max-w-lg animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b-2 border-gray-300 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900">{productToEdit ? 'Editar Plato' : 'Nuevo Plato'}</h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
            </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="text-red-600 bg-red-50 p-3 rounded border border-red-200">{error}</div>}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm text-gray-900 font-medium mb-2">Nombre del Plato</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full bg-gray-100 rounded px-3 py-2 text-gray-900 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" placeholder="Ej: Lomo Saltado" />
            </div>

            <div>
              <label className="block text-sm text-gray-900 font-medium mb-2">Precio ($)</label>
              <input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="w-full bg-gray-100 rounded px-3 py-2 text-gray-900 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition" placeholder="8500" />
            </div>

            <div>
              <label className="block text-sm text-gray-900 font-medium mb-2">Categoría</label>
              <select name="categoria" value={formData.categoria} onChange={handleChange} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-900 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition">
                <option value="plato_fondo">Plato de Fondo</option>
                <option value="bebida">Bebida / Trago</option>
                <option value="postre">Postre</option>
                <option value="entrada">Entrada</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-900 font-medium mb-2">Estación (¿Quién lo prepara?)</label>
              <select name="estacion" value={formData.estacion} onChange={handleChange} className="w-full bg-gray-100 rounded px-3 py-2 text-gray-900 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition">
                <option value="cocina_caliente">Cocina Caliente (Chef)</option>
                <option value="cocina_fria">Cocina Fría (Entradas)</option>
                <option value="barra">Barra (Bebidas)</option>
                <option value="postres">Estación Postres</option>
              </select>
            </div>

            {productToEdit && (
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" name="disponible" checked={formData.disponible} onChange={handleChange} className="w-4 h-4 border-2 border-gray-300 rounded" />
                <label className="text-sm text-gray-700">Disponible (Stock)</label>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition rounded-lg"
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition disabled:opacity-50" style={{backgroundColor: '#9B6BA8'}} onMouseEnter={(e) => e.target.style.backgroundColor = '#8B5A98'} onMouseLeave={(e) => e.target.style.backgroundColor = '#9B6BA8'}>
              {loading ? <Loader className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />} Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProductModal;