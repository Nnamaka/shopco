"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type Purchase = {
  id: string;
  customerId: string;
  containerId: string;
  status:
    | "PENDING"
    | "PAYMENT_RECEIVED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  amount: number;
  paymentMethod?: string;
  paymentId?: string;
  createdAt: Date;
  updatedAt: Date;
  shippingAddress?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  container?: {
    title: string;
    price: number;
    size: "SMALL" | "MEDIUM" | "LARGE" | "EXTRA_LARGE" | "CUSTOM";
  };
};
const PurchaseDetailsModal = ({
  purchase,
  isOpen,
  onClose,
}: {
  purchase: Purchase | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!purchase) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Purchase Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Purchase Information</h3>
              <p>Purchase ID: {purchase.id}</p>
              <p>Customer ID: {purchase.customerId}</p>
              <p>Container ID: {purchase.containerId}</p>
              {purchase.container && (
                <p>
                  Container: {purchase.container.title} (
                  {purchase.container.size})
                </p>
              )}
            </div>
            <div>
              <h3 className="font-medium">Purchase Status</h3>
              <p className="capitalize">{purchase.status.toLowerCase()}</p>
              <p>Amount: ${purchase.amount.toLocaleString()}</p>
              <p>
                Created: {new Date(purchase.createdAt).toLocaleDateString()}
              </p>
              <p>
                Updated: {new Date(purchase.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {(purchase.paymentMethod || purchase.paymentId) && (
            <div>
              <h3 className="font-medium">Payment Details</h3>
              {purchase.paymentMethod && (
                <p>Payment Method: {purchase.paymentMethod}</p>
              )}
              {purchase.paymentId && <p>Payment ID: {purchase.paymentId}</p>}
            </div>
          )}

          {(purchase.shippingAddress ||
            purchase.trackingNumber ||
            purchase.estimatedDelivery) && (
            <div>
              <h3 className="font-medium">Shipping Details</h3>
              {purchase.shippingAddress && (
                <p className="whitespace-pre-wrap">
                  Shipping Address: {purchase.shippingAddress}
                </p>
              )}
              {purchase.trackingNumber && (
                <p>Tracking Number: {purchase.trackingNumber}</p>
              )}
              {purchase.estimatedDelivery && (
                <p>
                  Estimated Delivery:{" "}
                  {new Date(purchase.estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ActionCell = ({ purchase }: { purchase: Purchase }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDeleteQuote = async (id: string) => {
    if (confirm("Are you sure you want to delete this quote request?")) {
      try {
        const response = await fetch(`/api/purchases/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete quote request");
        }

        // Refresh the page or update the table data
        window.location.reload();
      } catch (error) {
        console.error("Error deleting quote request:", error);
        alert("Failed to delete quote request.");
      }
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => navigator.clipboard.writeText(purchase.id)}
          >
            Copy Purchase ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            View Purchase Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Delete Purchase */}
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              handleDeleteQuote(purchase.id);
              console.log("clicked on delete post");
            }}
          >
            Delete Purchase
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <PurchaseDetailsModal
        purchase={purchase}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export const columns: ColumnDef<Purchase>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Purchase ID",
    cell: ({ row }) => (
      <div className="font-medium truncate w-32">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "customerID",
    header: "Customer ID",
    cell: ({ row }) => (
      <div className="capitalize truncate w-32">
        {row.getValue("customerId")}
      </div>
    ),
  },
  {
    accessorKey: "container.title",
    header: "Container",
    cell: ({ row }) => {
      const container = row.original.container;
      return container ? <div>{container.title}</div> : <div>-</div>;
    },
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Amount
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div>{formatted}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">
        {(row.getValue("status") as string).toLowerCase()}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Date
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell purchase={row.original} />,
  },
];
