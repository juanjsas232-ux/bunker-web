import { NavLink } from 'react-router-dom';
import { HomeIcon, CubeIcon, ChartBarIcon, CurrencyDollarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const items = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/products', label: 'Productos', icon: CubeIcon },
  { to: '/sales', label: 'Ventas', icon: ChartBarIcon },
  { to: '/expenses', label: 'Gastos', icon: CurrencyDollarIcon },
  { to: '/settings', label: 'Ajustes', icon: Cog6ToothIcon },
];

export const Sidebar = () => (
  <aside className="w-64 h-screen bg-[#181c23] border-r border-white/5 text-white p-4 hidden md:flex md:flex-col sticky top-0">
    <div className="flex items-center mb-8 px-2 mt-4">
      <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center mr-3 font-bold text-sm">B</div>
      <h2 className="text-xl font-bold tracking-wider">BUNKER</h2>
    </div>
    <nav className="space-y-1 flex-1">
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex items-center px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
            }`
          }
        >
          <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
    <div className="mt-auto px-2 pb-2">
      <div className="text-[11px] text-gray-600 text-center">Bunker Web v1.0</div>
    </div>
  </aside>
);
