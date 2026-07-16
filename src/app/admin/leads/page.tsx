'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToLeads,
  updateLeadStage,
  type LeadStage,
  type SalesLead,
} from '@/lib/firestore';
import {
  AdminAlert,
  AdminPanel,
  AdminPortalFrame,
  AdminStatStrip,
} from '../AdminPortalFrame';

const stages: Array<{ value: LeadStage; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'whatsapp-contacted', label: 'WhatsApp contacted' },
  { value: 'checkout-ready', label: 'Checkout ready' },
  { value: 'won', label: 'Won' },
  { value: 'nurture', label: 'Nurture' },
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

function getWhatsappHref(phone: string, lead: SalesLead) {
  const digits = phone.replace(/\D/g, '');
  const normalized = digits.startsWith('0') ? `254${digits.slice(1)}` : digits;
  const message = encodeURIComponent(
    `Hi ${lead.name || 'there'}, this is BloomBox. We saw your interest in ${lead.interest || 'a care package'} and can help you choose a package or build your own box.`,
  );
  return normalized ? `https://wa.me/${normalized}?text=${message}` : '#';
}

function hasWhatsappPhone(phone: string) {
  return phone.replace(/\D/g, '').length >= 9;
}

const fieldCls =
  'border border-stone-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-black outline-none focus:border-[#ae2f34]';

export default function LeadsPage() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [notesByLead, setNotesByLead] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    return subscribeToLeads(
      (nextLeads) => {
        setLeads(nextLeads);
        setNotesByLead((current) => {
          const next = { ...current };
          nextLeads.forEach((lead) => {
            if (next[lead.id] === undefined) next[lead.id] = lead.notes ?? '';
          });
          return next;
        });
      },
      (e) => setError(`Leads could not load: ${e.message}`),
    );
  }, []);

  const stats = useMemo(
    () =>
      stages.map((stage) => ({
        ...stage,
        count: leads.filter((l) => l.stage === stage.value).length,
      })),
    [leads],
  );

  const updateLead = async (lead: SalesLead, stage: LeadStage) => {
    setError('');
    setNotice('');
    setUpdatingId(lead.id);
    try {
      await updateLeadStage(lead.id, stage, notesByLead[lead.id] ?? lead.notes ?? '');
      setNotice(`${lead.name || lead.email} moved to ${stages.find((s) => s.value === stage)?.label}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update this lead.');
    } finally {
      setUpdatingId('');
    }
  };

  const saveNotes = async (lead: SalesLead) => {
    await updateLead(lead, lead.stage);
  };

  return (
    <AdminPortalFrame
      activeSection="leads"
      title="Qualify BloomBox leads."
      description="Track signup data, move leads through the funnel, and open WhatsApp follow-up."
    >
      <div className="grid gap-5">
        {error ? <AdminAlert>{error}</AdminAlert> : null}
        {notice ? <AdminAlert tone="success">{notice}</AdminAlert> : null}

        <AdminStatStrip
          items={stats.map((s) => ({
            label: s.label,
            value: s.count,
            detail: 'In this stage',
          }))}
        />

        <AdminPanel
          title="Lead pipeline"
          description="Leads come from the homepage care-planning form and can be contacted on WhatsApp."
        >
          {leads.length === 0 ? (
            <div className="border border-stone-300 p-6 text-sm leading-6 text-black">
              No leads yet. Submissions appear here after the form is sent.
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <article
                  key={lead.id}
                  className="grid gap-4 border border-stone-300 p-4 xl:grid-cols-[1.1fr_0.9fr_0.85fr_220px] xl:items-start"
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">
                      {lead.source || 'website'}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-black">{lead.name || 'Unnamed lead'}</h3>
                    <p className="mt-1 break-all text-sm text-black">{lead.email}</p>
                    <p className="mt-1 text-sm text-black">{lead.phone || 'No phone'}</p>
                    <p className="mt-2 text-xs text-black">Created {getDate(lead.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-black">Interest</p>
                    <p className="mt-2 text-sm font-semibold text-black">{lead.interest || 'Not specified'}</p>
                    <p className="mt-1 text-sm text-black">Budget: {lead.budget || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black">
                      Stage
                      <select
                        value={lead.stage}
                        disabled={updatingId === lead.id}
                        onChange={(e) => updateLead(lead, e.target.value as LeadStage)}
                        className={fieldCls}
                      >
                        {stages.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-3 border border-[#006a65] bg-[#e7fbf8] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">WhatsApp follow-up</p>
                      <a
                        href={hasWhatsappPhone(lead.phone) ? getWhatsappHref(lead.phone, lead) : '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (!hasWhatsappPhone(lead.phone)) {
                            e.preventDefault();
                            return;
                          }
                          updateLead(lead, 'whatsapp-contacted');
                        }}
                        className={`mt-2 inline-flex w-full justify-center px-4 py-2 text-sm font-semibold text-white ${
                          hasWhatsappPhone(lead.phone) ? 'bg-[#006a65] hover:bg-[#004b48]' : 'cursor-not-allowed bg-black/40'
                        }`}
                      >
                        {hasWhatsappPhone(lead.phone) ? 'Open WhatsApp' : 'No WhatsApp number'}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-black">
                      Notes
                      <textarea
                        value={notesByLead[lead.id] ?? ''}
                        onChange={(e) => setNotesByLead((c) => ({ ...c, [lead.id]: e.target.value }))}
                        onBlur={() => saveNotes(lead)}
                        rows={4}
                        className={`${fieldCls} resize-none font-normal`}
                      />
                    </label>
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
