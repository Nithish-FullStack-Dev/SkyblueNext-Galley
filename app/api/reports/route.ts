import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportType = searchParams.get("reportType");
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const search = searchParams.get("search") || "";
  
  // parse dates
  let dateFilter: any = {};
  if (startDateStr && endDateStr && startDateStr !== 'undefined' && endDateStr !== 'undefined') {
    const start = new Date(startDateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(23, 59, 59, 999);
    dateFilter = {
      gte: start,
      lte: end,
    };
  }

  try {
    if (reportType === "flights") {
      const status = searchParams.get("status") || "Completed";
      
      const flights = await prisma.flightOrder.findMany({
        where: {
          status: status as any,
          flightNumber: { contains: search, mode: "insensitive" },
          ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
        },
        include: {
          items: true,
          restoredItems: true,
        },
        orderBy: { date: "desc" },
      });
      
      return NextResponse.json(flights);
    }
    
    if (reportType === "inventory") {
      const type = searchParams.get("type") || "grocery"; // or "food"
      
      const items = await prisma.orderItem.findMany({
        where: {
          type: type,
          name: { contains: search, mode: "insensitive" },
          order: {
            status: { in: ["Completed", "Delivered"] },
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          }
        },
        include: {
          order: true,
        }
      });
      
      // Fetch restored items for the matching orders
      const orderIds = [...new Set(items.map(i => i.orderId))];
      const restoredItems = await prisma.restoredItem.findMany({
        where: {
          flightOrderId: { in: orderIds },
        }
      });

      // Group restored items by orderId + itemId
      const restoredMap: Record<string, number> = {};
      restoredItems.forEach(ri => {
        const key = `${ri.flightOrderId}_${ri.itemId}`;
        restoredMap[key] = (restoredMap[key] || 0) + ri.returnedQty;
      });

      // Group by name
      const grouped = items.reduce((acc, item) => {
        if (!acc[item.name]) {
          acc[item.name] = {
            name: item.name,
            totalLoaded: 0,
            totalRestored: 0,
            totalConsumed: 0,
            flightIds: new Set(),
          };
        }
        
        const restoredQty = restoredMap[`${item.orderId}_${item.id}`] || item.restoredQuantity || 0;

        acc[item.name].totalLoaded += item.quantity;
        acc[item.name].totalRestored += restoredQty;
        
        const consumed = item.consumedQuantity > 0 
          ? item.consumedQuantity 
          : (item.quantity - restoredQty);
          
        acc[item.name].totalConsumed += consumed;
        acc[item.name].flightIds.add(item.orderId);
        
        return acc;
      }, {} as Record<string, any>);
      
      const result = Object.values(grouped).map((g: any) => ({
        name: g.name,
        totalLoaded: g.totalLoaded,
        totalRestored: g.totalRestored,
        totalConsumed: g.totalConsumed,
        flightsUsed: g.flightIds.size,
      }));
      
      return NextResponse.json(result);
    }

    if (reportType === "vendors") {
      const items = await prisma.orderItem.findMany({
        where: {
          vendorName: { not: null, contains: search, mode: "insensitive" },
          order: {
            status: { in: ["Completed", "Delivered"] },
            ...(Object.keys(dateFilter).length > 0 ? { date: dateFilter } : {}),
          }
        },
        include: {
          order: true,
        }
      });

      // Group by vendorName
      const grouped = items.reduce((acc, item) => {
        const vendor = item.vendorName || "Unknown Vendor";
        if (!acc[vendor]) {
          acc[vendor] = {
            vendorName: vendor,
            totalItemsDelivered: 0,
            totalFlights: new Set(),
            flights: {}
          };
        }
        
        acc[vendor].totalItemsDelivered += item.quantity;
        acc[vendor].totalFlights.add(item.orderId);
        
        if (!acc[vendor].flights[item.orderId]) {
          acc[vendor].flights[item.orderId] = {
            order: item.order,
            items: []
          };
        }
        
        acc[vendor].flights[item.orderId].items.push({
          name: item.name,
          quantity: item.quantity,
          price: item.price
        });
        
        return acc;
      }, {} as Record<string, any>);

      const result = Object.values(grouped).map((g: any) => ({
        vendorName: g.vendorName,
        totalQty: g.totalItemsDelivered,
        flightsCount: g.totalFlights.size,
        flights: Object.values(g.flights).map((f: any) => ({
           flightId: f.order.id,
           flightNumber: f.order.flightNumber,
           date: f.order.date,
           route: `${f.order.departure} → ${f.order.arrival}`,
           items: f.items,
           totalAmount: f.items.reduce((sum: number, i: any) => sum + ((i.price || 0) * (i.quantity || 0)), 0)
        })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      }));

      result.sort((a, b) => a.vendorName.localeCompare(b.vendorName));

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
