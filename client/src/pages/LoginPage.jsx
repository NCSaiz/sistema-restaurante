import { useState } from 'react';
import axios from '../api/axios'; // Importamos nuestra config
import { useAuthStore } from '../store/authStore'; // Importamos el estado global
import { useNavigate } from 'react-router-dom'; // Para redireccionar
import { User, Lock } from 'lucide-react'; // Iconos bonitos
import backgroundgeneral from '../assets/backgroundgeneral.png'; // Importar imagen
import logo from '../assets/logopng.png'; // Importar logo

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const setLogin = useAuthStore((state) => state.setLogin);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/login', { email, password });
      // Si login es exitoso:
      setLogin(res.data, res.data.token);
      
      // Redirigir según rol
      if (res.data.rol === 'ADMIN') navigate('/admin');
      else if (res.data.rol === 'COCINA') navigate('/cocina');
      else navigate('/garzon/comedor');
      
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-start p-0" style={{
      backgroundImage: `url(${backgroundgeneral})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="p-8 rounded-none shadow-none w-1/3 border-0 h-screen flex flex-col justify-center items-center" style={{backgroundColor: '#3A2154'}}>
        
        <div className="mb-8 w-96 text-center">
          <h2 className="text-5xl font-bold text-white">
            Bienvenido a <span style={{color: '#F1A321'}}>Buen Sabor</span>
          </h2>
        </div>

        {error && (
          <div className="p-3 rounded mb-4 text-sm text-center font-bold text-white border-2 w-96" style={{backgroundColor: '#BD5D01', borderColor: '#F3E101'}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 w-96">
          
          <div>
            <label className="block text-white text-sm font-medium mb-2">Email</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5" style={{color: '#F1A321'}} />
              <input 
                type="email" 
                className="w-full text-gray-900 border-2 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-transparent transition" 
                style={{backgroundColor: 'white', borderColor: '#F1A321'}}
                placeholder="ejemplo@buensabor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5" style={{color: '#F1A321'}} />
              <input 
                type="password" 
                className="w-full text-gray-900 border-2 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:border-transparent transition"
                style={{backgroundColor: 'white', borderColor: '#F1A321'}}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full text-white font-bold py-3 rounded-lg transition duration-200 transform hover:scale-[1.02]"
            style={{backgroundColor: '#F1A321'}}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#BD5D01'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#F1A321'}
          >
            Ingresar al Sistema
          </button>
        </form>
      </div>
      
      <div className="w-2/3 h-screen flex items-center justify-center relative" style={{backgroundImage: `url(${backgroundgeneral})`, backgroundSize: 'cover', backgroundPosition: 'center'}}>
        <div className="absolute inset-0 bg-black opacity-20 pointer-events-none"></div>
        <img src={logo} alt="Logo Buen Sabor" className="w-full h-full object-contain p-20 relative z-10" />
      </div>
    </div>  
  );
}

export default LoginPage;   