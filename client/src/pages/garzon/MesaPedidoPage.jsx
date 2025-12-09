import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';
import socket from '../../utils/socket';
import { ChefHat, ArrowLeft, Minus, Plus, Trash2, CheckCircle, Clock, Loader, BellRing, UtensilsCrossed, Receipt, HandPlatter } from 'lucide-react';
import PaymentModal from '../../components/PaymentModal'; // <--- Importar Modal Pago
import backgroundGeneral from '../../assets/backgroundgeneral.png';

function MesaPedidoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);

  const [productos, setProductos] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [carrito, setCarrito] = useState({}); 
  const [pedidoActual, setPedidoActual] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false); // <--- Estado Modal Pago

  const fetchData = async () => {
    try {
      const resProd = await axios.get('/productos', { headers: { Authorization: `Bearer ${token}` } });
      setProductos(resProd.data);
      const resPedido = await axios.get(`/pedidos/mesa/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPedidoActual(resPedido.data);
    } catch (error) { console.error(error); }
  };

  useEffect(() => {
    fetchData();
    socket.on('pedido:actualizado', () => fetchData());
    return () => socket.off('pedido:actualizado');
  }, [id, token]);

  // ... (agregarAlCarrito y quitarDelCarrito son iguales que antes) ...
  const agregarAlCarrito = (prod) => {
    setCarrito(prev => ({ ...prev, [prod.id]: { ...prod, cantidad: (prev[prod.id]?.cantidad || 0) + 1 } }));
  };
  const quitarDelCarrito = (prodId) => {
    setCarrito(prev => {
      const actual = prev[prodId];
      if (!actual) return prev;
      if (actual.cantidad === 1) { const n = {...prev}; delete n[prodId]; return n; }
      return { ...prev, [prodId]: { ...actual, cantidad: actual.cantidad - 1 } };
    });
  };

  const handleEnviarCocina = async () => {
    const items = Object.values(carrito);
    if (items.length === 0) return;
    const total = items.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
    const count = items.reduce((acc, i) => acc + i.cantidad, 0);

    if (await askConfirmation(`¿Marchar ${count} productos?`, `Total: $${formatMoney(total)}`, "Sí, ENVIAR")) {
      setLoading(true);
      try {
        await axios.post(`/pedidos/mesa/${id}`, { 
          items: items.map(i => ({ productoId: i.id, cantidad: i.cantidad, precio: i.precio })) 
        }, { headers: { Authorization: `Bearer ${token}` } });
        showSuccess('Comanda enviada');
        setCarrito({});
      } catch (e) { showError('Error', 'No se pudo enviar'); } 
      finally { setLoading(false); }
    }
  };

  // CAMBIAR ESTADO (Retirar o Entregar)
  const handleCambiarEstado = async (detalleId, nuevoEstado, nombreProducto) => {
    try {
        await axios.post(`/pedidos/detalle/${detalleId}/estado`, { estado: nuevoEstado }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // Feedback visual sutil
        if (nuevoEstado === 'RETIRADO') showSuccess(`Retiraste: ${nombreProducto}`);
        if (nuevoEstado === 'ENTREGADO') showSuccess(`Entregado: ${nombreProducto}`);
    } catch (error) {
        showError('Error', 'No se pudo actualizar estado');
    }
  };

  // PROCESAR PAGO (Viene del Modal)
  const handleConfirmarPago = async (datosPago) => {
    try {
      await axios.post(`/pedidos/mesa/${id}/pagar`, datosPago, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowPayment(false);
      showSuccess('¡Cuenta Pagada!');
      navigate('/garzon/mis-mesas'); // Sacamos al garzón de la mesa
    } catch (error) {
      setShowPayment(false);
      showError('No se pudo cobrar', error.response?.data?.message);
    }
  };

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);
  
  const productosFiltrados = categoriaActiva === 'todos' ? productos : productos.filter(p => p.categoria === categoriaActiva);
  const itemsCarrito = Object.values(carrito);
  const totalCarrito = itemsCarrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  return (
    <div className="flex h-full overflow-hidden" style={{ backgroundColor: '#f9f5f1' }}>
      
      {/* IZQUIERDA: MENÚ (60%) - (Igual que antes) */}
      <div className="w-[60%] flex flex-col h-full" style={{ borderRight: '1px solid #d0d0d0' }}>
        <div className="px-4 py-5 flex items-start justify-between shrink-0" style={{ backgroundColor: 'white', borderBottom: '1px solid #d0d0d0' }}>
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/garzon/mis-mesas')} className="p-2 rounded-lg transition" style={{ backgroundColor: '#f0f0f0', color: '#111827' }}><ArrowLeft /></button>
                <h2 className="text-xl font-bold" style={{ color: '#111827' }}>Carta & Menú</h2>
            </div>
            <div className="flex gap-2 items-start justify-end flex-1">
                {[
                  { id: 'todos', label: 'Todos', emoji: '📋' },
                  { id: 'bebida', label: 'Bebida', emoji: '🥤' },
                  { id: 'plato_fondo', label: 'Plato Fondo', emoji: '🍽️' },
                  { id: 'entrada', label: 'Entrada', emoji: '🥗' },
                  { id: 'postre', label: 'Postre', emoji: '🍰' }
                ].map(cat => (
                <button key={cat.id} onClick={() => setCategoriaActiva(cat.id)} className={`px-5 py-2 rounded-xl text-base font-bold capitalize transition-all whitespace-nowrap flex items-center gap-2`} style={{ backgroundColor: categoriaActiva === cat.id ? '#A62858' : '#f0f0f0', color: categoriaActiva === cat.id ? 'white' : '#111827' }}>{cat.emoji} {cat.label}</button>
                ))}
            </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundImage: `url(${backgroundGeneral})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#f9f5f1' }}>
            <div className="grid grid-cols-3 gap-3">
                {productosFiltrados.map(prod => {
                    const enCarrito = carrito[prod.id]?.cantidad || 0;
                    return (
                        <button key={prod.id} onClick={() => agregarAlCarrito(prod)} className={`relative p-4 rounded-xl text-left transition-all border-2 active:scale-95 flex flex-col justify-between min-h-[140px]`} style={{ backgroundColor: enCarrito > 0 ? 'rgba(166, 40, 88, 0.1)' : 'white', borderColor: enCarrito > 0 ? '#A62858' : '#e0e0e0' }}>
                            {enCarrito > 0 && <div className="absolute top-2 right-2 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg" style={{ backgroundColor: '#A62858' }}>{enCarrito}</div>}
                            <div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${prod.estacion === 'barra' ? 'bg-purple-500/20 text-purple-700' : 'bg-orange-500/20 text-orange-700'}`}>{prod.estacion.replace(/_/g, ' ')}</span>
                                <h3 className="font-bold text-lg leading-tight mt-2" style={{ color: '#111827' }}>{prod.nombre}</h3>
                            </div>
                            <p className="font-bold text-lg mt-2" style={{ color: '#22C55E' }}>{formatMoney(prod.precio)}</p>
                        </button>
                    )
                })}
            </div>
        </div>
      </div>

      {/* DERECHA: ESTADO Y COBRO (40%) */}
      <div className="w-[40%] flex flex-col h-full shadow-2xl z-10" style={{ backgroundColor: 'white', borderLeft: '1px solid #d0d0d0' }}>
        
        {/* HEADER CUENTA */}
        <div className="px-4 py-5 shrink-0 flex justify-between items-start" style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <div>
                <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Mesa {pedidoActual?.mesaId}</h1>
                <p className="text-xs" style={{ color: '#666666' }}>Orden #{pedidoActual?.id || '---'}</p>
            </div>
            
            {/* BOTÓN COBRAR */}
            {pedidoActual && pedidoActual.total > 0 && (
                <button 
                    onClick={() => setShowPayment(true)}
                    className="text-white px-4 py-2 rounded-xl font-bold shadow-lg flex items-center gap-2 animate-pulse"
                    style={{ backgroundColor: '#22C55E' }}
                >
                    <Receipt className="w-5 h-5" />
                    COBRAR
                </button>
            )}
        </div>

        {/* CARRITO */}
        {itemsCarrito.length > 0 && (
            <div className="p-4 shrink-0 max-h-[35%] overflow-y-auto border-b-4" style={{ backgroundColor: 'rgba(166, 40, 88, 0.1)', borderColor: '#A62858' }}>
                {/* ... (Mismo código de carrito de antes) ... */}
                <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold flex items-center gap-2 text-sm" style={{ color: '#A62858' }}><Plus className="w-4 h-4" /> POR AGREGAR</h3>
                    <button onClick={() => setCarrito({})} className="text-xs hover:opacity-70 flex items-center gap-1" style={{ color: '#EF4444' }}><Trash2 className="w-3 h-3" /> Cancelar</button>
                </div>
                <div className="space-y-2">
                    {itemsCarrito.map(item => (
                        <div key={item.id} className="flex justify-between items-center p-2 rounded-lg border" style={{ backgroundColor: 'white', borderColor: '#A62858' }}>
                            <div className="flex-1"><p className="font-medium text-sm" style={{ color: '#111827' }}>{item.nombre}</p></div>
                            <div className="flex items-center gap-3 rounded p-1" style={{ backgroundColor: 'rgba(166, 40, 88, 0.1)' }}>
                                <button onClick={() => quitarDelCarrito(item.id)} className="p-1" style={{ color: '#EF4444' }}><Minus className="w-4 h-4"/></button>
                                <span className="font-bold w-6 text-center" style={{ color: '#111827' }}>{item.cantidad}</span>
                                <button onClick={() => agregarAlCarrito(item)} className="p-1" style={{ color: '#22C55E' }}><Plus className="w-4 h-4"/></button>
                            </div>
                        </div>
                    ))}
                </div>
                <button onClick={handleEnviarCocina} disabled={loading} className="w-full mt-4 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95" style={{ backgroundColor: '#A62858' }}>
                    {loading ? <Loader className="animate-spin" /> : <ChefHat />} ENVIAR A COCINA
                </button>
            </div>
        )}

        {/* LISTA DE PEDIDOS (Con nuevos estados) */}
        <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: 'white' }}>
            <div className="flex justify-between items-end mb-3">
                <h3 className="font-bold text-xs uppercase tracking-wider flex items-center gap-2" style={{ color: '#666666' }}><UtensilsCrossed className="w-4 h-4" /> Consumo Actual</h3>
                <p className="text-xl font-bold" style={{ color: '#111827' }}>{formatMoney((pedidoActual?.total || 0) + totalCarrito)}</p>
            </div>
            
            {!pedidoActual || !pedidoActual.detalles || pedidoActual.detalles.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed rounded-xl" style={{ color: '#666666', borderColor: '#e0e0e0' }}><p>Mesa sin pedidos activos</p></div>
            ) : (
                <div className="space-y-3">
                    {pedidoActual.detalles.map((detalle) => {
                        const esBarra = detalle.producto.estacion === 'barra';
                        const estado = detalle.estado;

                        return (
                            <div key={detalle.id} className={`flex justify-between items-center p-3 rounded-xl border-2`} style={{ backgroundColor: estado === 'ENTREGADO' ? 'rgba(0, 0, 0, 0.05)' : 'white', borderColor: esBarra ? '#9B6BA8' : '#F1993d', opacity: estado === 'ENTREGADO' ? 0.6 : 1 }}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${esBarra ? 'bg-purple-500/20 text-purple-700' : 'bg-orange-500/20 text-orange-700'}`}>{detalle.cantidad}</div>
                                    <div>
                                        <p className={`font-bold text-sm`} style={{ color: estado === 'ENTREGADO' ? '#999999' : '#111827', textDecoration: estado === 'ENTREGADO' ? 'line-through' : 'none' }}>{detalle.producto.nombre}</p>
                                        <p className="text-xs" style={{ color: '#666666' }}>{formatMoney(detalle.precioUnit)}</p>
                                    </div>
                                </div>

                                <div>
                                    {/* ESTADO FINAL: ENTREGADO */}
                                    {estado === 'ENTREGADO' && (
                                        <div className="flex items-center gap-1 text-xs font-bold" style={{ color: '#666666' }}><CheckCircle className="w-4 h-4" /> OK</div>
                                    )}

                                    {/* BARRA (Directo a Entregar) */}
                                    {estado !== 'ENTREGADO' && esBarra && (
                                        <button onClick={() => handleCambiarEstado(detalle.id, 'ENTREGADO', detalle.producto.nombre)} className="text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-1" style={{ backgroundColor: '#22C55E' }}>
                                            ENTREGAR
                                        </button>
                                    )}

                                    {/* COCINA (Flujo Complejo) */}
                                    {estado !== 'ENTREGADO' && !esBarra && (
                                        <>
                                            {estado === 'PENDIENTE' && <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded text-xs border text-xs font-bold" style={{ color: '#F7C948', borderColor: '#F7C948' }}><Clock className="w-3 h-3 animate-pulse" /> En Cola</div>}
                                            {estado === 'EN_PREPARACION' && <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded text-xs border font-bold" style={{ color: '#F1993d', borderColor: '#F1993d' }}><ChefHat className="w-3 h-3 animate-bounce" /> Cocinando</div>}
                                            
                                            {/* PASO 1: RETIRAR DE COCINA */}
                                            {estado === 'LISTO' && (
                                                <button onClick={() => handleCambiarEstado(detalle.id, 'RETIRADO', detalle.producto.nombre)} className="text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg animate-pulse active:scale-95 transition-all flex items-center gap-1" style={{ backgroundColor: '#9B6BA8' }}>
                                                    <BellRing className="w-4 h-4" /> RETIRAR
                                                </button>
                                            )}

                                            {/* PASO 2: ENTREGAR EN MESA (El garzón ya lo tiene) */}
                                            {estado === 'RETIRADO' && (
                                                <button onClick={() => handleCambiarEstado(detalle.id, 'ENTREGADO', detalle.producto.nombre)} className="text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all flex items-center gap-1" style={{ backgroundColor: '#22C55E' }}>
                                                    <HandPlatter className="w-4 h-4" /> SERVIR
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
      </div>

      {/* MODAL DE PAGO */}
      {showPayment && pedidoActual && (
        <PaymentModal 
            total={pedidoActual.total} 
            onClose={() => setShowPayment(false)}
            onConfirm={handleConfirmarPago}
        />
      )}
    </div>
  );
}

export default MesaPedidoPage;