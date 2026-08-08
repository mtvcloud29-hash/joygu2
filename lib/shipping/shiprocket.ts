import type { CreateShipmentInput, ShipmentResult, ShippingProvider } from "@/lib/shipping/types";
const baseUrl = () => process.env.SHIPROCKET_API_BASE_URL ?? "https://apiv2.shiprocket.in/v1/external";
<<<<<<< HEAD
let tokenCache: { token: string; expiresAt: number } | null = null;
async function token() { if (tokenCache && tokenCache.expiresAt > Date.now()) return tokenCache.token; const email = process.env.SHIPROCKET_EMAIL; const password = process.env.SHIPROCKET_PASSWORD; if (!email || !password) throw new Error("Shiprocket credentials are not configured."); const response = await fetch(`${baseUrl()}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" }); if (!response.ok) throw new Error(`Shiprocket authentication failed (${response.status}).`); const data = await response.json() as { token?: string }; if (!data.token) throw new Error("Shiprocket did not return an access token."); tokenCache = { token: data.token, expiresAt: Date.now() + 23 * 60 * 60 * 1000 }; return data.token; }
async function api<T>(path: string, init: RequestInit) { const response = await fetch(`${baseUrl()}${path}`, { ...init, headers: { "content-type": "application/json", Authorization: `Bearer ${await token()}`, ...(init.headers ?? {}) }, cache: "no-store" }); const data = await response.json().catch(() => ({})) as T & { message?: string; error?: string }; if (!response.ok) throw new Error(`Shiprocket ${path} failed: ${data.message ?? data.error ?? response.status}`); return data; }
export class ShiprocketProvider implements ShippingProvider { readonly name = "SHIPROCKET"; async createShipment(input: CreateShipmentInput) { const data = await api<{ order_id?: number; shipment_id?: number }>("/orders/create/adhoc", { method: "POST", body: JSON.stringify({ order_id: input.orderNumber, order_date: new Date().toISOString().slice(0, 16).replace("T", " "), pickup_location: input.pickupLocation, billing_customer_name: input.customerName, billing_last_name: "", billing_address: input.address.line1, billing_city: input.address.city, billing_pincode: input.address.pincode, billing_state: input.address.state, billing_country: input.address.country ?? "India", billing_email: input.email, billing_phone: input.phone, shipping_is_billing: true, order_items: input.items.map((item) => ({ name: item.name, sku: item.sku ?? item.name, units: item.quantity, selling_price: item.price, discount: 0, tax: 0, hsn: "" })), payment_method: input.paymentMethod === "COD" ? "COD" : "Prepaid", sub_total: input.subtotal, length: 10, breadth: 10, height: 10, weight: input.weight }) }); return { providerShipmentId: String(data.shipment_id ?? data.order_id ?? ""), status: "CREATED" as const, raw: data }; }
  async assignAwb(shipmentId: string, courierId?: number) { const data = await api<{ response?: { data?: { awb_code?: string; courier_name?: string } } }>("/courier/generate/awb", { method: "POST", body: JSON.stringify({ shipment_id: Number(shipmentId), courier_id: courierId }) }); const result = data.response?.data; return { providerShipmentId: shipmentId, awb: result?.awb_code, courier: result?.courier_name, status: "AWB_ASSIGNED" as const, raw: data }; }
  async schedulePickup(shipmentId: string) { const data = await api<unknown>("/courier/generate/pickup", { method: "POST", body: JSON.stringify({ shipment_id: [Number(shipmentId)] }) }); return { providerShipmentId: shipmentId, status: "PICKUP_SCHEDULED" as const, raw: data }; }
  async getTracking(awb: string) { const data = await api<{ tracking_data?: { track_status?: number; shipment_status?: string; track_url?: string } }>(`/courier/track/awb/${encodeURIComponent(awb)}`, { method: "GET" }); return { awb, trackingUrl: data.tracking_data?.track_url, status: "IN_TRANSIT" as const, raw: data }; }
  async cancelShipment(awb: string) { const data = await api<unknown>("/orders/cancel/shipment/awbs", { method: "POST", body: JSON.stringify({ awbs: [awb] }) }); return { awb, status: "CANCELLED" as const, raw: data }; }
}
export function getShippingProvider(): ShippingProvider { if (process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD) return new ShiprocketProvider(); throw new Error("No shipping provider credentials are configured."); }
=======
const tokenCache: Record<string, { token: string; expiresAt: number }> = {};
function cacheKey(email: string, password: string) { return `${email}:${password}`; }
async function authToken(email: string, password: string) { const key = cacheKey(email, password); const cached = tokenCache[key]; if (cached && cached.expiresAt > Date.now()) return cached.token; const response = await fetch(`${baseUrl()}/auth/login`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, password }), cache: "no-store" }); const data = await response.json().catch(() => ({})) as { token?: string; message?: string; error?: string }; if (!response.ok) throw new Error(`Shiprocket authentication failed: ${data.message ?? data.error ?? response.status}`); if (!data.token) throw new Error("Shiprocket did not return an access token."); tokenCache[key] = { token: data.token, expiresAt: Date.now() + 23 * 60 * 60 * 1000 }; return data.token; }
async function api<T>(path: string, init: RequestInit, email: string, password: string) { const token = await authToken(email, password); const response = await fetch(`${baseUrl()}${path}`, { ...init, headers: { "content-type": "application/json", Authorization: `Bearer ${token}`, ...(init.headers ?? {}) }, cache: "no-store" }); const data = await response.json().catch(() => ({})) as T & { message?: string; error?: string }; if (!response.ok) throw new Error(`Shiprocket ${path} failed: ${data.message ?? data.error ?? response.status}`); return data; }
export class ShiprocketProvider implements ShippingProvider {
  readonly name = "SHIPROCKET";
  constructor(private email: string, private password: string) {}
  async testConnection() { await authToken(this.email, this.password); return "Shiprocket connection successful."; }
  async createShipment(input: CreateShipmentInput) {
    const payload = {
      order_id: input.orderNumber,
      order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
      pickup_location: input.pickupLocation,
      billing_customer_name: input.customerName,
      billing_last_name: "",
      billing_address: input.address.line1,
      billing_city: input.address.city,
      billing_pincode: input.address.pincode,
      billing_state: input.address.state,
      billing_country: input.address.country ?? "India",
      billing_email: input.email,
      billing_phone: input.phone,
      shipping_is_billing: true,
      order_items: input.items.map((item) => ({ name: item.name, sku: item.sku ?? item.name, units: item.quantity, selling_price: item.price, discount: 0, tax: 0, hsn: "" })),
      payment_method: input.paymentMethod === "COD" ? "COD" : "Prepaid",
      sub_total: input.subtotal,
      length: 10,
      breadth: 10,
      height: 10,
      weight: input.weight,
    } as const;
    const data = await api<{ order_id?: number; shipment_id?: number }>("/orders/create/adhoc", { method: "POST", body: JSON.stringify(payload) }, this.email, this.password);
    return {
      providerShipmentId: String(data.shipment_id ?? data.order_id ?? ""),
      shiprocketOrderId: data.order_id ? String(data.order_id) : undefined,
      shiprocketShipmentId: data.shipment_id ? String(data.shipment_id) : undefined,
      status: "CREATED" as const,
      raw: data,
    };
  }
  async assignAwb(shipmentId: string, courierId?: number) {
    const data = await api<{ response?: { data?: { awb_code?: string; courier_name?: string } } }>("/courier/generate/awb", { method: "POST", body: JSON.stringify({ shipment_id: Number(shipmentId), courier_id: courierId }) }, this.email, this.password);
    const result = data.response?.data;
    return { providerShipmentId: shipmentId, awb: result?.awb_code, courier: result?.courier_name, status: "AWB_ASSIGNED" as const, raw: data };
  }
  async schedulePickup(shipmentId: string) {
    const data = await api<unknown>("/courier/generate/pickup", { method: "POST", body: JSON.stringify({ shipment_id: [Number(shipmentId)] }) }, this.email, this.password);
    return { providerShipmentId: shipmentId, status: "PICKUP_SCHEDULED" as const, raw: data };
  }
  async getTracking(awb: string) {
    const data = await api<{ tracking_data?: { track_status?: number; shipment_status?: string; track_url?: string } }>(`/courier/track/awb/${encodeURIComponent(awb)}`, { method: "GET" }, this.email, this.password);
    return { awb, trackingUrl: data.tracking_data?.track_url, status: "IN_TRANSIT" as const, raw: data };
  }
  async cancelShipment(awb: string) {
    const data = await api<unknown>("/orders/cancel/shipment/awbs", { method: "POST", body: JSON.stringify({ awbs: [awb] }) }, this.email, this.password);
    return { awb, status: "CANCELLED" as const, raw: data };
  }
}
export function getShippingProvider(email?: string, password?: string): ShippingProvider {
  const riderEmail = email ?? process.env.SHIPROCKET_EMAIL;
  const riderPassword = password ?? process.env.SHIPROCKET_PASSWORD;
  if (!riderEmail || !riderPassword) throw new Error("No Shiprocket credentials are configured.");
  return new ShiprocketProvider(riderEmail, riderPassword);
}
>>>>>>> c5c08d70c3339368c786db8aec452e0478facf79
