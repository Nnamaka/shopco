"use client";

import { useEffect, useState } from "react";
// import housesData from "@/data/houses";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Loader, Trash2,Loader2, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// Container size enum to match Prisma model
enum ContainerSize {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
  EXTRA_LARGE = "EXTRA_LARGE",
  CUSTOM = "CUSTOM",
}

// Interface for specifications
interface Specification {
  name: string;
  value: string;
}

interface Container {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  size: ContainerSize;
  condition: string;
  location: string;
  isAvailable: boolean;
  manufacturerInfo?: string;
  yearManufactured?: number;
  specifications?: Specification[];
  supplierId?: string;
}

export default function HousesPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(
    null
  );
  const [newContainer, setNewContainer] = useState({
    title: "",
    description: "",
    price: "",
    images: [] as string[],
    size: ContainerSize.MEDIUM,
    condition: "",
    location: "",
    isAvailable: true,
    manufacturerInfo: "",
    yearManufactured: "",
    specifications: [] as Specification[],
    supplierId: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [tempUploadedImages, setTempUploadedImages] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // new
  const [newSpec, setNewSpec] = useState({
    name: "",
    value: "",
  });

  useEffect(() => {
    const fetchContainers = async () => {
      const res = await fetch("/api/containers", {
        method: "GET",
      });
      const data = await res.json();
      setContainers(data);
    };
    fetchContainers();
  }, []);

  useEffect(() => {
    const handleCleanup = async () => {
      if (isCreating) return; // Prevent deletion if house is being created

      if (!isOpen && tempUploadedImages.length > 0) {
        console.log("deleting images");
        await Promise.all(
          tempUploadedImages.map(async (imageUrl) => {
            const fileName = imageUrl.split("/").pop();
            if (fileName) {
              await supabase.storage.from("shopco").remove([fileName]);
            }
          })
        );
        setTempUploadedImages([]);
      }

      setNewContainer({
        title: "",
        description: "",
        price: "",
        images: [],
        size: ContainerSize.MEDIUM,
        condition: "",
        location: "",
        isAvailable: true,
        manufacturerInfo: "",
        yearManufactured: "",
        specifications: [],
        supplierId: "",
      });
    };
    if (!isOpen) {
      handleCleanup();
    }
  }, [isOpen, isCreating, tempUploadedImages]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value =
      e.target.type === "number"
        ? parseFloat(e.target.value) || 0
        : e.target.value;
    setNewContainer({ ...newContainer, [e.target.name]: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewContainer({ ...newContainer, isAvailable: checked });
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setIsLoading(true);
      try {
        const res = await fetch("/api/containers", { method: "GET" });
        const data = await res.json();
        setContainers(data);
      } catch {
        console.error("Error fetching containers..");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);

    try {
      const term = searchTerm.trim();

      // Check if the search term looks like a UUID (container ID)
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          term
        );

      if (isUuid) {
        // Search by ID
        const filteredContainer = containers.find(
          (container) => container.id === term
        );
        if (filteredContainer) {
          setContainers([filteredContainer]);
        } else {
          setContainers([]);
        }
      } else {
        // Try to convert to number for price search
        const priceValue = parseFloat(term);

        if (!isNaN(priceValue)) {
          // Search by price
          const filteredContainers = containers.filter(
            (container) => container.price === priceValue
          );
          setContainers(filteredContainers);
        } else {
          // Search by title or size (case-insensitive partial match)
          const filteredContainers = containers.filter(
            (container) =>
              container.title.toLowerCase().includes(term.toLowerCase()) ||
              container.size.toLowerCase().includes(term.toLowerCase())
          );
          setContainers(filteredContainers);
        }
      }

      // Add a small delay to make the loading state visible (optional)
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch {
      console.error("Error during search..");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isLoading) {
      handleSearch();
    }
  };

  const handleClearSearch = async () => {
    setSearchTerm("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/containers", { method: "GET" });
      const data = await res.json();
      setContainers(data);
    } catch {
      console.error("Error clearing search...");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (value: string) => {
    setNewContainer({ ...newContainer, size: value as ContainerSize });
  };

  const handleSpecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewSpec({ ...newSpec, [e.target.name]: e.target.value });
  };

  const handleAddSpec = () => {
    if (!newSpec.name.trim() || !newSpec.value.trim()) return;

    const spec: Specification = {
      name: newSpec.name.trim(),
      value: newSpec.value.trim(),
    };

    setNewContainer({
      ...newContainer,
      specifications: [...newContainer.specifications, spec],
    });

    // Reset form
    setNewSpec({ name: "", value: "" });
  };

  // Remove a specification
  const handleRemoveSpec = (index: number) => {
    const updatedSpecs = [...newContainer.specifications];
    updatedSpecs.splice(index, 1);
    setNewContainer({ ...newContainer, specifications: updatedSpecs });
  };

  // Handle selected container specification changes
  const handleSelectedContainerSpecChange = (
    specIndex: number,
    field: "name" | "value",
    value: string
  ) => {
    if (!selectedContainer) return;

    const updatedSpecs = [...(selectedContainer.specifications || [])];

    updatedSpecs[specIndex] = {
      ...updatedSpecs[specIndex],
      [field]: value,
    };

    setSelectedContainer({
      ...selectedContainer,
      specifications: updatedSpecs,
    });
  };

  const handleAddSpecToSelected = () => {
    if (!selectedContainer || !newSpec.name.trim() || !newSpec.value.trim())
      return;

    const spec: Specification = {
      name: newSpec.name.trim(),
      value: newSpec.value.trim(),
    };

    setSelectedContainer({
      ...selectedContainer,
      specifications: [...(selectedContainer.specifications || []), spec],
    });

    // Reset form
    setNewSpec({ name: "", value: "" });
  };

  // Remove specification from selected container
  const handleRemoveSpecFromSelected = (index: number) => {
    if (!selectedContainer) return;

    const updatedSpecs = [...(selectedContainer.specifications || [])];
    updatedSpecs.splice(index, 1);

    setSelectedContainer({
      ...selectedContainer,
      specifications: updatedSpecs,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setIsUploading(true);
      const files = Array.from(e.target.files);
      const uploadedUrls: string[] = [];

      try {
        for (const file of files) {
          const fileName = `${crypto.randomUUID()}-${file.name.replace(
            /\s/g,
            "_"
          )}`;
          console.log("uploading to supabase");
          const { error } = await supabase.storage
            .from("shopco")
            .upload(fileName, file);

          if (error) {
            console.error("Upload error:", error);
          } else {
            const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/house/${fileName}`;
            uploadedUrls.push(publicUrl);
          }
        }

        // track these as temporary upload
        setTempUploadedImages((prev) => [...prev, ...uploadedUrls]);
        const target = selectedContainer ? selectedContainer : newContainer;
        const updatedImages = [...target.images, ...uploadedUrls];

        if (selectedContainer) {
          setSelectedContainer({ ...selectedContainer, images: updatedImages });
        } else {
          setNewContainer({ ...newContainer, images: updatedImages });
        }

        // setNewHouse({
        //   ...newHouse,
        //   images: [...newHouse.images, ...uploadedUrls],
        // });
      } catch (error) {
        console.error("Error uploading images", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleCreateContainer = async () => {
    if (!newContainer.title || !newContainer.price) return;
    setIsCreating(true);

    try {
      console.log("Posting container...");
      const res = await fetch("/api/containers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newContainer,
          price: parseFloat(newContainer.price),
          yearManufactured: newContainer.yearManufactured
            ? parseInt(newContainer.yearManufactured)
            : null,
          specifications: newContainer.specifications.length
            ? newContainer.specifications
            : null,
        }),
      });

      if (res.ok) {
        const createdContainer = await res.json();
        setContainers([...containers, createdContainer]);

        // Clear temporary uploads as they're now properly associated with a container
        setTempUploadedImages([]);
        setNewContainer({
          title: "",
          description: "",
          price: "",
          images: [],
          size: ContainerSize.MEDIUM,
          condition: "",
          location: "",
          isAvailable: true,
          manufacturerInfo: "",
          yearManufactured: "",
          specifications: [],
          supplierId: "",
        });
        setIsOpen(false);
      }
    } catch (error) {
      console.log("Error creating container: ", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClickContainer = (container: Container) => {
    setSelectedContainer({
      ...container,
      specifications: container.specifications || [],
    });
  };

  const handleDeleteContainer = async () => {
    if (!selectedContainer) return;
    setIsDeleting(true);

    try {
      for (const imageUrl of selectedContainer.images) {
        // Extract filename from the URL
        const fileName = imageUrl.split("/").pop();
        if (fileName) {
          const { error } = await supabase.storage
            .from("shopco")
            .remove([fileName]);

          if (error) {
            console.error("Error deleting image from storage:", error);
            // Continue with other deletions even if one fails
          }
        }
      }

      const res = await fetch(`/api/containers?id=${selectedContainer.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContainers(
          containers.filter(
            (container) => container.id !== selectedContainer.id
          )
        );
        setSelectedContainer(null);
      }
    } catch (error) {
      console.error("Error deleting container: ", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedContainer) return;
    setIsSaving(true);

    try {
      const updatedContainer = {
        ...selectedContainer,
        specifications: selectedContainer.specifications || undefined,
      };

      const res = await fetch(`/api/containers?id=${selectedContainer.id}`, {
        method: "PUT",
        body: JSON.stringify(updatedContainer),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        setContainers(
          containers.map((container) =>
            container.id === selectedContainer.id ? updatedContainer : container
          )
        );
        setSelectedContainer(null);
      } else {
        console.log("Error trying to update page");
      }
    } catch (error) {
      console.error("Error saving changes: ", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (imageUrl: string, containerId: string) => {
    // Extract filename from the URL
    const fileName = imageUrl.split("/").pop();
    if (!fileName) return;

    try {
      // Delete from Supabase storage
      const { error } = await supabase.storage
        .from("shopco")
        .remove([fileName]);

      if (error) {
        console.error("Error deleting from storage:", error);
        return;
      }

      // Update the container in your database
      const updatedContainer = {
        ...selectedContainer!,
        images: selectedContainer!.images.filter((img) => img !== imageUrl),
      };

      const res = await fetch(`/api/containers/${containerId}`, {
        method: "PUT",
        body: JSON.stringify(updatedContainer),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        // Update local state
        setSelectedContainer(updatedContainer);
        setContainers(
          containers.map((container) =>
            container.id === containerId ? updatedContainer : container
          )
        );
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Houses</h1>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsOpen(false);
          }
        }}
      >
        <DialogTrigger asChild>
          <Button className="mb-4" onClick={() => setIsOpen(true)}>
            Add New Container
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Container</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 pr-4">
            <div>
              <Label>Title</Label>
              <Input
                type="text"
                name="title"
                value={newContainer.title}
                onChange={handleChange}
                placeholder="Container title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                name="description"
                value={newContainer.description}
                onChange={handleChange}
                placeholder="Describe the container"
              />
            </div>

            <div>
              <Label>Price ($)</Label>
              <Input
                type="number"
                name="price"
                value={newContainer.price}
                onChange={handleChange}
                placeholder="Container price"
              />
            </div>

            <div>
              <Label>Size</Label>
              <Select
                value={newContainer.size}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select container size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContainerSize.SMALL}>Small</SelectItem>
                  <SelectItem value={ContainerSize.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={ContainerSize.LARGE}>Large</SelectItem>
                  <SelectItem value={ContainerSize.EXTRA_LARGE}>
                    Extra Large
                  </SelectItem>
                  <SelectItem value={ContainerSize.CUSTOM}>Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Condition</Label>
              <Input
                type="text"
                name="condition"
                value={newContainer.condition}
                onChange={handleChange}
                placeholder="Container condition"
              />
            </div>

            <div>
              <Label>Location</Label>
              <Input
                type="text"
                name="location"
                value={newContainer.location}
                onChange={handleChange}
                placeholder="Current location"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={newContainer.isAvailable}
                onCheckedChange={handleSwitchChange}
                id="isAvailable"
              />
              <Label htmlFor="isAvailable">Available for Purchase</Label>
            </div>

            <div>
              <Label>Manufacturer Info</Label>
              <Textarea
                name="manufacturerInfo"
                value={newContainer.manufacturerInfo}
                onChange={handleChange}
                placeholder="Manufacturer details"
              />
            </div>

            <div>
              <Label>Year Manufactured</Label>
              <Input
                type="number"
                name="yearManufactured"
                value={newContainer.yearManufactured}
                onChange={handleChange}
                placeholder="Year of manufacture"
              />
            </div>

            <div>
              <Label>Supplier ID (Optional)</Label>
              <Input
                type="text"
                name="supplierId"
                value={newContainer.supplierId}
                onChange={handleChange}
                placeholder="Supplier ID"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex justify-between items-center">
                <span>Specifications</span>
              </Label>

              {newContainer.specifications.length > 0 && (
                <div className="border rounded-md p-3 mb-3 space-y-3">
                  {newContainer.specifications.map((spec, idx) => (
                    <div key={idx} className="p-2 bg-gray-50 rounded relative">
                      <h4 className="font-medium">{spec.name}</h4>
                      <p className="text-sm text-gray-600">{spec.value}</p>
                      <button
                        onClick={() => handleRemoveSpec(idx)}
                        className="absolute top-2 right-2 text-red-500"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="border rounded-md p-3 space-y-2">
                <div>
                  <Label className="text-sm">Specification Name</Label>
                  <Input
                    type="text"
                    name="name"
                    value={newSpec.name}
                    onChange={handleSpecChange}
                    placeholder="e.g., Dimensions, Material, Weight"
                  />
                </div>
                <div>
                  <Label className="text-sm">Specification Value</Label>
                  <Input
                    type="text"
                    name="value"
                    value={newSpec.value}
                    onChange={handleSpecChange}
                    placeholder="e.g., 40ft, Steel, 3000kg"
                  />
                </div>
                <Button
                  type="button"
                  onClick={handleAddSpec}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Specification
                </Button>
              </div>
            </div>

            <div>
              <Label>Upload Images</Label>
              <div className="relative">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                {isUploading && (
                  <div className="absolute right-2 top-2">
                    <Loader className="w-5 h-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-2">
                {newContainer.images
                  ? newContainer.images.map((src, index) => (
                      <Image
                        key={index}
                        src={src}
                        width={160} // Example: Set the actual width of your image
                        height={160}
                        alt="Container Preview"
                        className="w-full h-16 object-cover rounded-lg"
                        unoptimized={true}
                      />
                    ))
                  : []}
              </div>
            </div>

            <Button
              onClick={handleCreateContainer}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <Loader className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isCreating ? "Creating..." : "Create House"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex mb-4 gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search by ID, price, title or size"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="pr-8"
          />
          {searchTerm && !isLoading && (
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={handleClearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
            </div>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isLoading}>
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>

      {/* Message when no containers are found */}
      {containers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No containers found with: {searchTerm}
        </div>
      )}
      <ul className="space-y-4">
        {containers.map((container) => (
          <li
            key={container.id}
            className="p-4 bg-white shadow rounded-lg cursor-pointer"
            onClick={() => handleClickContainer(container)}
          >
            <h3 className="text-lg font-semibold">{container.title}</h3>
            <p>Price: ${container.price.toLocaleString()}</p>
            <div className="flex flex-wrap gap-2 mt-1">
              <span
                className={`text-xs px-2 py-1 rounded ${
                  container.isAvailable
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {container.isAvailable ? "Available" : "Unavailable"}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {container.size}
              </span>
              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {container.condition}
              </span>
            </div>
            <p className="text-sm text-gray-600">{container.description}</p>
            {container.specifications &&
              container.specifications.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Specifications:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {container.specifications.map((spec, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {spec.name}: {spec.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            <div className="flex gap-2 mt-2">
              {container.images?.slice(0, 3).map((img, index) => (
                <Image
                  key={index}
                  src={img}
                  width={160} // Example: Set the actual width of your image
                  height={160}
                  alt={container.title}
                  loading="lazy"
                  className="w-16 h-16 object-cover rounded-lg"
                />
              ))}
            </div>
          </li>
        ))}
      </ul>
      {selectedContainer && (
        <Dialog
          open={!!selectedContainer}
          onOpenChange={() => setSelectedContainer(null)}
        >
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Container</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 pr-4">
              <div>
                <Label>Title</Label>
                <Input
                  type="text"
                  value={selectedContainer?.title || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={selectedContainer.price}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  name="description"
                  value={selectedContainer?.description || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Size</Label>
                <Select
                  value={selectedContainer.size}
                  onValueChange={(value) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      size: value as ContainerSize,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select container size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ContainerSize.SMALL}>Small</SelectItem>
                    <SelectItem value={ContainerSize.MEDIUM}>Medium</SelectItem>
                    <SelectItem value={ContainerSize.LARGE}>Large</SelectItem>
                    <SelectItem value={ContainerSize.EXTRA_LARGE}>
                      Extra Large
                    </SelectItem>
                    <SelectItem value={ContainerSize.CUSTOM}>Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Condition</Label>
                <Input
                  type="text"
                  value={selectedContainer?.condition || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      condition: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  type="text"
                  value={selectedContainer?.location || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      location: e.target.value,
                    })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={selectedContainer.isAvailable}
                  onCheckedChange={(checked) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      isAvailable: checked,
                    })
                  }
                  id="editIsAvailable"
                />
                <Label htmlFor="editIsAvailable">Available for Purchase</Label>
              </div>

              <div>
                <Label>Manufacturer Info</Label>
                <Textarea
                  value={selectedContainer?.manufacturerInfo || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      manufacturerInfo: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label>Year Manufactured</Label>
                <Input
                  type="number"
                  value={selectedContainer?.yearManufactured || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      yearManufactured: parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div>
                <Label>Supplier ID</Label>
                <Input
                  type="text"
                  value={selectedContainer?.supplierId || ""}
                  onChange={(e) =>
                    setSelectedContainer({
                      ...selectedContainer,
                      supplierId: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="flex justify-between items-center">
                  <span>Specifications</span>
                </Label>

                {selectedContainer.specifications &&
                  selectedContainer.specifications.length > 0 && (
                    <div className="border rounded-md p-3 mb-3 space-y-3">
                      {selectedContainer.specifications.map((spec, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-gray-50 rounded relative"
                        >
                          <Input
                            className="mb-1"
                            value={spec.name}
                            onChange={(e) =>
                              handleSelectedContainerSpecChange(
                                idx,
                                "name",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            value={spec.value}
                            onChange={(e) =>
                              handleSelectedContainerSpecChange(
                                idx,
                                "value",
                                e.target.value
                              )
                            }
                            placeholder="Specification value"
                          />
                          <button
                            onClick={() => handleRemoveSpecFromSelected(idx)}
                            className="absolute top-2 right-2 text-red-500"
                            type="button"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                <div className="border rounded-md p-3 space-y-2">
                  <div>
                    <Label className="text-sm">Specification Name</Label>
                    <Input
                      type="text"
                      name="name"
                      value={newSpec.name}
                      onChange={handleSpecChange}
                      placeholder="e.g., Dimensions, Material, Weight"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Specification Value</Label>
                    <Input
                      type="text"
                      name="value"
                      value={newSpec.value}
                      onChange={handleSpecChange}
                      placeholder="e.g., 40ft, Steel, 3000kg"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={handleAddSpecToSelected}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Specification
                  </Button>
                </div>
              </div>

              <div>
                <Label>Images</Label>
                <div className="mb-4 relative">
                  <Input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {isUploading && (
                    <div className="absolute right-2 top-2">
                      <Loader className="w-5 h-5 animate-spin" />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  {selectedContainer.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <Image
                        src={imageUrl}
                        width={0}
                        height={0}
                        sizes="100vw"
                        alt={`Container image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        unoptimized={true}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(imageUrl, selectedContainer.id);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  onClick={handleSaveChanges}
                  className="bg-green-500"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isSaving ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={handleDeleteContainer}
                  className="bg-red-500"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  {isDeleting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
