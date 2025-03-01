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

export type QuoteRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customizationRequests: string;
  status: "pending" | "processing" | "success" | "failed";
  preferredFinancing?: "CASH" | "MORTGAGE" | "LEASE_TO_OWN" | "UNDECIDED";
  desiredMoveInDate?: Date;
  estimatedBudget?: number;
};

const QuoteDetailsModal = ({
  quote,
  isOpen,
  onClose,
}: {
  quote: QuoteRequest | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!quote) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Quote Request Details</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium">Contact Information</h3>
              <p>
                Name: {quote.firstName} {quote.lastName}
              </p>
              <p>Email: {quote.email}</p>
              <p>Phone: {quote.phone}</p>
            </div>
            <div>
              <h3 className="font-medium">Quote Status</h3>
              <p className="capitalize">{quote.status}</p>
            </div>
          </div>
          <div>
            <h3 className="font-medium">Customization Requests</h3>
            <p className="whitespace-pre-wrap">{quote.customizationRequests}</p>
          </div>
          {quote.preferredFinancing && (
            <div>
              <h3 className="font-medium">Financing Details</h3>
              <p>Preferred Financing: {quote.preferredFinancing}</p>
              {quote.estimatedBudget && (
                <p>
                  Estimated Budget: ${quote.estimatedBudget.toLocaleString()}
                </p>
              )}
              {quote.desiredMoveInDate && (
                <p>
                  Desired Move-in Date:{" "}
                  {new Date(quote.desiredMoveInDate).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ActionCell = ({ quoteRequest }: { quoteRequest: QuoteRequest }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleDeleteQuote = async (id: string) => {
    if (confirm("Are you sure you want to delete this quote request?")) {
      try {
        const response = await fetch(`/api/quote-requests/${id}`, {
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
            onClick={() => navigator.clipboard.writeText(quoteRequest.id)}
          >
            Copy Quote ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowDetails(true)}>
            View Quote Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />

          {/* Delete Quote Request */}
          <DropdownMenuItem
            className="text-red-500"
            onClick={() => {
              handleDeleteQuote(quoteRequest.id);
              console.log("clicked on delete post");
            }}
          >
            Delete Quote Request
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <QuoteDetailsModal
        quote={quoteRequest}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export const columns: ColumnDef<QuoteRequest>[] = [
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
    accessorKey: "firstName",
    header: "First Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("firstName")}</div>
    ),
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("lastName")}</div>
    ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => <div>{row.getValue("phone")}</div>,
  },
  {
    accessorKey: "customizationRequests",
    header: "Customization Requests",
    cell: ({ row }) => (
      <div className="truncate w-48">
        {row.getValue("customizationRequests")}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="capitalize">{row.getValue("status")}</div>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => <ActionCell quoteRequest={row.original} />,
  },
];
