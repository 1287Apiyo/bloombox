'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToPartnerInquiries,
  updatePartnerInquiryStatus,
  type PartnerInquiry,
  type PartnerInquiryStatus,
} from '@/lib/firestore';
import {
  AdminAlert,
  AdminPanel,
  AdminPortalFrame,
  AdminStatStrip,
} from '../AdminPortalFrame';

const statuses: Array<{ value: PartnerInquiryStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'approved', label: 'Approved' },
  { value: 'declined', label: 'Declined' },
];

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

function getWhatsappHref(inquiry: PartnerInquiry) {
  const digits = inquiry.phone.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  const message = encodeURIComponent(
    `Hi ${inquiry.contactName || 'there'}, this is BloomBox. Thank you for your partnership request for ${inquiry.businessName}. We would like to learn more about your ${inquiry.productCategory} idea.`,
  );
  return normalized ? `https://wa.me/${normalized}?text=${message}` : '#';
}

export default function PartnersAdminPage() {
  const [inquiries, setInquiries] = useState<PartnerInquiry[]>([]);
  const [updatingId, setUpdatingId] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    return subscribeToPartnerInquiries(
      setInquiries,
      (e) => setError(`Partner inquiries could not load: ${e.message}`),
    );
  }, []);

  const stats = useMemo(
    () =>
      statuses.map((status) => ({
        ...status,
        count: inquiries.filter((i) => i.status === status.value).length,
      })),
    [inquiries],
  );

  const updateStatus = async (inquiry: PartnerInquiry, status: PartnerInquiryStatus) => {
    setError('');
    setNotice('');
    setUpdatingId(inquiry.id);
    try {
      await updatePartnerInquiryStatus(inquiry.id, status);
      setNotice(`${inquiry.businessName} moved to ${statuses.find((s) => s.value === status)?.label}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update this partner request.');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <AdminPortalFrame
      activeSection="partners"
      title="Review BloomBox partnerships."
      description="Qualify product, service, sponsor, school, NGO, corporate, logistics, and campaign partners."
    >
      <div className="grid gap-5">
        {error ? <AdminAlert>{error}</AdminAlert> : null}
        {notice ? <AdminAlert tone="success">{notice}</AdminAlert> : null}

        <AdminStatStrip
          items={stats.map((s) => ({
            label: s.label,
            value: s.count,
            detail: 'In this status',
          }))}
        />

        <AdminPanel
          title="Partner inbox"
          description="Each inquiry comes from the public Partner with us form."
        >
          {inquiries.length === 0 ? (
            <div className="border border-stone-300 p-6 text-sm leading-6 text-black">No partner requests yet.</div>
          ) : (
            <div className="grid gap-4">
              {inquiries.map((inquiry) => (
                <article
                  key={inquiry.id}
                  className="grid gap-4 border border-stone-300 p-4 xl:grid-cols-[1fr_0.85fr_0.65fr] xl:items-start"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">
                      {inquiry.productCategory}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-black">{inquiry.businessName}</h3>
                    <p className="mt-1 text-sm text-black">{inquiry.contactName}</p>
                    <p className="mt-1 break-all text-sm text-black">{inquiry.email}</p>
                    <p className="mt-1 text-sm text-black">{inquiry.phone}</p>
                    <p className="mt-2 text-xs text-black">Submitted {getDate(inquiry.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">Message</p>
                    <p className="mt-2 text-sm leading-6 text-black">{inquiry.message}</p>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black">
                      Status
                      <select
                        value={inquiry.status}
                        disabled={updatingId === inquiry.id}
                        onChange={(e) => updateStatus(inquiry, e.target.value as PartnerInquiryStatus)}
                        className="border border-stone-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#ae2f34]"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <a
                      href={getWhatsappHref(inquiry)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex justify-center border border-[#006a65] px-4 py-2 text-sm font-semibold text-[#006a65] hover:bg-[#e7fbf8]"
                    >
                      Contact partner
                    </a>
                    <a
                      href={`mailto:${inquiry.email}`}
                      className="inline-flex justify-center border border-[#ae2f34] px-4 py-2 text-sm font-semibold text-[#ae2f34] hover:bg-[#fff5f0]"
                    >
                      Email partner
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </AdminPanel>
      </div>
    </AdminPortalFrame>
  );
}
