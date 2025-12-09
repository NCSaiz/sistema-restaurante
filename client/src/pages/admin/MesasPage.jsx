import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Edit, Coffee } from 'lucide-react';
import CreateMesaModal from '../../components/CreateMesaModal';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';

function MesasPage() {
  const [mesas, setMesas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [mesaToEdit, setMesaToEdit] = useState(null);
  const token = useAuthStore(state => state.token);

  const fetchMesas = async () => {
    try {
      const res = await axios.get('/mesas', { headers: { Authorization: `Bearer ${token}` } });
      setMesas(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchMesas(); }, []);

  const handleDelete = async (id, numero) => {
  // Usamos la alerta bonita
  const confirmado = await askConfirmation(
    `¿Eliminar Mesa ${numero}?`,
    "Si la eliminas, desaparecerá del mapa del restaurante.",
    "Sí, eliminar"
  );

  if (confirmado) {
    try {
      await axios.delete(`/mesas/${id}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      showSuccess('Mesa eliminada');
      fetchMesas();
    } catch (error) { 
      showError('Error', 'No se pudo eliminar la mesa. Verifica que no tenga pedidos activos.'); 
    }
  }
};

  return (
    <div className="text-gray-900" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Mesas</h1>
            <p className="text-gray-600">Configura el salón del restaurante</p>
          </div>
          <button onClick={() => { setMesaToEdit(null); setShowModal(true); }} 
            className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            style={{ backgroundColor: '#9B6BA8' }}>
            <Plus className="w-5 h-5" /> Nueva Mesa
          </button>
        </div>

        {/* Grid de Mesas con distribución personalizada */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, minmax(120px, auto))',
          gap: '1rem'
        }}>
          {mesas.map((mesa, index) => {
            // Distribución personalizada según posición
            let gridColumn = 'auto';
            let gridRow = 'auto';
            
            // Columna izquierda (índices 0, 1, 2, 3)
            if (index === 0) { gridColumn = '1 / 2'; gridRow = '1 / 2'; }
            if (index === 1) { gridColumn = '1 / 2'; gridRow = '2 / 3'; }
            if (index === 2) { gridColumn = '1 / 2'; gridRow = '3 / 4'; }
            if (index === 3) { gridColumn = '1 / 2'; gridRow = '4 / 5'; }
            
            // Centro (índices 4, 5, 6)
            if (index === 4) { gridColumn = '3 / 4'; gridRow = '1 / 2'; }
            if (index === 5) { gridColumn = '3 / 4'; gridRow = '2 / 3'; }
            if (index === 6) { gridColumn = '3 / 4'; gridRow = '3 / 4'; }
            
            // Centro derecha (índice 7)
            if (index === 7) { gridColumn = '3 / 4'; gridRow = '4 / 5'; }
            
            // Derecha (índices 8, 9, 10)
            if (index === 8) { gridColumn = '5 / 7'; gridRow = '1 / 2'; }
            if (index === 9) { gridColumn = '5 / 7'; gridRow = '2 / 3'; }
            if (index === 10) { gridColumn = '5 / 7'; gridRow = '3 / 4'; }
            
            // Si hay más mesas, se adaptan al siguiente conjunto
            if (index > 10) {
              const posInNext = (index - 11) % 4;
              const setNum = Math.floor((index - 11) / 4);
              if (setNum === 0) {
                if (posInNext === 0) { gridColumn = '1 / 2'; gridRow = '5 / 6'; }
                if (posInNext === 1) { gridColumn = '3 / 4'; gridRow = '5 / 6'; }
                if (posInNext === 2) { gridColumn = '5 / 7'; gridRow = '4 / 5'; }
              }
            }
            
            return (
              <div 
                key={mesa.id} 
                className="p-4 rounded-xl border-2 transition shadow-lg relative group" 
                style={{ 
                  backgroundColor: 'white',
                  borderColor: '#e0e0e0',
                  gridColumn,
                  gridRow
                }}>
                
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#9B6BA8' }}>
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-medium ${mesa.estado === 'libre' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                    {mesa.estado.toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">Mesa {mesa.numero}</h3>
                <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>

                {/* Botones Acciones (Solo visibles al pasar el mouse - group-hover) */}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg p-1">
                  <button 
                    onClick={() => { setMesaToEdit(mesa); setShowModal(true); }} 
                    className="p-1.5 rounded text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(mesa.id, mesa.numero)} 
                    className="p-1.5 rounded text-red-600 hover:bg-red-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Barra de animación al pasar el cursor - Respetando colores */}
                <div className="absolute bottom-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" style={{
                  backgroundColor: mesa.estado === 'libre' ? '#22C55E' : '#EF4444'
                }} />
              </div>
            );
          })}
        </div>

        {showModal && (
          <CreateMesaModal 
            onClose={() => setShowModal(false)} 
            onSuccess={fetchMesas} 
            mesaToEdit={mesaToEdit} 
          />
        )}
      </div>
    </div>
  );
}

export default MesasPage;