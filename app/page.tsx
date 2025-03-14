"use client";

import { useState, useEffect } from "react";
// import { useRouter } from 'next/router';
// import { Container } from '@prisma/client';
import { ContainerCard } from "@/components/containerCard";
import { AutoSliderBanner } from "@/components/auto-slider-banner";
// import { Decimal } from '@prisma/client/runtime/library';

interface Container {
  id: string;
  title: string;
  price: number;
  images: string[];
  description: string;
  condition: string;
  location: string;
  size: string;
}

export default function Home() {
  const [containers, setContainers] = useState<Container[]>([]);
  // const router = useRouter();

  useEffect(() => {
    async function fetchContainers() {
      try {
        const res = await fetch("/api/containers");
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setContainers(data);
      } catch (error) {
        console.error("Error fetching containers:", error);
      }
    }
    fetchContainers();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <AutoSliderBanner />

      {/* Product Section */}
      <section
        id="product-section"
        className="w-full py-12 md:py-24 bg-dark-900"
      >
        <div className="container mx-auto px-4">
          <h2 className="mb-8 text-3xl font-bold text-center text-black">
            Containers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {containers.map((container) => {
              const newContainer = {
                ...container,
                price: container.price,
              };
              return <ContainerCard key={container.id} {...newContainer} />;
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
