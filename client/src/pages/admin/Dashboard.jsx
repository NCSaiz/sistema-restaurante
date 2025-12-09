import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { 
  Lock, 
  Unlock, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  DollarSign,
  ShoppingBag
} from 'lucide-react';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';

function Dashboard() {
  const [turno, setTurno] = useState(null); // null, 'abierto', 'cerrado'
  const [datosTurno, setDatosTurno] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuthStore();

  // 1. Cargar estado del turno al entrar
  const fetchTurno = async () => {
    try {
      const res = await axios.get('/turnos', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTurno(res.data.estado);
      setDatosTurno(res.data.turno);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurno();
  }, []);

  // 2. Función para Abrir/Cerrar
  const handleToggleTurno = async () => {
    // PREGUNTA DE SEGURIDAD
    if (turno === 'abierto') {
      const confirmado = await askConfirmation(
        '¿Cerrar Turno?', 
        'Los garzones y cocineros perderán acceso al sistema.'
      );
      if (!confirmado) return; // Si dice cancelar, no hacemos nada
    } else {
       const confirmado = await askConfirmation(
        '¿Abrir Turno?', 
        'Se habilitará el acceso al personal.'
      );
      if (!confirmado) return;
    }

    setLoading(true);
    try {
      if (turno === 'cerrado') {
        await axios.post('/turnos/abrir', { userId: user.id }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('¡Turno Abierto!'); // <--- Feedback visual
      } else {
        await axios.post('/turnos/cerrar', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Turno Cerrado Correctamente'); // <--- Feedback visual
      }
      fetchTurno();
    } catch (error) {
      showError('Error', 'No se pudo cambiar el estado del turno'); // <--- Feedback error
      setLoading(false);
    }
  };

  return (
    <div className="text-gray-900" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-600">Vistas generales del turno</p>
          </div>
        </div>

      {/* SECCIÓN DE ESTADO DEL RESTAURANTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Tarjeta de Estado del Turno */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col justify-between transition-colors shadow-2xl`} style={{
          backgroundColor: 'rgba(166, 40, 88, 0.15)',
          borderColor: '#a62858'
        }}>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Estado del Restaurante</h2>
              {turno === 'abierto' ? (
                <span className="px-3 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1 animate-pulse" style={{ backgroundColor: '#a62858' }}>
                  <CheckCircle2 className="w-3 h-3" /> OPERATIVO
                </span>
              ) : (
                <span className="px-3 py-1 text-white text-xs font-bold rounded-full flex items-center gap-1" style={{ backgroundColor: '#a62858' }}>
                  <Lock className="w-3 h-3" /> CERRADO
                </span>
              )}
            </div>
            
            <p className="mb-6 text-gray-900">
              {turno === 'abierto' 
                ? `Turno iniciado el ${new Date(datosTurno?.fechaInicio).toLocaleTimeString()} por ${datosTurno?.usuario?.nombre || 'Admin'}.`
                : "El sistema está bloqueado para Garzones y Cocina. Abre turno para comenzar a operar."
              }
            </p>
          </div>

          <button
            onClick={handleToggleTurno}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-transform active:scale-95 text-white shadow-lg"
            style={{
              backgroundColor: turno === 'abierto' ? '#EF4444' : '#F1A321'
            }}
          >
            {loading ? (
               "Procesando..."
            ) : turno === 'abierto' ? (
              <> <Lock className="w-6 h-6" /> CERRAR TURNO </>
            ) : (
              <> <Unlock className="w-6 h-6" /> ABRIR TURNO </>
            )}
          </button>
        </div>

        {/* Tarjeta de Resumen Rápido (Placeholder para futuro) */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E' }}>
             <div className="p-3 rounded-full mb-3" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22C55E' }}>
                <DollarSign className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900">$0</h3>
             <p className="text-sm text-gray-700" style={{ opacity: 0.7 }}>Ventas Hoy</p>
          </div>
          <div className="p-6 rounded-2xl border-2 flex flex-col items-center justify-center text-center" style={{ backgroundColor: 'rgba(241, 163, 33, 0.15)', borderColor: '#F1A321' }}>
             <div className="p-3 rounded-full mb-3" style={{ backgroundColor: 'rgba(241, 163, 33, 0.2)', color: '#F1A321' }}>
                <ShoppingBag className="w-8 h-8" />
             </div>
             <h3 className="text-2xl font-bold text-gray-900">0</h3>
             <p className="text-sm text-gray-700" style={{ opacity: 0.7 }}>Pedidos Activos</p>
          </div>
        </div>

      </div>

      <div className="rounded-xl p-6 border-2" style={{ backgroundColor: 'rgba(200, 200, 200, 0.15)', borderColor: '#cccccc' }}>
        <div className="flex items-center gap-3 mb-4 text-gray-900">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Historial de Turnos Recientes</h3>
        </div>
        <p className="text-sm italic text-gray-700" style={{ opacity: 0.7 }}>Aquí verás la lista de los últimos cierres de caja (Próximamente en Fase 4).</p>
      </div>
      </div>
    </div>
  );
}

export default Dashboard;