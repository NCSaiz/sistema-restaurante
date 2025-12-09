import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LayoutDashboard, 
  Users, 
  UtensilsCrossed, 
  Coffee, 
  LogOut, 
  ClipboardList 
} from 'lucide-react';
import clsx from 'clsx';
import { askConfirmation } from '../utils/sweetAlert';
import logo from '../assets/logopng.png';

function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const menuItems = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { to: "/admin/usuarios", icon: Users, label: "Usuarios" },
    { to: "/admin/mesas", icon: Coffee, label: "Mesas" },
    { to: "/admin/productos", icon: UtensilsCrossed, label: "Menú y Productos" },
    { to: "/admin/pedidos", icon: ClipboardList, label: "Historial Pedidos" },
  ];

  return (
    <aside className="w-64 flex flex-col h-screen fixed left-0 top-0" style={{ backgroundColor: '#3A2154', borderRight: '2px solid #ffffff' }}>
      {/* 1. Header del Sidebar */}
      <div className="flex flex-col items-center justify-center py-4">
        <img src={logo} alt="Buen Sabor" className="w-24 h-24 mb-2" />
        <h1 className="text-xl font-bold tracking-wider text-white">
          Administrador
        </h1>
      </div>

      {/* 2. Navegación */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === "/admin"} // Solo exacto para el dashboard
                className={({ isActive }) => {
                  const baseClass = "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium";
                  if (isActive) {
                    return baseClass + " text-white shadow-lg";
                  }
                  return baseClass + " text-white hover:text-white";
                }}
                style={({ isActive }) => ({
                  backgroundColor: isActive ? '#9B6BA8' : 'transparent',
                })}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* 3. Footer del Sidebar (Perfil + Logout) */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#9B6BA8' }}>
            {user?.nombre?.charAt(0) || "A"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-white">{user?.nombre}</p>
            <p className="text-xs truncate text-white" style={{ opacity: 0.7 }}>Administrador</p>
          </div>
        </div>
        
        <button 
          onClick={async () => {
            const confirmado = await askConfirmation(
              '¿Cerrar Sesión?',
              'Tendrás que ingresar tus credenciales nuevamente.',
              'Sí, salir'
            );
            if (confirmado) logout();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors text-white"
          style={{ backgroundColor: '#EF4444' }}
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;