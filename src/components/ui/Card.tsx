import type { ReactNode } from 'react';

interface CardProps {
  title: string;
  value?: string | number;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export const Card = ({ title, value, subtitle, icon, children, className = '' }: CardProps) => {
  return (
    <div className={`bg-[#22262f] border border-white/5 rounded-xl p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-400">{title}</h3>
          {value !== undefined && (
            <div className="mt-2 text-2xl font-bold tracking-tight text-white">{value}</div>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 bg-blue-600/10 text-blue-400 rounded-lg">
            {icon}
          </div>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
};
