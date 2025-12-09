import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Coffee, Utensils, XCircle, ArrowRight, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';
import socket from '../../utils/socket';

function MisMesasPage() {
  const [mesas, setMesas] = useState([]);
  const token = useAuthStore(state => state.token);
  const navigate = useNavigate();

  const fetchMisMesas = async () => {
    try {
      const res = await axios.get('/mesas/mis-mesas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMesas(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMisMesas();

    // Escuchar cuando alguien paga una cuenta para recargar las mesas
    socket.on('mesas:actualizado', () => {
      fetchMisMesas();
    });

    return () => socket.off('mesas:actualizado');
  }, []);

  const handleLiberar = async (e, mesa) => {
    e.stopPropagation();
    const confirmado = await askConfirmation(
      `¿Liberar Mesa ${mesa.numero}?`,
      "Quedará disponible para otros garzones.",
      "Sí, liberar"
    );

    if (confirmado) {
      try {
        await axios.post(`/mesas/${mesa.id}/liberar`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Mesa Liberada');
        fetchMisMesas();
      } catch (error) {
        showError('No se pudo liberar', error.response?.data?.message);
      }
    }
  };

  return (
    // IMPORTANTE: h-full y overflow-y-auto activan el scroll dentro del layout fijo
    <div className="h-full overflow-y-auto p-4" style={{ backgroundColor: '#f9f5f1' }}>
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header con título y emoji */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold flex items-center gap-3" style={{ color: '#111827' }}>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#A62858' }}>
              <Utensils className="w-6 h-6 text-white" />
            </div>
            Mis Mesas Activas
          </h2>
        </div>
        
        {mesas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 rounded-3xl border-2 border-dashed" style={{ backgroundColor: 'white', borderColor: '#d0d0d0' }}>
            <ClipboardList className="w-16 h-16 mb-4" style={{ color: '#111827', opacity: 0.5 }} />
            <p className="text-lg" style={{ color: '#111827' }}>No estás atendiendo ninguna mesa.</p>
            <button 
              onClick={() => navigate('/garzon/comedor')}
              className="mt-6 px-6 py-3 text-white rounded-xl font-bold transition shadow-lg"
              style={{ backgroundColor: '#A62858' }}
            >
              Ir al Comedor
            </button>
          </div>
        ) : (
          // Grid con distribución personalizada
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
              <button
                key={mesa.id}
                onClick={() => navigate(`/garzon/mesa/${mesa.id}`)}
                className="p-4 rounded-xl border-2 transition shadow-lg relative group text-left"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: '#A62858',
                  cursor: 'pointer',
                  gridColumn,
                  gridRow
                }}
              >
                {/* Cabecera Tarjeta */}
                <div className="flex justify-between items-start mb-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: '#A62858' }}>
                    <Coffee className="w-5 h-5" />
                  </div>

                  {/* Botón Liberar (Discreto) */}
                  <button
                    onClick={(e) => handleLiberar(e, mesa)}
                    className="p-1 rounded-full transition"
                    style={{ color: '#111827' }}
                    title="Liberar mesa"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                {/* Info */}
                <h3 className="text-xl font-bold mb-1" style={{ color: '#111827' }}>Mesa {mesa.numero}</h3>
                <p className="text-sm text-gray-600">{mesa.capacidad} Personas</p>

                {/* Estado / Pedidos */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t" style={{ borderColor: '#d0d0d0' }}>
                   {(() => {
                      // Lógica corregida para contar ITEMS, no pedidos
                      const pedidoActivo = mesa.pedidos?.[0]; // Tomamos el primer pedido activo
                      const cantidadItems = pedidoActivo?.detalles?.length || 0;

                      if (cantidadItems > 0) {
                        return (
                          <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
                             <span className="text-sm font-medium" style={{ color: '#111827' }}>
                                {cantidadItems} Productos
                             </span>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                             <span className="text-sm font-medium" style={{ color: '#111827' }}>
                                Abierta
                             </span>
                          </div>
                        );
                      }
                   })()}
                   
                   <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" style={{ color: '#111827' }} />
                </div>

                {/* Barra de animación al pasar el cursor */}
                <div className="absolute bottom-0 left-0 w-full h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl" style={{ backgroundColor: '#A62858' }} />
              </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisMesasPage;