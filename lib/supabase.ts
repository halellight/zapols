import { createClient } from "@supabase/supabase-js";

export type DbOrder = {
  id?: string;
  order_id: string;
  created_at?: string;
  customer_name: string;
  customer_location: string;
  summary: string;
  notes?: string;
  total: number;
  payment_method: string;
  packaging: string;
  pickup_code: string;
  status: "pending" | "packed" | "delivered";
  items_json?: any;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes("your-project-id") &&
  supabaseUrl.startsWith("http")
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function saveOrderToSupabase(order: DbOrder): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from("orders").insert([order]);
    if (error) {
      console.error("Supabase insert error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to save to Supabase:", err);
    return false;
  }
}

export async function fetchOrdersFromSupabase(): Promise<DbOrder[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      console.error("Supabase select error:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Failed to fetch from Supabase:", err);
    return [];
  }
}

export async function updateOrderStatusInSupabase(
  orderId: string,
  status: "pending" | "packed" | "delivered"
): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("order_id", orderId);
    if (error) {
      console.error("Supabase update error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to update status in Supabase:", err);
    return false;
  }
}

export async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from("orders")
      .delete()
      .eq("order_id", orderId);
    if (error) {
      console.error("Supabase delete error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to delete order from Supabase:", err);
    return false;
  }
}
