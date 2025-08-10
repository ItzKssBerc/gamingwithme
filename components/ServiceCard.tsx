
import React from 'react';

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
}

const ServiceCard: React.FC<ServiceCardProps> = ({ service, memberCount }) => {
  return (
    <div className="border rounded-lg p-4 flex flex-col justify-between h-full">
      <div>
        <h3 className="text-lg font-bold truncate">{service.title}</h3>
        <p className="text-sm text-gray-500 h-10 overflow-hidden">{service.description}</p>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <span className="font-bold">${service.price}</span>
          <span className="text-sm text-gray-500"> / {service.duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{memberCount} members</span>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${service.isActive ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
