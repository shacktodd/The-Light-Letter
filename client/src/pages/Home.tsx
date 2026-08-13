/**
 * Design reminder — The Marginalia Ledger: archival editorial research, warm paper,
 * graphite type, cobalt annotations, asymmetrical reading rail, uncertainty as an object.
 */
import { useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  Eye,
  FileSearch,
  Filter,
  Printer,
  ScanSearch,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Tier = "E" | "C" | "F" | "S";
type Gap = { kind: string; score: number; text: string };

type ResearchItem = {
  id: string;
  short: string;
  domains: string;
  title: string;
  image: string;
  claim: string;
  inversion: string;
  whyObvious: string;
  howWeKnow: string;
  confidence: Tier;
  falsifier: string;
  documented: string;
  interpretedIntent: string;
  soWhat: string;
  openProblem?: string;
  sources: number[];
  audit: {
    steelman: string;
    gaps: Gap[];
    denominator: string;
    intentionality: string;
    recalibration: string;
  };
};

const tierInfo: Record<Tier, { label: string; detail: string }> = {
  E: { label: "Established", detail: "Direct documentary or observational support" },
  C: { label: "Corroborated", detail: "Well-supported interpretation with live alternatives" },
  F: { label: "Falsifiable", detail: "A test-ready claim not yet established" },
  S: { label: "Speculative", detail: "Plausible proposal; do not treat as a finding" },
};

const sources = [
  {
    id: 1,
    label: "Mugler, HMML — Astronomical Technology and Religious Practice in Islam",
    url: "https://hmml.org/stories/series-celestial-astronomical-technology/",
    type: "Curated manuscript-source overview",
  },
  {
    id: 2,
    label: "King — The Astronomy of the Mamluks (Isis, 1983)",
    url: "https://doi.org/10.1086/353360",
    type: "Specialist history of science",
  },
  {
    id: 3,
    label: "García-Herrera et al. — Ship logbooks help analyze pre-instrumental climate (EOS, 2006)",
    url: "https://epic.awi.de/id/eprint/17061/",
    type: "Project publication",
  },
  {
    id: 4,
    label: "NOAA/NCEI — International Comprehensive Ocean–Atmosphere Data Set",
    url: "https://www.ncei.noaa.gov/products/international-comprehensive-ocean-atmosphere-data-set",
    type: "Official data documentation",
  },
  {
    id: 5,
    label: "Carroll — Colonial Perceptions of Indian Society and the Emergence of Caste(s) Associations (JAS, 1978)",
    url: "https://doi.org/10.2307/2054164",
    type: "Historical interpretation with cited primary sources",
  },
];

const items: ResearchItem[] = [
  {
    id: "01",
    short: "Mosque timekeeping",
    domains: "Spirituality · hard science · urban sociology",
    title: "The mosque timekeeper was an applied astronomer.",
    image: "/manus-storage/oracle-engine-mosque-astronomy_bcd918f6.jpg",
    claim:
      "From at least the thirteenth century, prominent urban mosques employed a muwaqqit: an astronomy specialist who fixed prayer times and religious calendars. This made the mosque a durable institutional site where instrument use, astronomical tables, and public ritual coordination met.",
    inversion:
      "The default story separates devotion from exact science, as if precision entered religious life only from outside it. Here the recurring demands of prayer time, qiblah, and lunar months made astronomical competence operational—not ornamental.",
    whyObvious:
      "Modern categories train us to picture a mosque as only a devotional setting and an observatory as only a scientific one.",
    howWeKnow:
      "HMML’s manuscript overview documents mosque-employed timekeepers, quadrants, astrolabes, practical treatises, and calendrical tables; it names Ibn al-Shāṭir (1304–1375) as muwaqqit at Damascus’s Umayyad Mosque. David A. King’s specialist history places Mamluk astronomy and the muwaqqit institution in a broader scholarly record.",
    confidence: "E",
    falsifier:
      "A broad, representative prosopography showing that mosque muwaqqits rarely practiced astronomical calculation or that the cited instruments and tables were not used for timekeeping would break the institutional claim.",
    documented:
      "The office, its duties, named practitioners, instruments, manuscript treatises, and the practical link to ritual timing are documented.",
    interpretedIntent:
      "It is an interpretation—not a documented intention—that mosque patrons aimed to ‘advance science,’ or that religious demand alone explains mathematical innovation.",
    soWhat:
      "It changes the question from ‘did religion allow science?’ to ‘which routine institutions turned precision into a collective service?’",
    sources: [1, 2],
    audit: {
      steelman:
        "The link is load-bearing because the duties required repeatable solar/lunar calculations and geographical orientation, while the office gave that competence a stable urban home. The manuscripts are not merely later stories about a role; they preserve the working genres—tables, instrument manuals, and timekeeping guides.",
      gaps: [
        { kind: "Evidentiary", score: 2, text: "The accessible overview establishes existence, not prevalence across cities, centuries, or mosque sizes." },
        { kind: "Inferential", score: 3, text: "An applied service role does not automatically prove that mosque institutions drove frontier mathematical astronomy." },
        { kind: "Sampling", score: 4, text: "Surviving elite urban manuscripts overrepresent instrument-rich centers and undercount local or non-instrument practice." },
        { kind: "Semantic", score: 2, text: "‘Astronomy’ bundles calculation, observational habit, instrument craft, and cosmological theory; the evidence is strongest for the first three." },
        { kind: "Motivational", score: 3, text: "Operational religious use is documented; a patron’s wider intellectual motive is usually not." },
      ],
      denominator:
        "Uncounted by the archive are small mosques, informal timekeepers, failed or lost tables, and the many worshippers who used a schedule without possessing instruments or astronomical literacy.",
      intentionality:
        "A pattern exists: religious coordination sustained technical roles. It does not follow that any ruler, patron, or cleric consciously designed an innovation policy.",
      recalibration:
        "Keeps [E] for the narrow institutional claim. Downgrade any stronger phrasing—‘mosques caused astronomical progress’—to [C] at best.",
    },
  },
  {
    id: "02",
    short: "Imperial weather archive",
    domains: "Hard science · history · politics",
    title: "Imperial administration accidentally made a climate archive.",
    image: "/manus-storage/oracle-engine-logbook_600ff644.jpg",
    claim:
      "Naval logbooks kept by British, Dutch, French, and Spanish vessels engaged in imperial business became a usable pre-instrumental climate record. CLIWOC abstracted more than 280,000 daily weather observations for 1750–1854; the resulting materials can support reconstructions relevant to oceanic wind fields, ENSO, and the NAO.",
    inversion:
      "The obvious story is that modern climate knowledge begins with purpose-built measuring systems. Instead, a state’s navigation-and-command paperwork can become a sensor network centuries later.",
    whyObvious:
      "Archives are commonly imagined as narrative evidence about people and events, rather than as structured environmental observations.",
    howWeKnow:
      "The CLIWOC project publication gives the vessel origins, period, observation count, imperial context, and reconstruction uses. NOAA/NCEI documents ICOADS as a provenance-aware surface-marine collection spanning 1662 to the present and exposes quality-controlled data products.",
    confidence: "E",
    falsifier:
      "If independent transcription audits found that the weather fields were systematically copied, non-contemporaneous, or too inconsistent to retain predictive agreement with independent climate indicators, the ‘usable record’ claim would fail.",
    documented:
      "The logs, their naval and imperial setting, the extraction volume, the project’s reconstruction use, and the archive’s uneven coverage are documented.",
    interpretedIntent:
      "‘Accidentally’ refers to later climate value. It must not be read as a claim that imperial administrators intended climate science, or that climate data were their only purpose.",
    soWhat:
      "Historical harm and scientific utility can inhabit the same record. The record must be used with provenance, not laundered into a neutral global thermometer.",
    sources: [3, 4],
    audit: {
      steelman:
        "This is more than a metaphor: daily fields in routine logs can be standardized, digitized, quality-checked, geolocated, and compared as observations. The 280,000-record project is an explicit bridge from administrative record to climate reconstruction.",
      gaps: [
        { kind: "Evidentiary", score: 2, text: "The project establishes a substantial archive and specific uses, not a complete or uniformly calibrated global record." },
        { kind: "Inferential", score: 3, text: "A reconstructed wind field remains a modelled product; it is not identical to an instrument-era measurement grid." },
        { kind: "Sampling", score: 5, text: "Routes follow imperial commerce and naval priorities; the source itself says CLIWOC was under 10% of the known data volume." },
        { kind: "Semantic", score: 4, text: "Historical weather vocabulary, observing routines, time conventions, and location estimates need translation before they become comparable variables." },
        { kind: "Motivational", score: 1, text: "The intentionality claim is narrow and safe: climate reconstruction is a later reuse, not an original naval objective." },
      ],
      denominator:
        "Uncounted by structure: voyages never logged or never preserved, non-European mariners, ports and seas outside strategic routes, and the gap between a recorded observation and a digitized one.",
      intentionality:
        "The archive’s climate pattern was not ‘meant’ by the original bureaucracies. Their incentives were navigation, command, safety, and imperial logistics; later scientists repurposed the residue.",
      recalibration:
        "Keeps [E] for ‘a usable historical dataset exists.’ Downgrades the tempting phrase ‘a global climate network’ to [C], because coverage and comparability are uneven.",
    },
  },
  {
    id: "03",
    short: "Census feedback",
    domains: "History · politics · sociology",
    title: "A census category can become a political audience.",
    image: "/manus-storage/oracle-engine-hero_783a1e2b.jpg",
    claim:
      "In late colonial India, official attempts to describe and classify social complexity helped stimulate caste-cluster consciousness and organizations. The category was not simply a neutral mirror: people could mobilize around, contest, and revise the public grouping in which they were counted.",
    inversion:
      "The default story says a census discovers a pre-existing population. The counterintuitive move is that classification can supply a public target for association and argument—without inventing every identity from nothing.",
    whyObvious:
      "A table looks passive. Its political afterlife is easy to miss because the causal action happens later, in petitions, associations, press debates, and resource claims.",
    howWeKnow:
      "Lucy Carroll’s archival synthesis argues that caste organizations and polemics were substantially responsive to foreign efforts to define and categorize Indian society, calling the effect largely unintended. Its cited cases distinguish caste-clusters from single endogamous jatis and show actors directly arguing with ethnological classifications.",
    confidence: "C",
    falsifier:
      "A multi-region historical design showing no increase in category-based organization, petitions, or political claims after comparable classification exposure—or showing that exposure adds no explanatory power once communication, education, law, and local hierarchy are measured—would weaken the feedback claim.",
    documented:
      "Enumerative and ethnological practices, category disputes, association activity, and printed arguments against official classification are documented in the historical record.",
    interpretedIntent:
      "It is not documented that the colonial state intended to manufacture caste politics. It is also false to erase the agency, older social forms, or strategic choices of Indian actors.",
    soWhat:
      "It offers a sharper warning for data governance: a label becomes politically consequential when it is repeated, public, contestable, and connected to claims—not merely because it appears in a spreadsheet.",
    openProblem:
      "Open problem: there is no clean, nationally representative causal estimate of how much classification itself mattered relative to law, print, rail, education, local hierarchy, and indigenous political strategy. The right answer may differ by province and category.",
    sources: [5],
    audit: {
      steelman:
        "The argument has unusually direct feedback evidence: actors did not merely happen to organize after enumeration; they contested ethnological accounts and gathered under public category names that crossed older endogamous boundaries. That is stronger than a before/after correlation.",
      gaps: [
        { kind: "Evidentiary", score: 3, text: "The interpretive archive is rich in visible associations and polemics, but it cannot observe every unorganized or silent group." },
        { kind: "Inferential", score: 4, text: "Feedback is credible in cases, yet the size of its effect relative to legal, economic, and political change is not identified nationwide." },
        { kind: "Sampling", score: 5, text: "Regional cases, surviving presses, literate elites, and successful associations are much more visible than non-formation." },
        { kind: "Semantic", score: 5, text: "‘Caste’ can flatten jati, caste-cluster, varna, occupation, and political association—the source itself warns against this collapse." },
        { kind: "Motivational", score: 3, text: "Officials often sought administrative legibility; participants had diverse motives that cannot be reduced to a state script." },
      ],
      denominator:
        "The denominator is the central wound: we need the full set of classified groups, including those that did not form associations, those whose records vanished, and the different incentives facing each group.",
      intentionality:
        "A classification may become an organizing handle even when administrators meant only to count or govern. Pattern-to-purpose is an invalid shortcut in both directions.",
      recalibration:
        "Keeps [C] for ‘helped stimulate’ in documented settings. Any claim that the census ‘created caste’ across India is too hot and should be marked [S].",
    },
  },
];

const branches = [
  {
    tag: "quick verify",
    title: "The qiblah-table commons",
    text: "Compare instrument manuals with no-instrument timekeeping texts to test whether technical knowledge spread beyond instrument-owning elites.",
  },
  {
    tag: "deep dig",
    title: "Climate data’s imperial coastline",
    text: "Map where CLIWOC observations exist against where maritime labor and imperial routes do not; treat absence as a historical variable, not empty ocean.",
  },
  {
    tag: "lifetime rabbit hole",
    title: "The afterlife of enumerated names",
    text: "Follow one category through census schedules, petitions, associations, law, electoral claims, and self-description—while tracking the people who refused its terms.",
  },
];

function SourceRef({ ids }: { ids: number[] }) {
  return (
    <span className="source-refs" aria-label="Sources">
      {ids.map((id) => {
        const source = sources.find((entry) => entry.id === id);
        return source ? (
          <a key={id} href={source.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>
            [{id}]
          </a>
        ) : null;
      })}
    </span>
  );
}

function TierStamp({ tier }: { tier: Tier }) {
  return <span className={`tier-stamp tier-${tier.toLowerCase()}`}>[{tier}] {tierInfo[tier].label}</span>;
}

export default function Home() {
  const [activeId, setActiveId] = useState("01");
  const [showSourcePanel, setShowSourcePanel] = useState(false);
  const [copied, setCopied] = useState(false);
  const [filter, setFilter] = useState<"all" | "E" | "C">("all");

  const activeItem = items.find((item) => item.id === activeId) ?? items[0];
  const filteredItems = useMemo(
    () => items.filter((item) => filter === "all" || item.confidence === filter),
    [filter],
  );

  const selectClaim = (id: string) => {
    setActiveId(id);
    document.getElementById("dossier")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const copyRoute = async () => {
    await navigator.clipboard?.writeText(`${document.title}\n${window.location.href}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="ledger-shell">
      <a className="skip-link" href="#dossier">Skip to research dossier</a>
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Oracle Engine home">
          <span className="brand-mark-frame" aria-hidden="true"><img src="/manus-storage/oracle-engine-logo_b6acee19.png" alt="" className="brand-mark" /><i /></span>
          <span>Oracle Engine</span>
        </a>
        <div className="topbar-tools">
          <button className="text-button" onClick={() => setShowSourcePanel(true)}>
            <BookOpen size={15} /> Source ledger <span className="tool-count">05</span>
          </button>
          <button className="text-button" onClick={copyRoute}>
            {copied ? <Check size={15} /> : <Share2 size={15} />} {copied ? "Copied" : "Share"}
          </button>
          <button className="text-button" onClick={() => window.print()}>
            <Printer size={15} /> Save
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-visual" aria-hidden="true" />
          <div className="hero-ink" />
          <div className="hero-inner">
            <p className="eyebrow hero-eyebrow"><span className="eyebrow-dot" /> Research dossier 01 / truth-constrained surprise</p>
            <h1 id="hero-title">Awe enters here.<br /><em>The denominator enters next.</em></h1>
            <p className="hero-deck">Three obscure, real cross-domain claims—generated, adversarially audited, then used to produce one narrower hypothesis. No evidence trail, no elevation.</p>
            <div className="hero-actions">
              <Button className="primary-cta" onClick={() => document.getElementById("dossier")?.scrollIntoView({ behavior: "smooth" })}>
                Open the dossier <ArrowDown size={16} />
              </Button>
              <button className="quiet-cta" onClick={() => setShowSourcePanel(true)}>Inspect sources <ArrowUpRight size={15} /></button>
            </div>
          </div>
          <div className="hero-index" aria-label="Research summary">
            <div><span>03</span><small>claims tested</small></div>
            <div><span>01</span><small>open problem</small></div>
            <div><span>05</span><small>source types</small></div>
          </div>
        </section>

        <section className="method-strip" aria-label="Method">
          <div className="method-label"><ScanSearch size={18} /> Operating rule</div>
          <p><strong>Grading down is success.</strong> Every claim is separated into what is documented, what is interpreted, and what would falsify it.</p>
          <div className="denominator-field mini-denominator" aria-label="Denominator field showing counted evidence, missing terrain, and uncertainty">
            <div className="denom-field-copy"><span>Denominator field</span><small>counted / missing / uncertain</small></div>
            <div className="denom-grid"><i className="counted" /><i className="counted" /><i className="missing" /><i className="counted" /><i className="uncertain" /><i className="missing" /><i className="counted" /><i className="missing" /></div>
          </div>
          <div className="tier-key">
            {(Object.keys(tierInfo) as Tier[]).map((tier) => <TierStamp key={tier} tier={tier} />)}
          </div>
        </section>

        <section className="atlas-wrap" id="dossier" aria-labelledby="dossier-title">
          <aside className="reading-rail">
            <p className="rail-label">Read in order</p>
            <h2 id="dossier-title">The dossier</h2>
            <nav aria-label="Research claims">
              {items.map((item) => (
                <button key={item.id} onClick={() => selectClaim(item.id)} className={`rail-claim ${activeId === item.id ? "is-active" : ""}`}>
                  <span>{item.id}</span>
                  <strong>{item.short}</strong>
                  <TierStamp tier={item.confidence} />
                </button>
              ))}
            </nav>
            <div className="rail-rule" />
            <p className="rail-note">The blue mark is a source route. The rust mark is a live uncertainty.</p>
          </aside>

          <div className="dossier-content">
            <div className="dossier-topline">
              <div>
                <p className="eyebrow"><span className="eyebrow-dot" /> Step 1 + Step 2</p>
                <h2>Generate the claim. Then make it survive contact with its gaps.</h2>
              </div>
              <div className="filter-set" aria-label="Filter claims by confidence">
                <Filter size={14} />
                {(["all", "E", "C"] as const).map((option) => (
                  <button key={option} onClick={() => setFilter(option)} className={filter === option ? "selected" : ""}>
                    {option === "all" ? "All" : `[${option}]`}
                  </button>
                ))}
              </div>
            </div>

            <div className="claim-stack">
              {filteredItems.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <article key={item.id} className={`claim-card ${isActive ? "is-open" : ""}`}>
                    <button className="claim-trigger" onClick={() => setActiveId(item.id)} aria-expanded={isActive}>
                      <span className="claim-number">{item.id}</span>
                      <span className="claim-heading">
                        <span className="domain-line">{item.domains}</span>
                        <span>{item.title}</span>
                      </span>
                      <span className="claim-meta"><TierStamp tier={item.confidence} /> <ChevronDown size={18} /></span>
                    </button>

                    {isActive && (
                      <div className="claim-body">
                        <div className="binding-bracket" aria-hidden="true"><span>claim</span><i /><span>audit</span></div>
                        <div className="claim-photo" style={{ backgroundImage: `url(${item.image})` }} />
                        <div className="claim-assertion">
                          <div className="section-kicker"><Sparkles size={14} /> Generator output</div>
                          <p className="claim-text">{item.claim} <SourceRef ids={item.sources} /></p>
                          <div className="assertion-grid">
                            <div><h3>Inversion</h3><p>{item.inversion}</p></div>
                            <div><h3>Why it felt obvious</h3><p>{item.whyObvious}</p></div>
                            <div><h3>How we know</h3><p>{item.howWeKnow}</p></div>
                            <div><h3>Falsifier</h3><p>{item.falsifier}</p></div>
                          </div>
                          <div className="quarantine-box">
                            <div className="quarantine-title"><FileSearch size={15} /> Quarantine</div>
                            <p><strong>Documented:</strong> {item.documented}</p>
                            <p><strong>Interpreted intent:</strong> {item.interpretedIntent}</p>
                          </div>
                          <div className="so-what"><span>SO WHAT</span><p>{item.soWhat}</p></div>
                          {item.openProblem && <div className="open-problem"><Eye size={16} /><div><strong>Honest open problem</strong><p>{item.openProblem}</p></div></div>}
                        </div>

                        <div className="audit-panel">
                          <div className="audit-title"><span>02</span><div><p className="eyebrow">Adversarial audit</p><h3>Steelman first. Then locate the failure modes.</h3></div></div>
                          <div className="steelman"><strong>Steelman</strong><p>{item.audit.steelman}</p></div>
                          <div className="gap-chart" aria-label="Audit gap intensity, scored 1 to 5">
                            <div className="gap-chart-heading"><span>Gap intensity</span><small>Editorial severity 1–5; not a statistical estimate.</small></div>
                            {item.audit.gaps.map((gap) => (
                              <div className="gap-row" key={gap.kind}>
                                <div className="gap-label"><span>{gap.kind}</span><small>{gap.text}</small></div>
                                <div className="gap-track"><i style={{ width: `${gap.score * 20}%` }} /><b>{gap.score}</b></div>
                              </div>
                            ))}
                          </div>
                          <div className="audit-checks">
                            <div><h4>Denominator check</h4><p>{item.audit.denominator}</p><div className="denominator-field audit-denominator" aria-hidden="true"><div className="denom-field-copy"><span>Field glyph</span><small>observed / absent / unknown</small></div><div className="denom-grid"><i className="counted" /><i className="counted" /><i className="missing" /><i className="uncertain" /><i className="missing" /><i className="counted" /><i className="missing" /><i className="uncertain" /></div></div></div>
                            <div><h4>Intentionality audit</h4><p>{item.audit.intentionality}</p></div>
                          </div>
                          <div className="recalibration"><span>RECALIBRATION</span><p>{item.audit.recalibration}</p></div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="theory-section" aria-labelledby="theory-title">
          <div className="theory-aside">
            <p className="eyebrow"><span className="eyebrow-dot" /> Step 3</p>
            <h2 id="theory-title">Theorize from the strongest gap.</h2>
            <p>The best gap is not a blemish. It is a design brief for a narrower question.</p>
          </div>
          <div className="theory-card">
            <div className="theory-stamp"><TierStamp tier="S" /><span>Hypothesis 01</span></div>
            <h3>The conditional configuration hypothesis</h3>
            <p className="theory-lede">A public classification is most likely to become an organizing identity <em>when it is paired with a contestable resource</em>—representation, status, law, or allocation—not merely when a state prints the label.</p>
            <div className="theory-grid">
              <div><h4>Why it improves on the incumbent</h4><p>“Classification creates identity” predicts too much. This version predicts variation: the same label should have weak organizational effects when it carries no claimable stake and stronger effects when actors can use it to make a public demand.</p></div>
              <div><h4>Falsifiable test</h4><p>Build a province-by-category panel linking census exposure, resource-linked rules, association/petition formation, print reach, and baseline hierarchy. The hypothesis fails if resource linkage adds no predictive value, or if classification has the same effect where no resource is in play.</p></div>
            </div>
            <div className="theory-audit">
              <div><span>DENOMINATOR</span><p>Count non-associations and missing archives, not only successful organizations. Compare similar classified groups across places and periods.</p></div>
              <div><span>INTENTIONALITY</span><p>The mechanism does not require a state plan to create identities. It only requires a public label plus a contestable channel in which actors can strategically use or reject it.</p></div>
              <div><span>VERDICT</span><p><strong>Passes as a falsifiable [S] hypothesis.</strong> It is not confirmed; it is more disciplined than a totalizing census story.</p></div>
            </div>
          </div>
        </section>

        <section className="branch-section" aria-labelledby="branch-title">
          <div className="branch-heading">
            <p className="eyebrow"><span className="eyebrow-dot" /> Step 4</p>
            <h2 id="branch-title">Branch without pretending the map is finished.</h2>
          </div>
          <div className="branch-list">
            {branches.map((branch, index) => (
              <article className="branch-card" key={branch.title}>
                <span className="branch-index">0{index + 1}</span>
                <span className={`branch-tag tag-${branch.tag.split(" ")[0]}`}>{branch.tag}</span>
                <h3>{branch.title}</h3>
                <p>{branch.text}</p>
                <button onClick={() => setShowSourcePanel(true)}>Open research route <ArrowUpRight size={15} /></button>
              </article>
            ))}
          </div>
        </section>

        <section className="closing-strip">
          <div><p className="eyebrow"><span className="eyebrow-dot" /> Research utility</p><h2>Keep the spectacle.<br />Keep the brake system.</h2></div>
          <div className="closing-actions"><Button className="primary-cta" onClick={() => setShowSourcePanel(true)}>View source ledger <BookOpen size={16} /></Button><button className="quiet-cta dark-quiet" onClick={copyRoute}>{copied ? "Link copied" : "Share this dossier"} <Share2 size={15} /></button></div>
        </section>
      </main>

      {showSourcePanel && (
        <div className="source-overlay" role="dialog" aria-modal="true" aria-labelledby="source-title">
          <button className="overlay-dismiss" aria-label="Close source ledger" onClick={() => setShowSourcePanel(false)} />
          <aside className="source-drawer">
            <div className="drawer-head"><div><p className="eyebrow"><span className="eyebrow-dot" /> Evidence exits</p><h2 id="source-title">Source ledger</h2></div><button onClick={() => setShowSourcePanel(false)} aria-label="Close source ledger"><X size={20} /></button></div>
            <p className="drawer-intro">Claims are bounded by the sources that bear their weight. These links open in a new tab; the report does not claim access to material it has not inspected.</p>
            <div className="source-list">
              {sources.map((source) => <a href={source.url} target="_blank" rel="noreferrer" key={source.id} className="source-item"><span>[{source.id}]</span><div><strong>{source.label}</strong><small>{source.type}</small></div><ExternalLink size={15} /></a>)}
            </div>
            <div className="drawer-note"><strong>Method note.</strong> [E] describes direct source/data support; [C] a corroborated interpretation; [F] a test-ready claim; [S] a speculative hypothesis. Tiers grade the sentence, not the people or traditions in it.</div>
          </aside>
        </div>
      )}
    </div>
  );
}
