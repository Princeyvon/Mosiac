import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { ArrowLeft, Shield, Truck, RotateCcw, Cookie, Lock, Mail, Info, Search, CheckCircle, Clock } from 'lucide-react';

export const PoliciesPage: React.FC = () => {
  const { orders, formatPrice, policies, cookieConsent, setCookieConsent, showToast } = useStore();
  const [activeTab, setActiveTab] = useState<'legal' | 'orders' | 'privacy' | 'cookies' | 'shipping' | 'returns' | 'about' | 'contact'>('legal');

  // Interactive Order Lookup state
  const [orderQuery, setOrderQuery] = useState('');
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  // Contact form state
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: 'Bespoke Commission Inquiry', message: '' });

  const handleOrderSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);
    const cleaned = orderQuery.trim().toUpperCase();
    const match = orders.find(o => o.id.toUpperCase() === cleaned);
    setFoundOrder(match || null);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  // Helper to retrieve custom policy content if edited in dash
  const getPolicyContent = (id: string, defaultText: string) => {
    const p = policies?.find(x => x.id === id);
    return p ? p.content : defaultText;
  };

  const tabs = [
    { id: 'legal', label: 'Terms & Conditions', icon: Shield },
    { id: 'orders', label: 'Order Status & Tracking', icon: Clock },
    { id: 'shipping', label: 'Shipping & White-Glove', icon: Truck },
    { id: 'returns', label: 'Returns & Guarantee', icon: RotateCcw },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock },
    { id: 'cookies', label: 'Cookies Policy', icon: Cookie },
    { id: 'about', label: 'About Mosiac', icon: Info },
    { id: 'contact', label: 'Contact & Atelier', icon: Mail },
  ] as const;

  return (
    <div className="w-full bg-white text-neutral-900 min-h-[calc(100vh-60px)] pb-24 pt-6 sm:pt-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8">
        <div className="mb-8 sm:mb-12">
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-mono block mb-2">
            Studio Policies & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-normal uppercase tracking-wider text-neutral-900">
            Terms, Conditions & Studio Services
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Sidebar Menu */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-1">
            <div className="bg-neutral-50 p-2 rounded-sm border border-neutral-200 sticky top-20">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-sm text-left text-xs font-medium uppercase tracking-[0.14em] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-black text-white font-semibold'
                        : 'text-neutral-500 hover:text-black hover:bg-neutral-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Main Content Area */}
          <div className="lg:col-span-8 xl:col-span-9 bg-white border border-neutral-200 rounded-sm p-6 sm:p-10 shadow-xs">
            {/* 1. Legal & Terms */}
            {activeTab === 'legal' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Terms & Conditions of Sale
                </h2>
                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light whitespace-pre-line">
                  <p>
                    {getPolicyContent(
                      'legal',
                      'Welcome to Mosiac Studio. By accessing our platform, viewing our catalogue, or acquiring works from our atelier, you agree to comply with and be bound by the studio terms and conditions.'
                    )}
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">1. Atelier Authenticity & Craftsmanship</h3>
                  <p>
                    Every textile and architectural artifact presented by Mosiac is individually crafted by master artisans using organic New Zealand virgin wool, botanical luster fibers, and museum-grade dyes. Slight organic variations in pile height, contour beveling, and subtle tone gradients are intrinsic hallmarks of authentic artisanal creation rather than manufacturing defects.
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">2. Pricing & Bespoke Quotes</h3>
                  <p>
                    All listed prices are displayed in your chosen currency and exclude applicable destination import duties or local sales taxes where required by jurisdiction. Commissioned custom sizes or unique colorway edits are subject to binding architectural studio quotes.
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">3. Intellectual Property</h3>
                  <p>
                    All patterns, sculptural forms, textile motifs, photographs, and typographic designs are the exclusive intellectual property of Mosiac Studio Ltd. Unauthorized reproduction or commercial emulation is strictly prohibited.
                  </p>
                </div>
              </div>
            )}

            {/* 2. Order Status & Tracking */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Status & Live Tracking
                </h2>
                <p className="text-xs text-neutral-500 font-light">
                  Track the fabrication, finishing, and white-glove logistics of your studio acquisition in real-time.
                </p>

                <form onSubmit={handleOrderSearch} className="max-w-md flex gap-2">
                  <input
                    type="text"
                    value={orderQuery}
                    onChange={(e) => setOrderQuery(e.target.value)}
                    placeholder="Enter order reference (e.g. ORD-9021)"
                    className="flex-1 bg-neutral-50 border border-neutral-300 rounded-sm px-3.5 py-2 text-xs uppercase font-mono focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 bg-black text-white text-xs uppercase tracking-widest rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Track</span>
                  </button>
                </form>

                {searched && foundOrder && (
                  <div className="mt-6 p-5 rounded-sm bg-neutral-50 border border-neutral-200 text-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-widest block">Reference</span>
                        <span className="font-mono font-bold text-sm text-neutral-900">{foundOrder.id}</span>
                      </div>
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-widest font-semibold rounded-sm ${
                        foundOrder.status === 'Fulfilled' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {foundOrder.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-[11px]">
                      <div>
                        <span className="text-neutral-400 block uppercase tracking-wider">Client</span>
                        <span className="font-medium text-neutral-800">{foundOrder.customerName}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase tracking-wider">Order Date</span>
                        <span className="font-mono text-neutral-800">{foundOrder.date}</span>
                      </div>
                      <div>
                        <span className="text-neutral-400 block uppercase tracking-wider">Valuation</span>
                        <span className="font-mono font-medium text-neutral-800">{formatPrice(foundOrder.total)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-200 text-neutral-500 text-[11px] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-400" />
                      <span>Dedicated white-glove transport vehicle assigned. Transit updates dispatched to {foundOrder.customerEmail}.</span>
                    </div>
                  </div>
                )}

                {searched && !foundOrder && (
                  <div className="mt-4 p-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    No active record found for reference "{orderQuery}". Please verify your invoice number or test with recent order <button type="button" onClick={() => { setOrderQuery('ORD-9021'); }} className="underline font-mono font-bold">ORD-9021</button>.
                  </div>
                )}

                <div className="pt-6 border-t border-neutral-100">
                  <h3 className="text-xs uppercase tracking-widest font-semibold text-neutral-700 mb-2">Recent Atelier Dispatches</h3>
                  <div className="divide-y divide-neutral-100">
                    {orders.slice(0, 3).map(o => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between text-xs">
                        <span className="font-mono text-neutral-600">{o.id} · {o.customerName}</span>
                        <span className="text-[10px] uppercase tracking-wider text-neutral-400">{o.status} ({o.date})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. Shipping */}
            {activeTab === 'shipping' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Shipping & White-Glove Delivery
                </h2>
                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light">
                  <p>
                    {getPolicyContent(
                      'shipping',
                      'Mosiac partners exclusively with premier international art-handling logistics carriers. Every rug is rolled on high-rigidity structural tubes and encased in sealed archival moisture-barrier timber crates.'
                    )}
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">Transit Durations</h3>
                  <ul className="list-disc pl-5 space-y-1.5 text-neutral-600">
                    <li><strong className="text-neutral-900">Domestic Freight (US & EU):</strong> 3 to 5 business days via temperature-controlled air freight.</li>
                    <li><strong className="text-neutral-900">International Express:</strong> 5 to 8 business days with bonded customs clearance.</li>
                    <li><strong className="text-neutral-900">Bespoke Commissions:</strong> 4 to 8 weeks weaving lead time, followed by priority delivery.</li>
                  </ul>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">White-Glove Placement</h3>
                  <p>
                    Complimentary for all salon and grand dimension commissions. Two uniformed art technicians will uncrate the piece, position it precisely within your interior, align directional pile fibers, and remove all packaging materials for sustainable recycling.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Returns */}
            {activeTab === 'returns' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Returns & 30-Day Studio Guarantee
                </h2>
                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light">
                  <p>
                    {getPolicyContent(
                      'returns',
                      'We want you to experience our textiles under your natural interior light. We offer a 30-day inspection window from the date of physical delivery for standard catalogue editions.'
                    )}
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">Return Conditions</h3>
                  <p>
                    The textile must remain in original pristine condition, unwashed, with all studio labels intact. We arrange return collection via our art-freight partner at no penalty to you.
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">Custom & Bespoke Commissions</h3>
                  <p>
                    Pieces woven to custom client dimensions or custom color palettes are non-refundable once physical loom weaving has begun, backed by our atelier craftsmanship warranty ensuring structural perfection.
                  </p>
                </div>
              </div>
            )}

            {/* 5. Privacy */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Privacy & Data Governance
                </h2>
                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light">
                  <p>
                    {getPolicyContent(
                      'privacy',
                      'Mosiac maintains strict confidentiality regarding our clients, collectors, and architectural partners. We comply with GDPR, CCPA, and global privacy standards.'
                    )}
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">Information Collected</h3>
                  <p>
                    We collect only information essential to servicing your order, such as delivery addresses, contact emails, and transaction tokens processed via PCI-DSS compliant payment gateways. We never sell, lease, or monetize client data.
                  </p>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-2">Your Privacy Rights</h3>
                  <p>
                    You may request complete erasure of your transaction records or export your profile at any time by contacting our data protection officer at <span className="font-mono text-neutral-900">privacy@rugmosiac.com</span>.
                  </p>
                </div>
              </div>
            )}

            {/* 6. Cookies */}
            {activeTab === 'cookies' && (
              <div className="space-y-6">
                <div className="border-b border-neutral-100 pb-3">
                  <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900">
                    Cookie Policy & Local Storage Disclosures
                  </h2>
                  <p className="text-[11px] text-neutral-400 font-mono mt-1">
                    Last updated: September 2026 · Compliant with GDPR, UK PECR, & CCPA
                  </p>
                </div>

                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light">
                  <p>
                    {getPolicyContent(
                      'cookies',
                      'Mosiac operates on principles of digital minimalism and data discretion. We do not sell, rent, or trade client telemetry. This policy explains how we utilize HTTP cookies and browser LocalStorage technologies to deliver a seamless atelier shopping experience.'
                    )}
                  </p>

                  {/* Interactive Preference Controls Card */}
                  <div className="p-5 rounded-sm bg-neutral-50 border border-neutral-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200 pb-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-neutral-500 block">
                          Current Consent Status
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cookieConsent === 'accepted'
                                ? 'bg-emerald-500'
                                : cookieConsent === 'rejected'
                                ? 'bg-amber-500'
                                : 'bg-blue-500'
                            }`}
                          />
                          <span className="text-xs font-semibold text-neutral-900">
                            {cookieConsent === 'accepted'
                              ? 'All Cookies & Local Storage Authorized'
                              : cookieConsent === 'rejected'
                              ? 'Strictly Necessary Only (Non-Essential Declined)'
                              : 'Default Notice Active (Undecided)'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-neutral-400">
                        Identifier: client-session-{typeof window !== 'undefined' ? (window.navigator.userAgent.length * 42) : '3892'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setCookieConsent('accepted');
                          showToast('Cookie preferences updated: All Authorized');
                        }}
                        className={`px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-semibold rounded-xs transition-colors cursor-pointer ${
                          cookieConsent === 'accepted'
                            ? 'bg-black text-white'
                            : 'bg-white border border-neutral-300 hover:border-black text-neutral-800'
                        }`}
                      >
                        Authorize All
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCookieConsent('rejected');
                          showToast('Cookie preferences updated: Essential Only');
                        }}
                        className={`px-3.5 py-1.5 text-[11px] uppercase tracking-wider font-medium rounded-xs transition-colors cursor-pointer ${
                          cookieConsent === 'rejected'
                            ? 'bg-black text-white'
                            : 'bg-white border border-neutral-300 hover:border-black text-neutral-800'
                        }`}
                      >
                        Essential Only (Decline Analytics)
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCookieConsent(null);
                          showToast('Cookie preferences reset: Banner opened');
                        }}
                        className="px-3.5 py-1.5 text-[11px] uppercase tracking-wider text-neutral-500 hover:text-black underline cursor-pointer"
                      >
                        Reset & Show Banner
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-3">
                    1. Categorization of Storage Technologies Used
                  </h3>

                  <div className="overflow-x-auto border border-neutral-200 rounded-sm">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-neutral-100 text-neutral-600 uppercase tracking-wider border-b border-neutral-200">
                        <tr>
                          <th className="p-2.5 font-semibold">Key / Cookie Name</th>
                          <th className="p-2.5 font-semibold">Category</th>
                          <th className="p-2.5 font-semibold">Purpose</th>
                          <th className="p-2.5 font-semibold">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 text-neutral-700">
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_cart</td>
                          <td className="p-2.5 text-emerald-800 font-medium">Strictly Necessary</td>
                          <td className="p-2.5">Stores selected bespoke rug models, chosen dimensions, colorways, and quantities.</td>
                          <td className="p-2.5 font-mono">Persistent (Local)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_currency</td>
                          <td className="p-2.5 text-emerald-800 font-medium">Functional / Essential</td>
                          <td className="p-2.5">Remembers client currency selection (USD, EUR, GBP, JPY, CHF, etc.) for live pricing.</td>
                          <td className="p-2.5 font-mono">Persistent (Local)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_cookies</td>
                          <td className="p-2.5 text-emerald-800 font-medium">Legal Compliance</td>
                          <td className="p-2.5">Records your acceptance or refusal of non-essential technologies under GDPR Art. 7.</td>
                          <td className="p-2.5 font-mono">12 Months</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_grid_density</td>
                          <td className="p-2.5 text-blue-800 font-medium">Preference / UI</td>
                          <td className="p-2.5">Maintains your preferred catalogue presentation (4 vs 6 cards per row).</td>
                          <td className="p-2.5 font-mono">Persistent (Local)</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_dismissed_promo</td>
                          <td className="p-2.5 text-blue-800 font-medium">Preference / UI</td>
                          <td className="p-2.5">Ensures promotional notifications are not shown repeatedly during the same session.</td>
                          <td className="p-2.5 font-mono">Session</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-mono text-neutral-900 font-medium">mosiac_admin_auth</td>
                          <td className="p-2.5 text-purple-800 font-medium">Staff Security</td>
                          <td className="p-2.5">Stores encrypted authentication token for authorized studio management team.</td>
                          <td className="p-2.5 font-mono">Session / Local</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-3">
                    2. Third-Party Content Delivery & Media Networks
                  </h3>
                  <p>
                    To render high-resolution architectural photography with zero latency, Mosiac relies on global Content Delivery Networks (CDNs) including Unsplash and Cloudflare. These services process transient IP headers solely to deliver cryptographic assets and do not track your identity across non-affiliated domains.
                  </p>

                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-900 pt-3">
                    3. Right to Withdraw Consent & Clear Data
                  </h3>
                  <p>
                    You retain the absolute right under GDPR Article 7(3) and CCPA §1798.120 to withdraw your consent at any moment. You can click the "Reset & Show Banner" button above or access your browser's Developer Tools (Application &gt; Storage &gt; Local Storage) to purge all stored keys instantly.
                  </p>
                </div>
              </div>
            )}

            {/* 7. About */}
            {activeTab === 'about' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  About Mosiac Studio
                </h2>
                <div className="space-y-4 text-xs text-neutral-600 leading-relaxed font-light">
                  <p>
                    {getPolicyContent(
                      'about',
                      'Founded at the intersection of architectural sculpture and artisanal craftsmanship, Mosiac designs textiles that ground living spaces with intentional tactile presence.'
                    )}
                  </p>
                  <p>
                    Our master weavers hand-tuft and hand-carve each rug using 100% un-dyed New Zealand virgin highland wool, paired with botanically luster-treated silk inlays. We reject synthetic microplastics in favor of renewable natural fleeces that age gracefully and purify indoor air quality.
                  </p>
                  <p className="font-serif italic text-sm text-neutral-800 pt-2">
                    "A rug is not merely a floor covering; it is the foundation of room acoustics, spatial harmony, and serene contemplation."
                  </p>
                </div>
              </div>
            )}

            {/* 8. Contact */}
            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl font-serif uppercase tracking-wider text-neutral-900 border-b border-neutral-100 pb-3">
                  Contact & Atelier Concierge
                </h2>
                <p className="text-xs text-neutral-500 font-light">
                  Reach our design concierge for bespoke scale inquiries, private architectural trade pricing, or showroom viewings.
                </p>

                {contactSubmitted ? (
                  <div className="p-5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-semibold uppercase tracking-wider">Inquiry Received</div>
                      <div>Thank you, {contactForm.name}. A senior studio textile curator will respond within one business day.</div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 max-w-lg">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Your Name</label>
                        <input
                          type="text"
                          required
                          value={contactForm.name}
                          onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-black"
                          placeholder="Camille Moreau"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={contactForm.email}
                          onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-black"
                          placeholder="client@mosiac.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Inquiry Subject</label>
                      <input
                        type="text"
                        required
                        value={contactForm.subject}
                        onChange={e => setContactForm({ ...contactForm, subject: e.target.value })}
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-neutral-400 block mb-1">Message / Project Details</label>
                      <textarea
                        rows={4}
                        required
                        value={contactForm.message}
                        onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Detail interior dimensions, desired colorway editions, or timeline requirements..."
                        className="w-full bg-neutral-50 border border-neutral-300 rounded-sm px-3 py-2 text-xs focus:outline-none focus:border-black"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-black text-white text-xs uppercase tracking-[0.2em] font-medium rounded-sm hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      Send Atelier Message
                    </button>
                  </form>
                )}

                <div className="pt-6 border-t border-neutral-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-neutral-500">
                  <div>
                    <span className="font-semibold text-neutral-900 block uppercase tracking-wider text-[10px]">Studio Atelier</span>
                    <span className="leading-relaxed">14 Rue de Turenne, Le Marais, 75004 Paris</span>
                  </div>
                  <div>
                    <span className="font-semibold text-neutral-900 block uppercase tracking-wider text-[10px]">Concierge Contact</span>
                    <span className="font-mono leading-relaxed block">concierge@mosiac-atelier.com</span>
                    <span className="font-mono leading-relaxed block">+33 1 42 68 00 90</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
