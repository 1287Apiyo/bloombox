'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  subscribeToLeads,
  updateLeadStage,
  type LeadStage,
  type SalesLead,
} from '@/lib/firestore';
import { AdminPortalFrame } from '../AdminPortalFrame';

const stages: Array<{ value: LeadStage; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'whatsapp-contacted', label: 'WhatsApp contacted' },
  { value: 'checkout-ready', label: 'Checkout ready' },
  { value: 'won', label: 'Won' },
  { value: 'nurture', label: 'Nurture' },
];

const funnelExplainers = [
  ['Capture', 'Homepage sign-up sheet creates the lead record.'],
  ['Qualify', 'Move the lead by interest, budget, and readiness.'],
  ['WhatsApp', 'Open WhatsApp with a prefilled BloomBox follow-up message.'],
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
  const message = encodeURIComponent(`Hi ${lead.name || 'there'}, this is BloomBox. We saw your interest in ${lead.interest || 'a care package'} and can help you choose a package or build your own box.`);

  return normalized ? `https://wa.me/${normalized}?text=${message}` : '#';
}

function hasWhatsappPhone(phone: string) {
  return phone.replace(/\D/g, '').length >= 9;
}

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
      (leadsError) => setError(`Leads could not load: ${leadsError.message}`),
    );
  }, []);

  const stats = useMemo(() => {
    return stages.map((stage) => ({
      ...stage,
      count: leads.filter((lead) => lead.stage === stage.value).length,
    }));
  }, [leads]);

  const updateLead = async (lead: SalesLead, stage: LeadStage) => {
    setError('');
    setNotice('');
    setUpdatingId(lead.id);

    try {
      await updateLeadStage(lead.id, stage, notesByLead[lead.id] ?? lead.notes ?? '');
      setNotice(`${lead.name || lead.email} moved to ${stages.find((item) => item.value === stage)?.label}.`);
    } catch (leadError) {
      setError(leadError instanceof Error ? leadError.message : 'Could not update this lead.');
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
      description="Track where signup data goes, move leads through the sales funnel, and open WhatsApp follow-up."
    >
      {error ? <div className="mb-5 border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800">{error}</div> : null}
      {notice ? <div className="mb-5 border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{notice}</div> : null}

      <div className="grid gap-5">
        <section className="border border-[#006a65] bg-[#e7fbf8] p-5">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#006a65]">WhatsApp sales funnel</p>
              <h2 className="mt-2 text-2xl font-semibold text-[#191c1d]">Sign-up sheet data lands here.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#00504c]">
                Each submission becomes a lead card with stage, notes, and a visible WhatsApp follow-up action.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {funnelExplainers.map(([title, text]) => (
                <div key={title} className="bg-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#006a65]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid border-y border-stone-300 bg-white sm:grid-cols-2 xl:grid-cols-6">
          {stats.map((stage, index) => (
            <div key={stage.value} className={`px-4 py-3 ${index < stats.length - 1 ? 'border-b border-stone-200 sm:border-r xl:border-b-0' : ''}`}>
              <p className="text-2xl font-semibold text-[#ae2f34]">{stage.count}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-stone-500">{stage.label}</p>
            </div>
          ))}
        </div>

        <section className="bg-white">
          <div className="mb-3 border-b border-stone-300 pb-2">
            <h2 className="text-lg font-semibold">Lead pipeline</h2>
            <p className="mt-0.5 text-sm text-stone-500">Leads are created by the homepage care-planning form and can be contacted through WhatsApp.</p>
          </div>

          {leads.length === 0 ? (
            <div className="border border-stone-300 p-6 text-sm leading-6 text-stone-600">
              No leads yet. Once someone submits the landing page form, the record appears here.
            </div>
          ) : (
            <div className="grid gap-4">
              {leads.map((lead) => (
                <article key={lead.id} className="grid gap-4 border border-stone-300 p-4 xl:grid-cols-[1.1fr_0.9fr_0.85fr_220px] xl:items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#ae2f34]">{lead.source || 'website'}</p>
                    <h3 className="mt-1 text-lg font-semibold text-stone-950">{lead.name || 'Unnamed lead'}</h3>
                    <p className="mt-1 break-all text-sm text-stone-600">{lead.email}</p>
                    <p className="mt-1 text-sm text-stone-600">{lead.phone || 'No phone'}</p>
                    <p className="mt-2 text-xs text-stone-500">Created {getDate(lead.createdAt)}</p>
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Interest</p>
                    <p className="mt-2 text-sm font-semibold text-stone-950">{lead.interest || 'Not specified'}</p>
                    <p className="mt-1 text-sm text-stone-600">Budget: {lead.budget || 'Not specified'}</p>
                  </div>

                  <div>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                      Stage
                      <select
                        value={lead.stage}
                        disabled={updatingId === lead.id}
                        onChange={(event) => updateLead(lead, event.target.value as LeadStage)}
                        className="border border-stone-300 bg-white px-3 py-2 text-sm font-semibold normal-case tracking-normal text-stone-950 outline-none focus:border-[#ae2f34]"
                      >
                        {stages.map((stage) => (
                          <option key={stage.value} value={stage.value}>{stage.label}</option>
                        ))}
                      </select>
                    </label>

                    <div className="mt-3 border border-[#006a65] bg-[#e7fbf8] p-3">
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#006a65]">WhatsApp follow-up</p>
                      <a
                        href={hasWhatsappPhone(lead.phone) ? getWhatsappHref(lead.phone, lead) : '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => {
                          if (!hasWhatsappPhone(lead.phone)) {
                            event.preventDefault();
                            return;
                          }

                          updateLead(lead, 'whatsapp-contacted');
                        }}
                        className={`mt-2 inline-flex w-full justify-center px-4 py-2 text-sm font-semibold text-white ${
                          hasWhatsappPhone(lead.phone) ? 'bg-[#006a65] hover:bg-[#004b48]' : 'cursor-not-allowed bg-stone-500'
                        }`}
                      >
                        {hasWhatsappPhone(lead.phone) ? 'Open WhatsApp' : 'No WhatsApp number'}
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                      Notes
                      <textarea
                        value={notesByLead[lead.id] ?? ''}
                        onChange={(event) => setNotesByLead((current) => ({ ...current, [lead.id]: event.target.value }))}
                        onBlur={() => saveNotes(lead)}
                        rows={4}
                        className="resize-none border border-stone-300 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-stone-950 outline-none focus:border-[#ae2f34]"
                      />
                    </label>
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
