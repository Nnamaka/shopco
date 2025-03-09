"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface ContainerCardProps {
  id: string; // Add id
  title: string;
  price: number;
  images: string[]; // Use array of images
  description: string; // Add description
  condition: string; // Add condition
  location: string; // Add location
  size: string; // Add size
}

export function ContainerCard({
  id,
  title,
  price,
  images,
  description,
  condition,
  location,
  size,
}: ContainerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const router = useRouter();

  return (
    <div className="bg-dark-800 rounded-lg overflow-hidden">
      <div
        className="relative aspect-square"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Image
          src={isHovered && images.length > 1 ? images[1] : images[0]}
          alt={title}
          fill
          priority
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-black">{title}</h3>
        <p className="text-gray-400 mb-2">${price}</p>
        <p className="text-gray-500 text-sm mb-2">
          {size}, {condition}
        </p>
        <p className="text-gray-500 text-sm mb-2">{location}</p>
        <p className="text-gray-500 text-sm mb-2">
          {description.substring(0, 100)}...
        </p>
        <Button
          className="w-full cursor-pointer"
          variant="outline"
          onClick={() => router.push(`/containers/${id}`)}
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
