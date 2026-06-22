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
import { AdminPortalFrame } from '../AdminPortalFrame';

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
      subscribeToAdminProducts(setProducts, (productsError) => setError(`Products could not load: ${productsError.message}`)),
      subscribeToAllOrders(setOrders, (ordersError) => setError(`Orders could not load: ${ordersError.message}`)),
      subscribeToLeads(setLeads, (leadsError) => setError(`Leads could not load: ${leadsError.message}`)),
      subscribeToInventoryMovements(setMovements, (movementError) => setError(`Inventory could not load: ${movementError.message}`)),
    ];

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
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
        stock: (incomingByProduct.get(product.id) ?? 0) - (manualOutgoingByProduct.get(product.id) ?? 0) - (soldByProduct.get(product.id) ?? 0),
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
      description="This workspace turns live BloomBox data into draft copy, alerts, and operating suggestions. It can later be connected to an LLM provider."
    >
      {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}

      <div className="grid gap-5">
        <div className="grid border-y border-stone-300 bg-white sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Paid revenue', money(insights.revenue), 'Orders that reached paid flow'],
            ['Active leads', insights.activeLeads.length, 'Need sales action'],
            ['Low-stock items', insights.lowStock.length, 'Five units or fewer'],
            ['Top product', insights.topProduct?.name ?? 'Not enough data', 'By paid quantity'],
          ].map(([label, value, detail], index) => (
            <div key={label} className={`px-4 py-3 ${index < 3 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''}`}>
              <p className="text-2xl font-semibold text-[#ae2f34]">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{label}</p>
              <p className="mt-1 text-xs text-stone-500">{detail}</p>
            </div>
          ))}
        </div>

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="border border-stone-300 bg-[#fff5f0] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ae2f34]">Agent roadmap</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-[#191c1d]">What these assistants should automate next.</h2>
            <div className="mt-5 divide-y divide-stone-300 border-y border-stone-300">
              {[
                'Marketing agent: turn leads, subscribers, cycle phases, and top products into campaign briefs.',
                'Inventory agent: flag low stock, slow movers, incoming purchase needs, and revenue exposure.',
                'WhatsApp agent: draft consent-based follow-up messages and sales qualification questions.',
                'Donation agent: reconcile M-Changa references with sponsored bundle fulfilment.',
              ].map((item) => (
                <p key={item} className="py-3 text-sm leading-6 text-[#584140]">{item}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {drafts.map((draft) => (
              <article key={draft.title} className="border border-stone-300 bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{draft.type}</p>
                    <h3 className="mt-2 text-lg font-semibold text-stone-950">{draft.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyDraft(draft.title, draft.text)}
                    className="border border-[#ae2f34] px-3 py-1.5 text-xs font-semibold text-[#ae2f34] hover:bg-[#fff5f0]"
                  >
                    {copied === draft.title ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="mt-4 text-sm leading-6 text-stone-700">{draft.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-stone-300 bg-white p-5">
          <h2 className="text-lg font-semibold text-stone-950">Low-stock recommendations</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {insights.lowStock.map((row) => (
              <article key={row.product.id} className="border border-stone-200 p-4">
                <p className="font-semibold text-stone-950">{row.product.name}</p>
                <p className="mt-1 text-sm text-[#ae2f34]">Estimated stock: {row.stock}</p>
                <p className="mt-2 text-xs leading-5 text-stone-600">Suggested action: restock, hide if unavailable, or promote a substitute package.</p>
              </article>
            ))}
            {insights.lowStock.length === 0 ? <p className="text-sm text-stone-600">No low-stock alerts based on recorded inventory.</p> : null}
          </div>
        </section>
      </div>
    </AdminPortalFrame>
  );
}
