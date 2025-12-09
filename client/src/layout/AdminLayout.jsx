import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuthStore } from '../store/authStore';
import backgroundGeneral from '../assets/backgroundgeneral.png';

function AdminLayout() {
  const { isAuth, user } = useAuthStore();

  // Protección de Ruta: Si no está logueado, chao.
  if (!isAuth) return <Navigate to="/login" />;
  
  // Protección de Rol: Si intenta entrar un garzón aquí, lo sacamos.
  if (user.rol !== 'ADMIN') return <Navigate to="/login" />;

  return (
    <div className="min-h-screen flex" style={{
      backgroundImage: `url(${backgroundGeneral})`,
      backgroundSize: '50%',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área de contenido principal */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {/* Aquí se renderizarán las páginas hijas (Dashboard, Usuarios, etc.) */}
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;