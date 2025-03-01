import { Purchase, columns } from "./columns";
import { DataTable } from "./data-table";
import { prisma } from "@/lib/db";

async function getPurchases(): Promise<Purchase[]> {
  try {
    const purchases = await prisma.purchase.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        customerId: true,
        containerId: true,
        status: true,
        amount: true,
        paymentMethod: true,
        paymentId: true,
        createdAt: true,
        updatedAt: true,
        shippingAddress: true,
        trackingNumber: true,
        estimatedDelivery: true,
        container: {
          select: {
            title: true,
            price: true,
            size: true,
          },
        },
      },
    });

    return purchases.map((purchase) => ({
      id: purchase.id,
      customerId: purchase.customerId,
      containerId: purchase.containerId,
      status: purchase.status as Purchase["status"],
      amount: parseFloat(purchase.amount.toString()),
      paymentMethod: purchase.paymentMethod || undefined, // Convert null to undefined
      paymentId: purchase.paymentId || undefined, // Convert null to undefined
      createdAt: new Date(purchase.createdAt),
      updatedAt: new Date(purchase.updatedAt),
      shippingAddress: purchase.shippingAddress || undefined, // Convert null to undefined
      trackingNumber: purchase.trackingNumber || undefined, // Convert null to undefined
      estimatedDelivery: purchase.estimatedDelivery 
        ? new Date(purchase.estimatedDelivery) 
        : undefined,
      container: purchase.container ? {
        title: purchase.container.title,
        price: parseFloat(purchase.container.price.toString()),
        size: purchase.container.size,
      } : undefined,
    }));
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return [];
  }
}

export default async function DemoPage() {
  // const data = getData();
  const purchases = await getPurchases();

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold mb-4">Requested Quotes</h1>
      <div className="container mx-auto py-10">
        {purchases.length > 0 ? (
          <DataTable columns={columns} data={purchases} />
        ) : (
          <div className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 text-lg">No purchases found</p>
            <p className="text-gray-400">
            Purchases will appear here once customers complete them
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
