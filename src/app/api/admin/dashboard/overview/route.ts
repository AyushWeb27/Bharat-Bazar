import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { requireActiveAdmin } from "@/lib/categories";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  Delivered: "#009966",
  Shipped: "#f59e0b",
  Processing: "#3b82f6",
  Cancelled: "#ef4444",
  Returned: "#8b5cf6",
};

function failure(message: string, status: number) {
  return NextResponse.json(
    { success: false, message },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

function normalizedStatus(value: unknown) {
  const status = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (["delivered", "completed"].includes(status)) return "Delivered";
  if (["shipped", "in_transit", "out_for_delivery"].includes(status)) return "Shipped";
  if (["cancelled", "canceled", "refunded"].includes(status)) return "Cancelled";
  return "Processing";
}

function dateLabel(value: unknown) {
  const dateValue = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : String(value).slice(0, 10);
  const date = new Date(`${dateValue}T00:00:00.000Z`);
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid report date returned by database.");
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

function isoDate(value: unknown) {
  const date = value instanceof Date ? value : new Date(String(value));
  if (!Number.isFinite(date.getTime())) throw new Error("Invalid order date returned by database.");
  return date.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    if (!(await requireActiveAdmin(req))) {
      return failure("Unauthorized. Please log in as an administrator.", 401);
    }

    const range = req.nextUrl.searchParams.get("range");
    const days = range === "Today" ? 1 : range === "30D" ? 30 : range === "90D" ? 90 : 7;

    const [summaryRows, statusRows, trendRows, hourlyRows, locationRows, topProductRows, recentOrderRows] =
      await Promise.all([
        sql`
          SELECT
            (SELECT COUNT(*)::INT FROM users) AS total_users,
            (SELECT COUNT(*)::INT FROM admin_categories) AS total_categories,
            (SELECT COUNT(*)::INT FROM admin_group_categories) AS total_category_groups,
            (SELECT COUNT(*)::INT FROM admin_subcategories) AS total_subcategories,
            (SELECT COUNT(*)::INT FROM admin_products) AS total_products,
            (SELECT COUNT(*)::INT FROM admin_brands WHERE active = TRUE) AS total_brands,
            (SELECT COUNT(*)::INT FROM admin_products
              WHERE status = 'active' AND stock = 0) AS sold_out_products,
            (SELECT COUNT(*)::INT FROM admin_products
              WHERE status = 'active' AND stock > 0
                AND low_stock_alert > 0 AND stock <= low_stock_alert) AS low_stock_products,
            (SELECT COUNT(*)::INT FROM customer_orders) AS total_orders,
            (SELECT COUNT(*)::INT FROM customer_order_returns
              WHERE status = 'requested') AS requested_returns,
            COALESCE((
              SELECT SUM(total_amount)
              FROM customer_orders
              WHERE created_at >= ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE::TIMESTAMP
                AT TIME ZONE 'Asia/Kolkata')
                AND created_at < (((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE + 1)::TIMESTAMP
                AT TIME ZONE 'Asia/Kolkata')
                AND LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                  NOT IN ('cancelled', 'canceled', 'refunded')
            ), 0) AS sales_today,
            COALESCE((
              SELECT SUM(total_amount)
              FROM customer_orders
              WHERE created_at >= (((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE - 1)::TIMESTAMP
                AT TIME ZONE 'Asia/Kolkata')
                AND created_at < ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE::TIMESTAMP
                AT TIME ZONE 'Asia/Kolkata')
                AND LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                  NOT IN ('cancelled', 'canceled', 'refunded')
            ), 0) AS sales_yesterday
        `,
        sql`
          SELECT
            CASE
              WHEN LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                IN ('delivered', 'completed') THEN 'Delivered'
              WHEN LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                IN ('shipped', 'in_transit', 'out_for_delivery') THEN 'Shipped'
              WHEN LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                IN ('cancelled', 'canceled', 'refunded') THEN 'Cancelled'
              ELSE 'Processing'
            END AS status_name,
            COUNT(*)::INT AS count
          FROM customer_orders
          GROUP BY status_name
        `,
        sql`
          WITH days AS (
            SELECT generate_series(
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE - (${days} - 1),
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE,
              INTERVAL '1 day'
            )::DATE AS report_date
          )
          SELECT
            days.report_date,
            COUNT(orders.id)::INT AS order_count,
            COALESCE(SUM(orders.total_amount) FILTER (
              WHERE LOWER(REPLACE(REPLACE(BTRIM(orders.status), ' ', '_'), '-', '_'))
                NOT IN ('cancelled', 'canceled', 'refunded')
            ), 0) AS revenue
          FROM days
          LEFT JOIN customer_orders AS orders
            ON orders.created_at >= (days.report_date::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
            AND orders.created_at < ((days.report_date + 1)::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
          GROUP BY days.report_date
          ORDER BY days.report_date
        `,
        sql`
          WITH local_day AS (
            SELECT
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE AS today,
              EXTRACT(HOUR FROM CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::INT AS current_hour
          ),
          hours AS (
            SELECT generate_series(0, local_day.current_hour)::INT AS hour
            FROM local_day
          )
          SELECT
            hours.hour,
            COALESCE(SUM(orders.total_amount) FILTER (
              WHERE LOWER(REPLACE(REPLACE(BTRIM(orders.status), ' ', '_'), '-', '_'))
                NOT IN ('cancelled', 'canceled', 'refunded')
            ), 0) AS sales
          FROM hours
          CROSS JOIN local_day
          LEFT JOIN customer_orders AS orders
            ON orders.created_at >= (local_day.today::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
            AND orders.created_at < ((local_day.today + 1)::TIMESTAMP AT TIME ZONE 'Asia/Kolkata')
            AND EXTRACT(HOUR FROM orders.created_at AT TIME ZONE 'Asia/Kolkata')::INT = hours.hour
          GROUP BY hours.hour
          ORDER BY hours.hour
        `,
        sql`
          SELECT
            COALESCE(NULLIF(BTRIM(shipping_address ->> 'city'), ''), 'Other') AS city,
            COALESCE(SUM(total_amount) FILTER (
              WHERE LOWER(REPLACE(REPLACE(BTRIM(status), ' ', '_'), '-', '_'))
                NOT IN ('cancelled', 'canceled', 'refunded')
            ), 0) AS sales
          FROM customer_orders
          WHERE created_at >= (
              ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE - (${days} - 1))::TIMESTAMP
              AT TIME ZONE 'Asia/Kolkata'
            )
            AND created_at < (
              ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE + 1)::TIMESTAMP
              AT TIME ZONE 'Asia/Kolkata'
            )
          GROUP BY city
          ORDER BY sales DESC, city ASC
          LIMIT 8
        `,
        sql`
          SELECT
            items.product_name AS name,
            COALESCE(NULLIF(products.category, ''), 'Uncategorized') AS category,
            COALESCE(products.stock, 0)::INT AS stock,
            SUM(items.quantity)::INT AS units_sold,
            COALESCE(SUM(items.line_total), 0) AS revenue
          FROM customer_order_items AS items
          JOIN customer_orders AS orders ON orders.id = items.order_id
          LEFT JOIN admin_products AS products ON products.id = items.product_id
          WHERE orders.created_at >= (
              (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE::TIMESTAMP
              AT TIME ZONE 'Asia/Kolkata'
            )
            AND orders.created_at < (
              ((CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE + 1)::TIMESTAMP
              AT TIME ZONE 'Asia/Kolkata'
            )
            AND LOWER(REPLACE(REPLACE(BTRIM(orders.status), ' ', '_'), '-', '_'))
              NOT IN ('cancelled', 'canceled', 'refunded')
          GROUP BY items.product_name, products.category, products.stock
          ORDER BY units_sold DESC, revenue DESC
          LIMIT 5
        `,
        sql`
          SELECT
            orders.order_number,
            orders.status,
            orders.total_amount,
            orders.created_at,
            customers.name AS customer_name,
            COALESCE(item_counts.item_count, 0)::INT AS item_count,
            returns.status AS return_status
          FROM customer_orders AS orders
          JOIN users AS customers ON customers.id = orders.user_id
          LEFT JOIN LATERAL (
            SELECT COUNT(*)::INT AS item_count
            FROM customer_order_items AS items
            WHERE items.order_id = orders.id
          ) AS item_counts ON TRUE
          LEFT JOIN customer_order_returns AS returns ON returns.order_id = orders.id
          ORDER BY orders.created_at DESC, orders.id DESC
          LIMIT 8
        `,
      ]);

    const summary = summaryRows[0];
    const statusCounts = new Map<string, number>();
    for (const row of statusRows) statusCounts.set(String(row.status_name), Number(row.count) || 0);

    const totalOrders = Number(summary.total_orders) || 0;
    const completedOrders = statusCounts.get("Delivered") ?? 0;
    const requestedReturns = Number(summary.requested_returns) || 0;
    const salesToday = Number(summary.sales_today) || 0;
    const salesYesterday = Number(summary.sales_yesterday) || 0;
    const salesChangePercent = salesYesterday > 0
      ? ((salesToday - salesYesterday) / salesYesterday) * 100
      : null;
    const statusDistribution = [
      "Delivered", "Shipped", "Processing", "Cancelled",
      "Returned",
    ].map(name => ({
      name,
      value: name === "Returned" ? requestedReturns : statusCounts.get(name) ?? 0,
      color: STATUS_COLORS[name],
    }));
    const revenueTrend = trendRows.map(row => {
      const reportDate = row.report_date instanceof Date
        ? row.report_date.toISOString().slice(0, 10)
        : String(row.report_date).slice(0, 10);
      return {
        day: dateLabel(reportDate),
        revenue: Math.round((Number(row.revenue) || 0) / 1000) / 100,
        orders: Number(row.order_count) || 0,
      };
    });
    const hourlySales = hourlyRows.map(row => {
      const hour = Number(row.hour) || 0;
      return {
        hour: `${hour % 12 || 12}${hour < 12 ? "am" : "pm"}`,
        sales: Math.round((Number(row.sales) || 0) / 1000) / 100,
      };
    });
    const salesByLocation = locationRows.map(row => ({
      city: String(row.city || "Other"),
      sales: Math.round((Number(row.sales) || 0) / 1000) / 100,
    }));
    const topProducts = topProductRows.map(row => ({
      name: String(row.name || "Product"),
      cat: String(row.category || "Uncategorized"),
      sold: Number(row.units_sold) || 0,
      revenue: Number(row.revenue) || 0,
      stock: Number(row.stock) || 0,
    }));
    const recentOrders = recentOrderRows.map(row => {
      const returnStatus = String(row.return_status || "").toLowerCase();
      const status = ["requested", "approved", "received", "refunded"].includes(returnStatus)
        ? "Returned"
        : normalizedStatus(row.status);
      const customer = String(row.customer_name || "Customer");
      return {
        id: String(row.order_number || ""),
        customer,
        av: customer.split(/\s+/).filter(Boolean).map(part => part[0] ?? "").join("").slice(0, 2).toUpperCase(),
        amount: Number(row.total_amount) || 0,
        items: Number(row.item_count) || 0,
        status,
        createdAt: isoDate(row.created_at),
      };
    });

    return NextResponse.json({
      success: true,
      overview: {
        today: {
          sales: salesToday,
          salesChangePercent: Number.isFinite(salesChangePercent) ? salesChangePercent : null,
        },
        counts: {
          users: Number(summary.total_users) || 0,
          categories: Number(summary.total_categories) || 0,
          categoryGroups: Number(summary.total_category_groups) || 0,
          subcategories: Number(summary.total_subcategories) || 0,
          products: Number(summary.total_products) || 0,
          brands: Number(summary.total_brands) || 0,
          soldOutProducts: Number(summary.sold_out_products) || 0,
          lowStockProducts: Number(summary.low_stock_products) || 0,
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: (statusCounts.get("Processing") ?? 0) + (statusCounts.get("Shipped") ?? 0),
          cancelled: statusCounts.get("Cancelled") ?? 0,
          returned: requestedReturns,
        },
        statusDistribution,
        hourlySales,
        salesByLocation,
        revenueTrend,
        topProducts,
        recentOrders,
        locationCount: salesByLocation.length,
      },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("GET /api/admin/dashboard/overview error:", error);
    return failure("Failed to load the admin dashboard overview.", 500);
  }
}