import React from 'react';
import { Card } from './ui/card';
import { Clock, Users, Globe, Trash2, Edit2, Calendar } from 'lucide-react';

interface ServiceCardProps {
  service: {
    id: string;
    title: string;
    description: string;
    price: number;
    duration: number;
    isActive: boolean;
  };
  memberCount: number;
  onDelete: (id: string) => void;
  gameName?: string | null;
  platformName?: string | null;
  gamePlatform?: string | null;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, memberCount, onDelete, gameName, platformName, gamePlatform }) => {
  return (
    <Card className="relative overflow-hidden bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-green-400/50 transition-all duration-500 group/scard flex flex-col h-full shadow-2xl">
      {/* Decorative Background Gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover/scard:bg-green-400/20 transition-colors duration-500"></div>

      {/* Content Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-white group-hover/scard:text-green-400 transition-colors truncate mb-1">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {gameName && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-green-500/20 text-green-400 px-2 py-0.5 rounded border border-green-500/30">
                  {gameName}
                </span>
              )}
              {platformName && (
                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                  {platformName}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-black text-white">$ {service.price}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">per session</div>
          </div>
        </div>

        <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] leading-relaxed">
          {service.description || "No description provided."}
        </p>
      </div>

      {/* Details Row */}
      <div className="px-6 py-4 flex items-center gap-6 mt-auto">
        <div className="flex items-center gap-2 text-gray-300">
          <Clock className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium">{service.duration}m</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="w-4 h-4 text-green-400" />
          <span className="text-xs font-medium">{memberCount} Bookings</span>
        </div>
        <div className="ml-auto">
          <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${service.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${service.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            {service.isActive ? 'Live' : 'Hidden'}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
