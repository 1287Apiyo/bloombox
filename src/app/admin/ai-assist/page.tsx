'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToAdminProducts,
  subscribeToAllOrders,
  subscribeToInventoryMovements,
  subscribeToLeads,
  type CustomerOrder,
  type InventoryMovement,
  type SalesLead,
} from '@/lib/firestore';
import type { CatalogProduct } from '@/data/catalog';
import {
  AdminAlert,
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

function getOrderRevenue(orders: CustomerOrder[]) {
  return orders
    .filter((order) => paidStatuses.includes(order.status))
    .reduce((sum, order) => sum + (order.total ?? 0), 0);
}

function getTopProduct(orders: CustomerOrder[]) {
  const totals = new Map<string, { name: string; quantity: number; revenue: number }>();
  orders
    .filter((order) => paidStatuses.includes(order.status))
    .flatMap((order) => order.items ?? [])
    .forEach((item) => {
      const current = totals.get(item.productId) ?? { name: item.productName, quantity: 0, revenue: 0 };
      current.quantity += item.quantity;
      current.revenue += (item.price ?? 0) * item.quantity;
      totals.set(item.productId, current);
    });
  return [...totals.values()].sort((a, b) => b.quantity - a.quantity)[0] ?? null;
}

export default function AiAssistPage() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [copied, setCopied] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribers = [
      subscribeToAdminProducts(setProducts, (e) => setError(`Products could not load: ${e.message}`)),
      subscribeToAllOrders(setOrders, (e) => setError(`Orders could not load: ${e.message}`)),
      subscribeToLeads(setLeads, (e) => setError(`Leads could not load: ${e.message}`)),
      subscribeToInventoryMovements(setMovements, (e) => setError(`Inventory could not load: ${e.message}`)),
    ];
    return () => unsubscribers.forEach((u) => u());
  }, []);

  const insights = useMemo(() => {
    const revenue = getOrderRevenue(orders);
    const topProduct = getTopProduct(orders);
    const activeLeads = leads.filter((lead) => !['won', 'nurture'].includes(lead.stage));
    const incomingByProduct = new Map<string, number>();
    const manualOutgoingByProduct = new Map<string, number>();

    movements.forEach((movement) => {
      if (movement.type === 'incoming') {
        incomingByProduct.set(movement.productId, (incomingByProduct.get(movement.productId) ?? 0) + movement.quantity);
      }
      if (movement.type === 'outgoing') {
        manualOutgoingByProduct.set(movement.productId, (manualOutgoingByProduct.get(movement.productId) ?? 0) + movement.quantity);
      }
    });

    const soldByProduct = new Map<string, number>();
    orders
      .filter((order) => paidStatuses.includes(order.status))
      .flatMap((order) => order.items ?? [])
      .forEach((item) => {
        soldByProduct.set(item.productId, (soldByProduct.get(item.productId) ?? 0) + item.quantity);
      });

    const lowStock = products
      .map((product) => ({
        product,
        stock:
          (incomingByProduct.get(product.id) ?? 0) -
          (manualOutgoingByProduct.get(product.id) ?? 0) -
          (soldByProduct.get(product.id) ?? 0),
      }))
      .filter((row) => row.stock <= 5)
      .slice(0, 6);

    return { revenue, topProduct, activeLeads, lowStock };
  }, [leads, movements, orders, products]);

  const drafts = useMemo(() => {
    const topProductName = insights.topProduct?.name ?? 'Comfort Box';
    const newLead = insights.activeLeads[0];
    const lowStockName = insights.lowStock[0]?.product.name ?? 'period care essentials';

    return [
      {
        title: 'Marketing campaign brief',
        type: 'Marketing',
        text: `Launch a 7-day BloomBox campaign around ${topProductName}. Angle: useful care before urgency. CTA: Build your own box or subscribe. Include M-Pesa checkout, cycle-aware reminders, and a partner product spotlight.`,
      },
      {
        title: 'WhatsApp lead follow-up',
        type: 'Sales',
        text: newLead
          ? `Hi ${newLead.name || 'there'}, this is BloomBox. I saw your interest in ${newLead.interest || 'a care package'}. Would you like a ready package, a subscription, or help building your own box today?`
          : 'Hi there, this is BloomBox. Would you like a ready package, a subscription, or help building your own box today?',
      },
      {
        title: 'Inventory alert',
        type: 'Inventory',
        text: `Restock review: ${lowStockName} is at or below the low-stock threshold. Check supplier lead time, incoming quantity, and whether a substitute should be promoted in the shop.`,
      },
      {
        title: 'Cycle notification copy',
        type: 'Customer care',
        text: 'Hey Cindy, you have entered your Luteal phase, and we are getting ready for that period. The appetite and cravings just hit. Remember to be patient with yourself this week.',
      },
      {
        title: 'Delivery delight copy',
        type: 'Fulfilment',
        text: 'Hey Girl, your delivery is on the way. We will see you soon. P.S. we tucked in a little surprise for you.',
      },
    ];
  }, [insights.activeLeads, insights.lowStock, insights.topProduct]);

  const copyDraft = async (title: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(title);
    window.setTimeout(() => setCopied(''), 1600);
  };

  return (
    <AdminPortalFrame
      activeSection="ai-assist"
      title="Use AI-style assistance for marketing and inventory."
      description="Turn live BloomBox data into draft copy, alerts, and operating suggestions."
    >
      <div className="grid gap-5">
        {error ? <AdminAlert>{error}</AdminAlert> : null}

        <AdminStatStrip
          items={[
            { label: 'Paid revenue', value: money(insights.revenue), detail: 'Orders that reached paid flow' },
            { label: 'Active leads', value: insights.activeLeads.length, detail: 'Need sales action' },
            { label: 'Low-stock items', value: insights.lowStock.length, detail: 'Five units or fewer' },
            {
              label: 'Top product',
              value: insights.topProduct?.name ?? '—',
              detail: 'By paid quantity',
            },
          ]}
        />

        <AdminPanel title="Draft outputs" description="Copy-ready prompts built from current store data.">
          <div className="grid gap-4 md:grid-cols-2">
            {drafts.map((draft) => (
              <article key={draft.title} className="border border-stone-300 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{draft.type}</p>
                    <h3 className="mt-1 text-lg font-semibold text-black">{draft.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDraft(draft.title, draft.text)}
                    className="shrink-0 border border-stone-300 px-3 py-1.5 text-xs font-semibold text-black hover:bg-[#fff5f0]"
                  >
                    {copied === draft.title ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-3 text-sm leading-6 text-black">{draft.text}</p>
              </article>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Low stock watchlist" description="Items at or below five units on hand." bordered>
          {insights.lowStock.length === 0 ? (
            <p className="text-sm text-black">No low-stock items right now.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {insights.lowStock.map((row) => (
                <article key={row.product.id} className="border border-stone-200 p-4">
                  <p className="font-semibold text-black">{row.product.name}</p>
                  <p className="mt-1 text-xs text-black">{row.product.sku}</p>
                  <p className="mt-3 text-sm font-semibold text-[#ae2f34]">On hand: {row.stock}</p>
                </article>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminPortalFrame>
  );
}
