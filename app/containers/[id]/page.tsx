"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import Footer from "@/components/Footer";
// import NavBar from "@/components/Navbar";
import {
  Ruler,
  PackageCheck,
  MapPin,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

interface Container {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  size: string;
  condition: string;
  location: string;
  isAvailable: boolean;
  manufacturerInfo: string | null;
  yearManufactured: number | null;
  specifications: any | null;
}

// interface FormattedSpec {
//   heading: string;
//   content: string;
// }

export default function ContainerDetailPage() {
  const { id } = useParams();
  const [container, setContainer] = useState<Container | null>(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("");
  const [isMobile, setIsMobile] = useState(false);
  // const [needsTruncation, setNeedsTruncation] = useState(false);

  // const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  // Format container size for display
  function formatContainerSize(size: string): string {
    return size
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  // Truncate function
  function truncateText(
    text: string,
    desktopLimit: number = 11,
    mobileLimit = 6
  ) {
    // const limit = isMobile ? mobileLimit : desktopLimit;
    const limit = isMobile ? mobileLimit : desktopLimit;
    const needsTruncation = text && text.length > limit;
    // setNeedsTruncation(!!needsTruncation)
    const displayText = needsTruncation
      ? `${text.substring(0, limit)}...`
      : text;

    //   if (!text || text.length <= limit) return text;

    //   return `${text.substring(0, limit)}...`;
    return displayText;
  }

  function parseSpecifications(
    specifications: any
  ): { heading: string; content: string }[] {
    // Check if specifications is a string that needs to be parsed
    if (typeof specifications === "string") {
      try {
        specifications = JSON.parse(specifications);
      } catch (e) {
        console.error("Failed to parse specifications JSON:", e);
        return [];
      }
    }

    // If specifications is not an array or is empty, return empty array
    if (!Array.isArray(specifications) || specifications.length === 0) {
      return [];
    }

    // Map each specification object to our desired format
    return specifications.map((spec) => {
      // Make sure we have both name and value properties
      if (
        !spec ||
        typeof spec !== "object" ||
        !("name" in spec) ||
        !("value" in spec)
      ) {
        return { heading: "Unknown", content: "Not specified" };
      }

      // Format the heading (capitalize if needed)
      const heading = spec.name.replace(/\b\w/g, (char: string) =>
        char.toUpperCase()
      );

      // Handle different value types
      let content: string;
      if (spec.value === null || spec.value === undefined) {
        content = "Not specified";
      } else if (typeof spec.value === "boolean") {
        content = spec.value ? "Yes" : "No";
      } else {
        content = String(spec.value);
      }

      return { heading, content };
    });
  }
  // Image navigation functions
  const showNextImage = useCallback(() => {
    if (!container) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === container.images.length - 1 ? 0 : prevIndex + 1
    );
  }, [container]);

  const showPrevImage = useCallback(() => {
    if (!container) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? container.images.length - 1 : prevIndex - 1
    );
  }, [container]);

  // Open image viewer with specific image
  const openImageViewer = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageViewer) return;

      if (e.key === "ArrowRight") {
        showNextImage();
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      } else if (e.key === "Escape") {
        setShowImageViewer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    // Prevent body scroll when modal is open
    if (showImageViewer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [showImageViewer, showNextImage, showPrevImage]);

  useEffect(() => {
    // Function to check if viewport is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typical md breakpoint
    };

    // Check on initial load
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch container data
  useEffect(() => {
    async function fetchContainer() {
      try {
        const res = await fetch(`/api/containers/${id}`);
        const data = await res.json();
        setContainer(data);

        // Set initial tab if specifications exist
        if (data.specifications) {
          setActiveTab("Specifications");
        } else if (data.manufacturerInfo) {
          setActiveTab("Manufacturer");
        } else {
          setActiveTab("Description");
        }
      } catch (error) {
        console.error("Error fetching container:", error);
      }
    }

    if (id) fetchContainer();
  }, [id]);

  // Handle buy container
  const handleBuyContainer = async () => {
    // Implementation for buying the container
    alert(`Redirecting to purchase page for ${container?.title}`);
    // Here you would typically navigate to a checkout page
    // or show a payment form
  };

  if (!container) return <p className="text-center mt-2">Loading Container</p>;

  return (
    <div className="max-w-6xl mx-auto p-6 flex flex-col gap-14">
      {/* <NavBar /> */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <h1 className="text-3xl font-bold mb-4">{container.title}</h1>

        <div
          className="relative w-full h-[60vh] mb-8 rounded-lg overflow-hidden cursor-pointer"
          onClick={() => openImageViewer(0)}
        >
          <Image
            src={container.images[0] || "/placeholder.svg"}
            alt={container.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {container.images.slice(1).map((image, i) => (
            <div
              key={i}
              className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => openImageViewer(i + 1)}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Container image ${i + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>

        {/* Image Viewer Modal */}
        {showImageViewer && container.images.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close button */}
              <button
                onClick={() => setShowImageViewer(false)}
                className="absolute top-4 right-4 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-60 z-10"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Main image */}
              <div className="relative w-4/5 h-4/5">
                <Image
                  src={
                    container.images[currentImageIndex] || "/placeholder.svg"
                  }
                  alt={`Image ${currentImageIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="80vw"
                />
              </div>

              {/* Navigation arrows */}
              <button
                onClick={showPrevImage}
                className="absolute left-4 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-60"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>

              <button
                onClick={showNextImage}
                className="absolute right-4 text-white bg-black bg-opacity-40 p-2 rounded-full hover:bg-opacity-60"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-40 px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {container.images.length}
              </div>
            </div>
          </div>
        )}

        {/* Container Specifications Section */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold">SPECIFICATIONS</h2>
          <div className="mt-4 border rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex justify-between border-b pb-2">
                <span className="text-blue-600 font-medium">Size</span>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold cursor-help">
                          {truncateText(formatContainerSize(container.size))}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{formatContainerSize(container.size)}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Ruler className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-blue-600 font-medium">Condition</span>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold cursor-help">
                          {truncateText(container.condition)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{container.condition}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <PackageCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-600 font-medium">Location</span>
                <div className="flex items-center gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-semibold cursor-help">
                          {truncateText(container.location)}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{container.location}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <MapPin className="w-4 h-4" />
                </div>
              </div>
              {container.yearManufactured && (
                <div className="flex justify-between">
                  <span className="text-blue-600 font-medium">Year</span>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-semibold cursor-help">
                            {truncateText(String(container.yearManufactured))}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{container.yearManufactured}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <CalendarClock className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="mb-12">
          {/* Tabs for different sections */}
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="w-full flex flex-wrap mb-8">
              <TabsTrigger value="Description" className="flex-grow">
                Description
              </TabsTrigger>
              {container.specifications && (
                <TabsTrigger value="Specifications" className="flex-grow">
                  Detailed Specifications
                </TabsTrigger>
              )}
              {container.manufacturerInfo && (
                <TabsTrigger value="Manufacturer" className="flex-grow">
                  Manufacturer Info
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="Description" className="border rounded-md p-4">
              <p className="text-lg">{container.description}</p>
            </TabsContent>

            {container.specifications && (
              <TabsContent
                value="Specifications"
                className="border rounded-md p-4"
              >
                <h2 className="text-2xl font-bold mb-4">
                  Technical Specifications
                </h2>
                <div className="divide-y border-t border-gray-300">
                  {parseSpecifications(container.specifications).map(
                    (spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between py-3 border-b border-gray-200"
                      >
                        <p className="font-semibold text-gray-800">
                          {spec.heading}
                        </p>
                        <p className="mt-1 text-gray-700">{spec.content}</p>
                      </div>
                    )
                  )}
                </div>
              </TabsContent>
            )}

            {container.manufacturerInfo && (
              <TabsContent
                value="Manufacturer"
                className="border rounded-md p-4"
              >
                <h3 className="text-lg font-medium mb-4">
                  Manufacturer Information
                </h3>
                <p className="text-lg">{container.manufacturerInfo}</p>
              </TabsContent>
            )}
          </Tabs>
        </section>

        {/* Buy Button */}
        <div className="flex items-center justify-between mb-10">
          <Button
            className="mb-5 bg-green-600 hover:bg-green-700"
            onClick={handleBuyContainer}
            disabled={!container.isAvailable}
          >
            {container.isAvailable ? "Buy" : "Not Available"}
          </Button>
          <div className="text-2xl font-bold">
            ${container.price.toLocaleString()}
          </div>
        </div>
      </main>
    </div>
  );
}
