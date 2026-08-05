import { prisma } from "@/lib/prisma";
import { InventoryReason } from "@prisma/client";

export type InventoryAdjustmentInput = { productId: string; variantId?: string; warehouseId?: string; quantityChanged: number; reason: InventoryReason; notes?: string; userId?: string; batchId?: string };
export async function adjustInventory(input: InventoryAdjustmentInput) {
  if (!Number.isInteger(input.quantityChanged) || input.quantityChanged === 0) throw new Error("Quantity change must be a non-zero integer.");
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: input.productId } });
    if (!product) throw new Error("Product not found.");
    let previousStock: number;
    let newStock: number;
    if (input.variantId) {
      const variant = await tx.productVariant.findUnique({ where: { id: input.variantId } });
      if (!variant || variant.productId !== input.productId) throw new Error("Variant not found.");
      previousStock = variant.stock; newStock = previousStock + input.quantityChanged;
      if (newStock < 0) throw new Error("Stock cannot become negative.");
      await tx.productVariant.update({ where: { id: input.variantId }, data: { stock: newStock } });
    } else {
      previousStock = product.stock; newStock = previousStock + input.quantityChanged;
      if (newStock < 0) throw new Error("Stock cannot become negative.");
      await tx.product.update({ where: { id: input.productId }, data: { stock: newStock } });
    }
    if (input.warehouseId) {
      const existing = await tx.warehouseStock.findFirst({ where: { warehouseId: input.warehouseId, productId: input.productId, variantId: input.variantId ?? null } });
      if (existing) { const next = existing.onHand + input.quantityChanged; if (next < 0) throw new Error("Warehouse stock cannot become negative."); await tx.warehouseStock.update({ where: { id: existing.id }, data: { onHand: next } }); }
      else if (input.quantityChanged > 0) await tx.warehouseStock.create({ data: { warehouseId: input.warehouseId, productId: input.productId, variantId: input.variantId, onHand: input.quantityChanged } });
      else throw new Error("Warehouse stock record does not exist.");
    }
    return tx.inventoryHistory.create({ data: { productId: input.productId, variantId: input.variantId, warehouseId: input.warehouseId, batchId: input.batchId, previousStock, newStock, quantityChanged: input.quantityChanged, reason: input.reason, notes: input.notes, userId: input.userId } });
  });
}

export async function createPurchase(input: { supplierId: string; warehouseId: string; invoiceNumber: string; purchaseDate: Date; notes?: string; createdById?: string; items: Array<{ productId: string; variantId?: string; quantity: number; purchasePrice: number; gst: number; batchNumber: string }> }) {
  return prisma.$transaction(async (tx) => {
    const purchase = await tx.purchase.create({ data: { supplierId: input.supplierId, invoiceNumber: input.invoiceNumber, purchaseDate: input.purchaseDate, notes: input.notes, createdById: input.createdById, status: "RECEIVED", total: input.items.reduce((sum, item) => sum + item.quantity * item.purchasePrice + item.gst, 0) } });
    for (const item of input.items) {
      const batch = await tx.batch.create({ data: { batchNumber: item.batchNumber, supplierId: input.supplierId, warehouseId: input.warehouseId, productId: item.productId, variantId: item.variantId, quantity: item.quantity, remainingQuantity: item.quantity, purchasePrice: item.purchasePrice, purchaseDate: input.purchaseDate } });
      await tx.purchaseItem.create({ data: { purchaseId: purchase.id, productId: item.productId, variantId: item.variantId, warehouseId: input.warehouseId, batchId: batch.id, quantity: item.quantity, purchasePrice: item.purchasePrice, gst: item.gst } });
      const product = await tx.product.findUnique({ where: { id: item.productId } }); if (!product) throw new Error("Product not found.");
      if (item.variantId) { const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } }); if (!variant) throw new Error("Variant not found."); await tx.productVariant.update({ where: { id: item.variantId }, data: { stock: { increment: item.quantity } } }); await tx.inventoryHistory.create({ data: { productId: item.productId, variantId: item.variantId, warehouseId: input.warehouseId, batchId: batch.id, previousStock: variant.stock, newStock: variant.stock + item.quantity, quantityChanged: item.quantity, reason: "PURCHASE_ENTRY", notes: `Purchase ${input.invoiceNumber}`, userId: input.createdById } }); }
      else { await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } }); await tx.inventoryHistory.create({ data: { productId: item.productId, warehouseId: input.warehouseId, batchId: batch.id, previousStock: product.stock, newStock: product.stock + item.quantity, quantityChanged: item.quantity, reason: "PURCHASE_ENTRY", notes: `Purchase ${input.invoiceNumber}`, userId: input.createdById } }); }
      const existing = await tx.warehouseStock.findFirst({ where: { warehouseId: input.warehouseId, productId: item.productId, variantId: item.variantId ?? null } }); if (existing) await tx.warehouseStock.update({ where: { id: existing.id }, data: { onHand: { increment: item.quantity } } }); else await tx.warehouseStock.create({ data: { warehouseId: input.warehouseId, productId: item.productId, variantId: item.variantId, onHand: item.quantity } });
    }
    return purchase;
  });
}
