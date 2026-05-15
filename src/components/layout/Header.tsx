import { useAuth } from '../../hooks/useAuth';
import { ArrowRightOnRectangleIcon, Bars3Icon } from '@heroicons/react/24/outline';

export const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-white/5 bg-[#181c23]/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center md:hidden">
        <button className="p-2 -ml-2 text-gray-400 hover:text-white">
          <Bars3Icon className="h-6 w-6" />
        </button>
        <span className="ml-2 font-bold text-lg">BUNKER</span>
      </div>
      
      <div className="hidden md:block text-sm text-gray-400">
        Gestión Inteligente
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-300 hidden sm:block">
          {user?.email}
        </div>
        <button
          onClick={logout}
          className="flex items-center text-sm text-gray-400 hover:text-red-400 transition-colors"
          title="Cerrar Sesión"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
};
