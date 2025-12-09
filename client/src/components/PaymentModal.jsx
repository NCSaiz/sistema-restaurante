import { useState } from 'react';
import { X, CreditCard, Banknote, Receipt } from 'lucide-react';
import { askConfirmation } from '../utils/sweetAlert';

function PaymentModal({ total, onClose, onConfirm }) {
  const propinaSugerida = Math.round(total * 0.1);
  const [conPropina, setConPropina] = useState(true);
  const [metodoPago, setMetodoPago] = useState('TARJETA'); // 'TARJETA' o 'EFECTIVO'

  const totalFinal = conPropina ? total + propinaSugerida : total;

  const formatMoney = (amount) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

  const handlePagar = async () => {
    const confirmado = await askConfirmation(
      `¿Confirmar Pago de ${formatMoney(totalFinal)}?`,
      `Método: ${metodoPago} ${conPropina ? '(Incluye Propina)' : '(Sin Propina)'}`,
      'Sí, COBRAR'
    );

    if (confirmado) {
      onConfirm({
        totalConPropina: totalFinal,
        propina: conPropina ? propinaSugerida : 0,
        metodoPago
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
        
        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b" style={{ backgroundColor: '#A62858', borderColor: '#d0d0d0' }}>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5" /> Cerrar Cuenta
          </h2>
          <button onClick={onClose} className="transition hover:opacity-80">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Desglose */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm" style={{ color: '#111827' }}>
              <span className="font-medium">Consumo</span>
              <span className="font-bold">{formatMoney(total)}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 rounded-2xl border-2 transition" style={{ backgroundColor: 'white', borderColor: '#22C55E' }}>
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={conPropina} 
                  onChange={(e) => setConPropina(e.target.checked)}
                  className="w-6 h-6 rounded-full focus:ring-2 focus:ring-offset-2 cursor-pointer"
                  style={{ accentColor: '#ffffff', backgroundColor: '#ffffff' }}
                />
                <span className="font-medium" style={{ color: '#111827' }}>Propina Sugerida (10%)</span>
              </div>
              <span className="font-bold text-lg" style={{ color: '#22C55E' }}>+ {formatMoney(propinaSugerida)}</span>
            </div>

            <div className="flex justify-between pt-4 border-t text-lg font-bold" style={{ borderColor: '#d0d0d0', color: '#111827' }}>
              <span>TOTAL A PAGAR</span>
              <span>{formatMoney(totalFinal)}</span>
            </div>
          </div>

          {/* Método de Pago */}
          <div>
            <p className="text-xs uppercase font-bold mb-3" style={{ color: '#666666' }}>Medio de Pago</p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setMetodoPago('TARJETA')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition ${
                  metodoPago === 'TARJETA' 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: metodoPago === 'TARJETA' ? '#A62858' : '#f9f5f1',
                  borderColor: metodoPago === 'TARJETA' ? '#A62858' : '#d0d0d0'
                }}
              >
                <CreditCard className="w-6 h-6" />
                <span className="text-xs">TARJETA</span>
              </button>

              <button 
                onClick={() => setMetodoPago('EFECTIVO')}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 font-bold transition ${
                  metodoPago === 'EFECTIVO' 
                    ? 'text-white' 
                    : 'text-gray-400'
                }`}
                style={{
                  backgroundColor: metodoPago === 'EFECTIVO' ? '#22C55E' : '#f9f5f1',
                  borderColor: metodoPago === 'EFECTIVO' ? '#22C55E' : '#d0d0d0'
                }}
              >
                <Banknote className="w-6 h-6" />
                <span className="text-xs">EFECTIVO</span>
              </button>
            </div>
          </div>

          <button 
            onClick={handlePagar}
            className="w-full py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-all duration-300"
            style={{ backgroundColor: '#22C55E', color: 'white' }}
          >
            COBRAR {formatMoney(totalFinal)}
          </button>

        </div>
      </div>
    </div>
  );
}

export default PaymentModal;