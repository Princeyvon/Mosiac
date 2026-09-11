import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { FileText, Save, Check, ExternalLink, RotateCcw } from 'lucide-react';

export const PoliciesManagementView: React.FC = () => {
  const { policies, updatePolicySection, setActiveModal, navigateToStore, showToast } = useStore();

  const [selectedPolicyId, setSelectedPolicyId] = useState(policies[0]?.id || 'legal');
  const activePolicy = policies.find(p => p.id === selectedPolicyId) || policies[0];

  const [draftTitle, setDraftTitle] = useState(activePolicy?.title || '');
  const [draftContent, setDraftContent] = useState(activePolicy?.content || '');
  const [isSaved, setIsSaved] = useState(false);

  // When selected policy changes, sync drafts
  const handleSelectPolicy = (id: string) => {
    setSelectedPolicyId(id);
    const target = policies.find(p => p.id === id);
    if (target) {
      setDraftTitle(target.title);
      setDraftContent(target.content);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePolicy) return;
    updatePolicySection(activePolicy.id, draftTitle, draftContent);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handlePreviewPolicies = () => {
    navigateToStore();
    setActiveModal('policies');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="text-[10px] uppercase font-mono tracking-widest text-neutral-400">
            Institutional Governance · Legal & Atelier Terms
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 mt-0.5">
            Storefront Policies & Terms
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Edit live legal terms, cookies, privacy disclosures, shipping guidelines, and contact protocols.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePreviewPolicies}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs uppercase font-medium tracking-wider rounded-sm border border-neutral-300 text-neutral-800 hover:border-black transition-colors cursor-pointer bg-white"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Policies Modal</span>
          </button>
          <button
            type="submit"
            form="policy-edit-form"
            className="inline-flex items-center gap-1.5 px-5 py-2 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            {isSaved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Navigation: List of Policy Sections */}
        <div className="md:col-span-4 bg-white border border-neutral-200 rounded-sm divide-y divide-neutral-100 shadow-2xs overflow-hidden">
          <div className="p-3 bg-neutral-50 border-b border-neutral-200 text-[10px] uppercase font-mono tracking-widest text-neutral-500 font-bold">
            Policy Sections ({policies.length})
          </div>

          {policies.map(p => {
            const isSelected = p.id === selectedPolicyId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPolicy(p.id)}
                className={`w-full text-left p-3.5 transition-colors cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-black text-white font-semibold'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <div className="text-xs truncate">{p.title}</div>
                  <div
                    className={`text-[9px] font-mono mt-0.5 truncate ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    #{p.id} · {p.lastUpdated || 'Published'}
                  </div>
                </div>
                <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
              </button>
            );
          })}
        </div>

        {/* Right Editor: Policy Title and Content */}
        <div className="md:col-span-8 bg-white border border-neutral-200 rounded-sm p-6 shadow-2xs">
          {activePolicy ? (
            <form id="policy-edit-form" onSubmit={handleSave} className="space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div>
                  <span className="text-[10px] uppercase font-mono text-neutral-400">
                    Editing Section: #{activePolicy.id}
                  </span>
                  <div className="text-xs font-mono text-neutral-500">
                    Last updated: {activePolicy.lastUpdated}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setDraftTitle(activePolicy.title);
                    setDraftContent(activePolicy.content);
                    showToast('Reverted to published text');
                  }}
                  className="text-[10px] uppercase tracking-wider font-mono text-neutral-500 hover:text-black"
                >
                  Revert Edits
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Section Title
                </label>
                <input
                  type="text"
                  required
                  value={draftTitle}
                  onChange={e => setDraftTitle(e.target.value)}
                  className="w-full border border-neutral-300 rounded-sm px-3 py-2 text-sm font-semibold focus:outline-black bg-white"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-neutral-600 mb-1">
                  Section Content / Clauses
                </label>
                <textarea
                  rows={14}
                  required
                  value={draftContent}
                  onChange={e => setDraftContent(e.target.value)}
                  className="w-full border border-neutral-300 rounded-sm p-3.5 text-xs font-mono leading-relaxed focus:outline-black bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-black text-white text-xs uppercase font-semibold tracking-wider rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  Save Section
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center text-neutral-400 text-xs">
              Select a policy section from the left panel to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
