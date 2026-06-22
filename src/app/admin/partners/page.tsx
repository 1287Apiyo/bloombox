'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToPartnerInquiries,
  updatePartnerInquiryStatus,
  type PartnerInquiry,
  type PartnerInquiryStatus,
} from '@/lib/firestore';
import { AdminPortalFrame } from '../AdminPortalFrame';

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
  const message = encodeURIComponent(`Hi ${inquiry.contactName || 'there'}, this is BloomBox. Thank you for your partnership request for ${inquiry.businessName}. We would like to learn more about your ${inquiry.productCategory} idea.`);

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
      (inquiryError) => setError(`Partner inquiries could not load: ${inquiryError.message}`),
    );
  }, []);

  const stats = useMemo(() => {
    return statuses.map((status) => ({
      ...status,
      count: inquiries.filter((inquiry) => inquiry.status === status.value).length,
    }));
  }, [inquiries]);

  const updateStatus = async (inquiry: PartnerInquiry, status: PartnerInquiryStatus) => {
    setError('');
    setNotice('');
    setUpdatingId(inquiry.id);

    try {
      await updatePartnerInquiryStatus(inquiry.id, status);
      setNotice(`${inquiry.businessName} moved to ${statuses.find((item) => item.value === status)?.label}.`);
    } catch (statusError) {
      setError(statusError instanceof Error ? statusError.message : 'Could not update this partner request.');
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
      {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}
      {notice ? <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div> : null}

      <div className="grid gap-5">
        <div className="grid border-y border-stone-300 bg-white sm:grid-cols-2 xl:grid-cols-5">
          {stats.map((status, index) => (
            <div key={status.value} className={`px-4 py-3 ${index < stats.length - 1 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''}`}>
              <p className="text-2xl font-semibold text-[#ae2f34]">{status.count}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{status.label}</p>
            </div>
          ))}
        </div>

        <section className="bg-white">
          <div className="mb-3 border-b border-stone-300 pb-2">
            <h2 className="text-lg font-semibold">Partner inbox</h2>
            <p className="mt-0.5 text-sm text-stone-500">Each inquiry comes from the public Partner with us form and can represent products, services, sponsorships, or programs.</p>
          </div>

          {inquiries.length === 0 ? (
            <div className="border border-stone-300 p-6 text-sm leading-6 text-stone-600">No partner requests yet.</div>
          ) : (
            <div className="grid gap-4">
              {inquiries.map((inquiry) => (
                <article key={inquiry.id} className="grid gap-4 border border-stone-300 p-4 xl:grid-cols-[1fr_0.85fr_0.65fr] xl:items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{inquiry.productCategory}</p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-950">{inquiry.businessName}</h3>
                    <p className="mt-1 text-sm text-stone-600">{inquiry.contactName}</p>
                    <p className="mt-1 break-all text-sm text-stone-600">{inquiry.email}</p>
                    <p className="mt-1 text-sm text-stone-600">{inquiry.phone}</p>
                    <p className="mt-2 text-xs text-stone-500">Submitted {getDate(inquiry.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Message</p>
                    <p className="mt-2 text-sm leading-6 text-stone-700">{inquiry.message}</p>
                  </div>

                  <div className="grid gap-3">
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                      Status
                      <select
                        value={inquiry.status}
                        disabled={updatingId === inquiry.id}
                        onChange={(event) => updateStatus(inquiry, event.target.value as PartnerInquiryStatus)}
                        className="border border-stone-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-stone-950 outline-none focus:border-[#ae2f34]"
                      >
                        {statuses.map((status) => (
                          <option key={status.value} value={status.value}>{status.label}</option>
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
        </section>
      </div>
    </AdminPortalFrame>
  );
}
