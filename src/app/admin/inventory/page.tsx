'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import {
  recordInventoryMovement,
  subscribeToAdminProducts,
  subscribeToAllOrders,
  subscribeToInventoryMovements,
  type CustomerOrder,
  type InventoryMovement,
  type InventoryMovementType,
} from '@/lib/firestore';
import type { CatalogProduct } from '@/data/catalog';
import { useAuth } from '../../components/AuthProvider';
import { AdminPortalFrame } from '../AdminPortalFrame';

const paidStatuses = ['paid', 'preparing', 'out-for-delivery', 'delivered'];

function money(value: number) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(value);
}

function getDate(value: unknown) {
  if (value && typeof value === 'object' && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toLocaleDateString('en-KE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  return 'Just now';
}

export default function InventoryPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<InventoryMovementType>('incoming');
  const [quantity, setQuantity] = useState(12);
  const [unitCost, setUnitCost] = useState(0);
  const [reason, setReason] = useState('');
  const [linkedOrderId, setLinkedOrderId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const unsubscribers = [
      subscribeToAdminProducts(setProducts, (productsError) => setError(`Products could not load: ${productsError.message}`)),
      subscribeToAllOrders(setOrders, (ordersError) => setError(`Orders could not load: ${ordersError.message}`)),
      subscribeToInventoryMovements(setMovements, (movementError) => setError(`Inventory could not load: ${movementError.message}`)),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const selectedProduct = products.find((product) => product.id === selectedProductId);

  const inventoryRows = useMemo(() => {
    return products.map((product) => {
      const productMovements = movements.filter((movement) => movement.productId === product.id);
      const incoming = productMovements.filter((movement) => movement.type === 'incoming').reduce((sum, movement) => sum + movement.quantity, 0);
      const manualOutgoing = productMovements.filter((movement) => movement.type === 'outgoing').reduce((sum, movement) => sum + movement.quantity, 0);
      const adjustment = productMovements.filter((movement) => movement.type === 'adjustment').reduce((sum, movement) => sum + movement.quantity, 0);
      const incomingCost = productMovements
        .filter((movement) => movement.type === 'incoming')
        .reduce((sum, movement) => sum + movement.quantity * movement.unitCost, 0);
      const soldQuantity = orders
        .filter((order) => paidStatuses.includes(order.status))
        .flatMap((order) => order.items ?? [])
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + item.quantity, 0);
      const revenue = orders
        .filter((order) => paidStatuses.includes(order.status))
        .flatMap((order) => order.items ?? [])
        .filter((item) => item.productId === product.id)
        .reduce((sum, item) => sum + (item.price ?? 0) * item.quantity, 0);
      const stockOnHand = incoming + adjustment - manualOutgoing - soldQuantity;
      const averageUnitCost = incoming > 0 ? incomingCost / incoming : 0;

      return {
        product,
        incoming,
        manualOutgoing,
        soldQuantity,
        adjustment,
        stockOnHand,
        revenue,
        averageUnitCost,
        stockValue: Math.max(0, stockOnHand) * averageUnitCost,
      };
    });
  }, [movements, orders, products]);

  const summary = useMemo(() => {
    return {
      products: inventoryRows.length,
      lowStock: inventoryRows.filter((row) => row.stockOnHand <= 5).length,
      stockValue: inventoryRows.reduce((sum, row) => sum + row.stockValue, 0),
      revenue: inventoryRows.reduce((sum, row) => sum + row.revenue, 0),
    };
  }, [inventoryRows]);

  const submitMovement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    setError('');

    if (!user || !selectedProduct) return;

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    setIsSaving(true);

    try {
      await recordInventoryMovement(user, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        sku: selectedProduct.sku,
        type: movementType,
        quantity,
        unitCost,
        reason: reason || `${movementType} stock movement`,
        linkedOrderId,
      });
      setNotice(`${movementType} movement saved for ${selectedProduct.name}.`);
      setQuantity(12);
      setUnitCost(0);
      setReason('');
      setLinkedOrderId('');
    } catch (movementError) {
      setError(movementError instanceof Error ? movementError.message : 'Could not save stock movement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPortalFrame
      activeSection="inventory"
      title="Track inventory against revenue."
      description="Record incoming stock, compare it with outgoing paid orders, and keep stock value visible."
      actions={<Link href="/admin?section=products" className="w-fit bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]">Manage products</Link>}
    >
      {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}
      {notice ? <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div> : null}

      <div className="grid gap-5">
        <div className="grid border-y border-stone-300 bg-white sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Products', summary.products, 'Catalog items monitored'],
            ['Low stock', summary.lowStock, 'Five units or fewer'],
            ['Stock value', money(summary.stockValue), 'Based on incoming unit cost'],
            ['Matched revenue', money(summary.revenue), 'Paid order item totals'],
          ].map(([label, value, detail], index) => (
            <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''}`}>
              <p className="text-2xl font-semibold text-[#ae2f34]">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{label}</p>
              <p className="mt-1 text-xs text-stone-500">{detail}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={submitMovement} className="border border-stone-300 bg-white p-5 xl:sticky xl:top-6 xl:self-start">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Stock record</p>
            <h2 className="mt-2 font-serif text-3xl font-semibold">Record movement</h2>
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Product
                <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]">
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>{product.name}</option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Movement type
                <select value={movementType} onChange={(event) => setMovementType(event.target.value as InventoryMovementType)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]">
                  <option value="incoming">Incoming stock</option>
                  <option value="outgoing">Manual outgoing stock</option>
                  <option value="adjustment">Adjustment</option>
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Quantity
                  <input type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-stone-700">
                  Unit cost
                  <input type="number" value={unitCost} onChange={(event) => setUnitCost(Number(event.target.value))} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]" />
                </label>
              </div>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Linked order ID
                <input value={linkedOrderId} onChange={(event) => setLinkedOrderId(event.target.value)} className="border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]" placeholder="Optional" />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-stone-700">
                Reason
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="resize-none border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#ae2f34]" placeholder="Supplier delivery, shrinkage, order correction..." />
              </label>

              <button disabled={isSaving || !selectedProduct} className="bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60">
                {isSaving ? 'Saving...' : 'Save movement'}
              </button>
            </div>
          </form>

          <section className="bg-white">
            <div className="mb-3 flex flex-col justify-between gap-2 border-b border-stone-300 pb-2 md:flex-row md:items-end">
              <div>
                <h2 className="text-lg font-semibold">Inventory position</h2>
                <p className="mt-0.5 text-sm text-stone-500">Incoming stock minus manual outgoing stock and paid order quantities.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#584140]">
                  <span>Product</span>
                  <span>Incoming</span>
                  <span>Sold</span>
                  <span>Manual out</span>
                  <span>On hand</span>
                  <span>Revenue</span>
                </div>
                {inventoryRows.map((row) => (
                  <div key={row.product.id} className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-3 border-b border-stone-200 px-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold text-stone-950">{row.product.name}</p>
                      <p className="mt-1 text-xs text-stone-500">{row.product.sku}</p>
                    </div>
                    <p>{row.incoming}</p>
                    <p>{row.soldQuantity}</p>
                    <p>{row.manualOutgoing}</p>
                    <p className={`font-semibold ${row.stockOnHand <= 5 ? 'text-[#ae2f34]' : 'text-[#006a65]'}`}>{row.stockOnHand}</p>
                    <p className="font-semibold text-[#8c1520]">{money(row.revenue)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <section className="border border-stone-300 bg-white p-5">
          <h2 className="text-lg font-semibold">Recent stock movements</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {movements.slice(0, 9).map((movement) => (
              <article key={movement.id} className="border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-stone-950">{movement.productName}</p>
                    <p className="mt-1 text-xs text-stone-500">{getDate(movement.createdAt)}</p>
                  </div>
                  <span className="border border-[#e0bfbd] bg-[#fff5f0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1520]">{movement.type}</span>
                </div>
                <p className="mt-3 text-sm text-stone-700">Qty {movement.quantity} / Cost {money(movement.unitCost)}</p>
                <p className="mt-2 text-xs leading-5 text-stone-500">{movement.reason}</p>
              </article>
            ))}
            {movements.length === 0 ? <p className="text-sm text-stone-600">No inventory movements recorded yet.</p> : null}
          </div>
        </section>
      </div>
    </AdminPortalFrame>
  );
}
