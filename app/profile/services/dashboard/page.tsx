"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../../components/ui/button";
import { Separator } from "../../../../components/ui/separator";
import ServiceCard from "../../../../components/ServiceCard";

// A more robust Service interface, allowing for potentially null relations
interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration: number;
  isActive: boolean;
  game: {
    name: string;
    icon?: string;
  } | null;
  platform: {
    name: string;
    icon?: string;
  } | null;
  _count: {
    orders: number;
  };
}

// A simple loading spinner component for better UX
const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-12" style={{ minHeight: '300px' }}>
    <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

const ServicesDashboard = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/user/services");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch services");
        }
        
        setServices(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
        setError(errorMessage);
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const renderContent = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-red-200 bg-red-50 rounded-lg mt-6">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 mb-4">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <p className="text-xl font-semibold text-red-600">Failed to load services</p>
          <p className="text-red-500 mt-2">{error}</p>
        </div>
      );
    }

    if (services.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg mt-6 bg-gray-50/50">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h2 className="text-xl font-semibold">You have no services yet</h2>
          <p className="text-muted-foreground mt-2">Get started by creating your first service offering.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            memberCount={service._count.orders}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground mt-1">View and manage your offered services.</p>
        </div>
        <Button onClick={() => router.push("/profile/services/new")}>
          Create New Service
        </Button>
      </div>
      <Separator />
      {renderContent()}
    </div>
  );
};

export default ServicesDashboard;
