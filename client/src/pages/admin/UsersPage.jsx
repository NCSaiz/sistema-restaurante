import { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { useAuthStore } from '../../store/authStore';
import { Plus, Trash2, Edit } from 'lucide-react';
import CreateUserModal from '../../components/CreateUserModal';
import { askConfirmation, showSuccess, showError } from '../../utils/sweetAlert';

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // 1. ESTADO NUEVO: Para saber a quién vamos a editar
  const [userToEdit, setUserToEdit] = useState(null); // <--- AGREGAR ESTO

  const token = useAuthStore(state => state.token);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

 const handleDelete = async (id, nombre) => {
    // Usamos nuestra alerta bonita en vez de window.confirm
    const confirmado = await askConfirmation(
      `¿Eliminar a ${nombre}?`,
      "Esta acción es permanente y no se puede deshacer.",
      "Sí, eliminar"
    );

    if (confirmado) {
      try {
        await axios.delete(`/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        showSuccess('Usuario eliminado');
        fetchUsers(); 
      } catch (error) {
        showError('Error', 'No se pudo eliminar el usuario');
      }
    }
  };

  return (
    <div className="text-gray-900" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <p className="text-gray-600">Administra el personal del restaurante</p>
          </div>
        
        {/* 2. MODIFICACIÓN: Limpiar el usuario al crear uno nuevo */}
        <button 
          onClick={() => { 
            setUserToEdit(null);
            setShowModal(true); 
          }} 
          className="text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          style={{ backgroundColor: '#9B6BA8' }}
        >
          <Plus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      <div className="rounded-xl border overflow-hidden shadow-xl" style={{ borderColor: '#e0e0e0', backgroundColor: 'white' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', color: '#666666' }} className="text-sm uppercase">
                <th className="px-6 py-4">Nombre</th>
                <th className="px-6 py-4">Rol</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: '#e0e0e0' }}>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-600">Cargando...</td></tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors" style={{ color: '#333333' }}>
                    <td className="px-6 py-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full text-white flex items-center justify-center text-xs font-bold border" style={{ backgroundColor: '#9B6BA8', borderColor: '#9B6BA8' }}>
                        {user.nombre.charAt(0)}
                      </div>
                      {user.nombre}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${
                        user.rol === 'ADMIN' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                        user.rol === 'COCINA' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                        'bg-blue-100 text-blue-800 border-blue-300'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${user.activo ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></span>
                        <span className="text-sm text-gray-700">{user.activo ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        
                        <button 
                          onClick={() => {
                            setUserToEdit(user);
                            setShowModal(true);
                          }}
                          className="p-2 rounded-lg text-gray-700 transition"
                          style={{ backgroundColor: '#f0f0f0', color: '#666666' }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={() => handleDelete(user.id, user.nombre)}
                            className="p-2 rounded-lg text-red-600 transition"
                            style={{ backgroundColor: '#ffe0e0' }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#ffc0c0'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#ffe0e0'}
                            >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {showModal && (
        <CreateUserModal 
          onClose={() => {
            setShowModal(false);
            setUserToEdit(null);
          }} 
          onSuccess={() => {
            fetchUsers();
            setShowModal(false);
            setUserToEdit(null);
          }}
          userToEdit={userToEdit}
        />
      )}
    </div>
  );
}

export default UsersPage;