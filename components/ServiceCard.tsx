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
    <Card className="relative overflow-hidden bg-[#0a0a0a] backdrop-blur-md border border-white/5 hover:border-green-500/30 transition-all duration-300 group/scard flex flex-col h-full rounded-2xl">
      {/* HUD Accent */}
      <div className="absolute top-0 left-0 w-1 h-0 bg-green-500 group-hover/scard:h-full transition-all duration-500"></div>

      {/* Content Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">Service ID: {service.id.slice(-6)}</span>
              {service.isActive ? (
                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-green-500">
                  <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                  Active
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-[0.2em] text-red-500">
                  <span className="w-1 h-1 rounded-full bg-red-500"></span>
                  Inactive
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white group-hover/scard:text-green-400 transition-colors truncate mb-2 tracking-tight">
              {service.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              {gameName && (
                <span className="text-[9px] font-black uppercase tracking-[0.1em] bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded border border-white/5">
                  {gameName}
                </span>
              )}
              {platformName && (
                <span className="text-[9px] font-black uppercase tracking-[0.1em] bg-white/[0.03] text-gray-400 px-2 py-0.5 rounded border border-white/5">
                  {platformName}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-black text-white tracking-tighter">${service.price}</div>
            <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Fixed Rate</div>
          </div>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 min-h-[32px] leading-relaxed font-medium">
          {service.description || "No description provided."}
        </p>
      </div>

      {/* Details Row */}
      <div className="px-6 py-5 flex items-center gap-6 mt-auto border-t border-white/[0.03] bg-white/[0.01]">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{service.duration}m</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-gray-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{memberCount} Bookings</span>
        </div>

        <div className="ml-auto opacity-0 group-hover/scard:opacity-100 transition-opacity">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-green-500 underline decoration-green-500/30">Sync Status: OK</span>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;
