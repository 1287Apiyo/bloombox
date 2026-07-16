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
import {
  AdminAlert,
  AdminFormCard,
  AdminPanel,
  AdminPortalFrame,
  AdminStatStrip,
} from '../AdminPortalFrame';

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

const fieldCls =
  'border border-stone-300 px-3 py-2 font-normal text-black outline-none focus:border-[#ae2f34]';

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
      subscribeToAdminProducts(setProducts, (e) => setError(`Products could not load: ${e.message}`)),
      subscribeToAllOrders(setOrders, (e) => setError(`Orders could not load: ${e.message}`)),
      subscribeToInventoryMovements(setMovements, (e) => setError(`Inventory could not load: ${e.message}`)),
    ];
    return () => unsubscribers.forEach((u) => u());
  }, []);

  useEffect(() => {
    if (!selectedProductId && products.length > 0) setSelectedProductId(products[0].id);
  }, [products, selectedProductId]);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const inventoryRows = useMemo(() => {
    return products.map((product) => {
      const productMovements = movements.filter((m) => m.productId === product.id);
      const incoming = productMovements.filter((m) => m.type === 'incoming').reduce((s, m) => s + m.quantity, 0);
      const manualOutgoing = productMovements.filter((m) => m.type === 'outgoing').reduce((s, m) => s + m.quantity, 0);
      const adjustment = productMovements.filter((m) => m.type === 'adjustment').reduce((s, m) => s + m.quantity, 0);
      const incomingCost = productMovements
        .filter((m) => m.type === 'incoming')
        .reduce((s, m) => s + m.quantity * m.unitCost, 0);
      const soldQuantity = orders
        .filter((o) => paidStatuses.includes(o.status))
        .flatMap((o) => o.items ?? [])
        .filter((i) => i.productId === product.id)
        .reduce((s, i) => s + i.quantity, 0);
      const revenue = orders
        .filter((o) => paidStatuses.includes(o.status))
        .flatMap((o) => o.items ?? [])
        .filter((i) => i.productId === product.id)
        .reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);
      const stockOnHand = incoming + adjustment - manualOutgoing - soldQuantity;
      const averageUnitCost = incoming > 0 ? incomingCost / incoming : 0;

      return {
        product,
        incoming,
        manualOutgoing,
        soldQuantity,
        stockOnHand,
        revenue,
        stockValue: Math.max(0, stockOnHand) * averageUnitCost,
      };
    });
  }, [movements, orders, products]);

  const summary = useMemo(
    () => ({
      products: inventoryRows.length,
      lowStock: inventoryRows.filter((r) => r.stockOnHand <= 5).length,
      stockValue: inventoryRows.reduce((s, r) => s + r.stockValue, 0),
      revenue: inventoryRows.reduce((s, r) => s + r.revenue, 0),
    }),
    [inventoryRows],
  );

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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save stock movement.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminPortalFrame
      activeSection="inventory"
      title="Track inventory against revenue."
      description="Record incoming stock, compare it with outgoing paid orders, and keep stock value visible."
      actions={
        <Link href="/admin?section=products" className="rounded-md w-fit bg-[#ae2f34] px-4 py-2 text-sm font-semibold text-white hover:bg-[#8c1520]">
          Manage products
        </Link>
      }
    >
      <div className="grid gap-5">
        {error ? <AdminAlert>{error}</AdminAlert> : null}
        {notice ? <AdminAlert tone="success">{notice}</AdminAlert> : null}

        <AdminStatStrip
          items={[
            { label: 'Products', value: summary.products, detail: 'Catalog items monitored' },
            { label: 'Low stock', value: summary.lowStock, detail: 'Five units or fewer' },
            { label: 'Stock value', value: money(summary.stockValue), detail: 'Based on incoming unit cost' },
            { label: 'Matched revenue', value: money(summary.revenue), detail: 'Paid order item totals' },
          ]}
        />

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={submitMovement}>
            <AdminFormCard eyebrow="Stock record" title="Record movement">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-black">
                  Product
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className={fieldCls}>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-semibold text-black">
                  Movement type
                  <select value={movementType} onChange={(e) => setMovementType(e.target.value as InventoryMovementType)} className={fieldCls}>
                    <option value="incoming">Incoming stock</option>
                    <option value="outgoing">Manual outgoing stock</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-black">
                    Quantity
                    <input type="number" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className={fieldCls} />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-black">
                    Unit cost
                    <input type="number" value={unitCost} onChange={(e) => setUnitCost(Number(e.target.value))} className={fieldCls} />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-black">
                  Linked order ID
                  <input value={linkedOrderId} onChange={(e) => setLinkedOrderId(e.target.value)} className={fieldCls} placeholder="Optional" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-black">
                  Reason
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className={`${fieldCls} resize-none`} placeholder="Supplier delivery, shrinkage, order correction..." />
                </label>
                <button disabled={isSaving || !selectedProduct} className="rounded-md bg-[#ae2f34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#8c1520] disabled:opacity-60">
                  {isSaving ? 'Saving...' : 'Save movement'}
                </button>
              </div>
            </AdminFormCard>
          </form>

          <AdminPanel title="Inventory position" description="Incoming stock minus manual outgoing stock and paid order quantities.">
            <div className="overflow-x-auto">
              <div className="min-w-[860px]">
                <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] border-b border-stone-300 bg-[#fff5f0] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
                  <span>Product</span>
                  <span>Incoming</span>
                  <span>Sold</span>
                  <span>Manual out</span>
                  <span>On hand</span>
                  <span>Revenue</span>
                </div>
                {inventoryRows.map((row) => (
                  <div key={row.product.id} className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.7fr_0.9fr] gap-3 border-b border-stone-200 px-3 py-3 text-sm text-black">
                    <div>
                      <p className="font-semibold text-black">{row.product.name}</p>
                      <p className="mt-1 text-xs text-black">{row.product.sku}</p>
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
          </AdminPanel>
        </div>

        <AdminPanel title="Recent stock movements" bordered>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {movements.slice(0, 9).map((movement) => (
              <article key={movement.id} className="border border-stone-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-black">{movement.productName}</p>
                    <p className="mt-1 text-xs text-black">{getDate(movement.createdAt)}</p>
                  </div>
                  <span className="rounded-md border border-[#e0bfbd] bg-[#fff5f0] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#8c1520]">
                    {movement.type}
                  </span>
                </div>
                <p className="mt-3 text-sm text-black">Qty {movement.quantity} / Cost {money(movement.unitCost)}</p>
                <p className="mt-2 text-xs leading-5 text-black">{movement.reason}</p>
              </article>
            ))}
            {movements.length === 0 ? <p className="text-sm text-black">No inventory movements recorded yet.</p> : null}
          </div>
        </AdminPanel>
      </div>
    </AdminPortalFrame>
  );
}
