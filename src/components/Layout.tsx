import { Outlet, NavLink } from 'react-router-dom';
import { Home, LayoutList, CalendarCheck, BarChart2, Settings as SettingsIcon } from 'lucide-react';
import clsx from 'clsx';

export const Layout = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/boards', icon: LayoutList, label: 'Boards' },
    { to: '/followups', icon: CalendarCheck, label: 'Follow-Ups' },
    { to: '/stats', icon: BarChart2, label: 'Stats' },
    { to: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0A192F]">
      <main className="flex-1 overflow-y-auto pb-20 no-scrollbar">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#112240] border-t border-[#233554] safe-area-pb z-40">
        <div className="flex justify-around items-center h-16 px-2 md:max-w-md md:mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors',
                  isActive ? 'text-[#FFC107]' : 'text-gray-400 hover:text-gray-200'
                )
              }
            >
              <item.icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
