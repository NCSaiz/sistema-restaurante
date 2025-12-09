import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { showSuccess, showError, askConfirmation } from '../../utils/sweetAlert';
import { Coffee, Store, Users, Lock, CheckCircle2 } from 'lucide-react';
import socket from '../../utils/socket';

function ComedorPage() {
  const [mesas, setMesas] = useState([]);
  const token = useAuthStore(state => state.token);
  const user = useAuthStore(state => state.user);

  const fetchMesas = async () => {
    try {
      const res = await axios.get('/mesas', { headers: { Authorization: `Bearer ${token}` } });
      setMesas(res.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchMesas();

    // Escuchar cuando alguien paga una cuenta para recargar las mesas
    socket.on('mesas:actualizado', () => {
      fetchMesas();
    });

    // Polling: Actualizar cada 5 segundos para ver si otro garzón ocupó una mesa
    const interval = setInterval(fetchMesas, 5000);
    
    return () => {
      socket.off('mesas:actualizado');
      clearInterval(interval);
    };
  }, []);

  const handleOcupar = async (mesa) => {
    if (mesa.estado !== 'libre') return;

    const ok = await askConfirmation(`¿Atender Mesa ${mesa.numero}?`, 'Se agregará a tus mesas pendientes.');
    if (ok) {
      try {
        await axios.post(`/mesas/${mesa.id}/ocupar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Mesa Asignada');
        fetchMesas();
      } catch (error) {
        showError('Error', error.response?.data?.message);
      }
    }
  };

  return (
    // IMPORTANTE: h-full y overflow-y-auto activan el scroll dentro del layout fijo
    <div className="h-full overflow-y-auto p-4" style={{ backgroundColor: '#f9f5f1' }}>
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header con título y emoji */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3" style={{ color: '#111827' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#A62858' }}>
              <Store className="w-6 h-6 text-white" />
            </div>
            Mapa del Comedor
          </h2>
        </div>
        
        {/* Grid de Mesas con distribución personalizada */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(4, minmax(120px, auto))',
          gap: '1rem'
        }}>
          {mesas.map((mesa, index) => {
            const esMia = mesa.usuarioId === user.id;
            const esLibre = mesa.estado === 'libre';
            const ocupadaPorOtro = !esLibre && !esMia;

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
              <button
                key={mesa.id}
                onClick={() => handleOcupar(mesa)}
                disabled={!esLibre}
                className="p-4 rounded-xl border-2 transition shadow-lg relative group text-left"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: esLibre ? '#22C55E' : esMia ? '#A62858' : '#d0d0d0',
                  opacity: ocupadaPorOtro ? 0.6 : 1,
                  cursor: esLibre ? 'pointer' : (esMia ? 'pointer' : 'not-allowed'),
                  gridColumn,
                  gridRow
                }}>
                
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" 
                    style={{ backgroundColor: esLibre ? '#22C55E' : esMia ? '#A62858' : '#9B6BA8' }}>
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full border font-bold ${
                     esLibre ? 'bg-green-100 text-green-800 border-green-300' :
                     esMia ? 'bg-red-100 text-red-800 border-red-300' :
                     'bg-gray-100 text-gray-800 border-gray-300'
                  }`}>
                    {esLibre ? 'DISPONIBLE' : esMia ? 'TUYA' : 'OCUPADA'}
                  </span>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">Mesa {mesa.numero}</h3>
                <p className="text-sm text-gray-600">Capacidad: {mesa.capacidad} personas</p>

                {/* Barra de animación al pasar el cursor */}
                <div className="absolute bottom-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" 
                  style={{
                    backgroundColor: esLibre ? '#22C55E' : esMia ? '#A62858' : '#d0d0d0'
                  }} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ComedorPage;