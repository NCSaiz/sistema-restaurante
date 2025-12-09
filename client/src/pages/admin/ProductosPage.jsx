import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Edit, Utensils, Wine } from 'lucide-react';
import CreateProductModal from '../../components/CreateProductModal';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';

function ProductosPage() {
  const [productos, setProductos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [prodToEdit, setProdToEdit] = useState(null);
  const token = useAuthStore(state => state.token);

  const fetchProductos = async () => {
    try {
      const res = await axios.get('/productos', { headers: { Authorization: `Bearer ${token}` } });
      setProductos(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchProductos(); }, []);

const handleDelete = async (id, nombre) => {
  const confirmado = await askConfirmation(
    `¿Eliminar "${nombre}"?`,
    "Se borrará del menú y los garzones no podrán pedirlo.",
    "Sí, borrar plato"
  );

  if (confirmado) {
    try {
      await axios.delete(`/productos/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showSuccess('Producto eliminado');
      fetchProductos();
    } catch (error) { 
      showError('Error', 'No se pudo eliminar el producto.'); 
    }
  }
};

  // Función auxiliar para formatear precio chileno
  const formatMoney = (amount) => {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  };

  // Función para obtener color de categoría
  const getCategoryColor = (categoria) => {
    const colors = {
      'bebida': { bg: 'rgba(27, 179, 200, 0.1)', border: '#1BB3C8', text: '#1BB3C8' },
      'plato_fondo': { bg: 'rgba(182, 70, 42, 0.1)', border: '#B6462A', text: '#B6462A' },
      'postre': { bg: 'rgba(241, 139, 168, 0.1)', border: '#F18BA8', text: '#F18BA8' }
    };
    return colors[categoria] || { bg: 'rgba(200, 200, 200, 0.1)', border: '#cccccc', text: '#333333' };
  };

  // Función para obtener color de estación
  const getStationColor = (estacion) => {
    const colors = {
      'barra': { bg: 'rgba(108, 58, 168, 0.1)', border: '#6C3AA8', text: '#6C3AA8' },
      'cocina_fria': { bg: 'rgba(20, 95, 122, 0.1)', border: '#145F7A', text: '#145F7A' },
      'cocina_caliente': { bg: 'rgba(232, 85, 62, 0.1)', border: '#E8553E', text: '#E8553E' }
    };
    return colors[estacion] || { bg: 'rgba(200, 200, 200, 0.1)', border: '#cccccc', text: '#333333' };
  };

  return (
    <div className="text-gray-900" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menú y Productos</h1>
            <p className="text-gray-600">Gestiona la carta del restaurante</p>
          </div>
          <button onClick={() => { setProdToEdit(null); setShowModal(true); }} 
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#9B6BA8' }}>
            <Plus className="w-5 h-5" /> Nuevo Plato
          </button>
        </div>

        <div className="rounded-xl border overflow-hidden shadow-xl" style={{ borderColor: '#e0e0e0', backgroundColor: 'white' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', color: '#666666' }} className="text-sm uppercase">
                  <th className="px-6 py-4">Nombre</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4">Estación</th>
                  <th className="px-6 py-4">Precio</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: '#e0e0e0' }}>
                {productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors" style={{ color: '#333333' }}>
                    <td className="px-6 py-4 font-medium">{prod.nombre}</td>
                    <td className="px-6 py-4">
                      {(() => {
                        const color = getCategoryColor(prod.categoria);
                        return (
                          <span className="px-2 py-1 rounded text-xs font-medium border capitalize" style={{
                            backgroundColor: color.bg,
                            color: color.text,
                            borderColor: color.border
                          }}>
                            {prod.categoria.replace('_', ' ').toUpperCase()}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4">
                      {(() => {
                        const color = getStationColor(prod.estacion);
                        return (
                          <span className="px-2 py-1 rounded text-xs font-medium border capitalize" style={{
                            backgroundColor: color.bg,
                            color: color.text,
                            borderColor: color.border
                          }}>
                            {prod.estacion.replace('_', ' ').toUpperCase()}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 font-bold" style={{ color: '#22C55E' }}>{formatMoney(prod.precio)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setProdToEdit(prod); setShowModal(true); }} 
                          className="p-2 rounded-lg text-gray-700 transition"
                          style={{ backgroundColor: '#f0f0f0', color: '#666666' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}>
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prod.id, prod.nombre)} 
                          className="p-2 rounded-lg text-red-600 transition"
                          style={{ backgroundColor: '#ffe0e0' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#ffc0c0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#ffe0e0'}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <CreateProductModal onClose={() => setShowModal(false)} onSuccess={fetchProductos} productToEdit={prodToEdit} />
        )}
      </div>
    </div>
  );
}

export default ProductosPage;