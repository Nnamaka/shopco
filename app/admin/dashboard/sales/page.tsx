import { QuoteRequest, columns } from "./columns";
import { DataTable } from "./data-table";
import { prisma } from "@/lib/db";

async function getQuotes(): Promise<QuoteRequest[]> {
  try {
    const quotes = await prisma.quoteRequest.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        customizationRequests: true,
        status: true,
        createdAt: true,
      },
    });

    // return quotes;
    return quotes.map((quote) => ({
      ...quote,
      status: quote.status.toLowerCase() as
        | "pending"
        | "processing"
        | "success"
        | "failed",
    }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

export default async function DemoPage() {
  // const data = getData();
  const quotes = await getQuotes();

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Requested Quotes</h1>
      <div className="container mx-auto py-10">
        {quotes.length > 0 ? (
          <DataTable columns={columns} data={quotes} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 text-lg">No quote requests found</p>
            <p className="text-gray-400">
              Quote requests will appear here once customers submit them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
