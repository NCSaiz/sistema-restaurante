import Swal from 'sweetalert2';

// Configuración base para modo claro (Light Mode)
const lightOptions = {
  background: 'white',
  color: '#333333',
  confirmButtonColor: '#9B6BA8', // Púrpura del dashboard
  cancelButtonColor: '#EF4444', // Rojo suave pero visible
  iconColor: '#EF4444', // Rojo para alertas
  customClass: {
    popup: 'border-2 border-gray-300 rounded-xl shadow-lg'
  }
};

// 1. CONFIRMACIÓN (Pregunta de Sí/No)
export const askConfirmation = async (titulo, texto, textoBoton = 'Sí, continuar') => {
  const result = await Swal.fire({
    ...lightOptions,
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: textoBoton,
    cancelButtonText: 'Cancelar',
    reverseButtons: true // Pone el botón de cancelar a la izquierda (mejor UX)
  });

  return result.isConfirmed; // Retorna true si dijo que SÍ, false si canceló
};

// 2. ÉXITO (Notificación verde)
export const showSuccess = (titulo) => {
  Swal.fire({
    ...lightOptions,
    icon: 'success',
    title: titulo,
    iconColor: '#22C55E', // green-500
    confirmButtonColor: '#16A34A', // green-600
    timer: 2000,
    showConfirmButton: false
  });
};

// 3. ERROR (Notificación roja)
export const showError = (titulo, texto) => {
  Swal.fire({
    ...lightOptions,
    icon: 'error',
    title: titulo,
    text: texto,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#EF4444'
  });
};