import { useMemo } from "react";
import { ArrowDownRight, ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, Clock3, ExternalLink, FileSearch, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { foundingIssue, formatIssueDate } from "@/lib/newsletterData";

const dates = [
  { label: "Every 3 days", text: "A new three-idea edition arrives after the research and audit pass." },
  { label: "Every week", text: "At least one edition connects to a current event with dated source links." },
  { label: "Always", text: "No source, no elevation. Failed checks stay out of the public feed." },
];

export default function Home() {
  const remote = trpc.newsletter.list.useQuery();
  const recents = useMemo(() => {
    const fromDatabase = (remote.data ?? []).map(item => ({ ...item, local: false }));
    const founding = { id: 0, slug: foundingIssue.slug, title: foundingIssue.title, standfirst: foundingIssue.standfirst, issueType: "regular" as const, currentRelevance: null, publishedAt: foundingIssue.publishedAt, local: true };
    return [...fromDatabase.filter(item => item.slug !== founding.slug), founding].sort((a, b) => new Date(b.publishedAt ?? 0).getTime() - new Date(a.publishedAt ?? 0).getTime());
  }, [remote.data]);

  return <div className="newsletter-shell">
    <header className="newsletter-nav"><Link href="/" className="newsletter-brand"><span className="brand-orbit" /><span>Oracle Dispatch</span></Link><nav><a href="#latest">Latest issue</a><a href="#recents">Recents</a><a href="#method">How we work</a></nav><span className="newsletter-status"><span /> Publishing on a three-day rhythm</span></header>
    <main>
      <section className="newsletter-hero"><div className="newsletter-hero-copy"><p className="eyebrow"><Sparkles size={13} /> A research newsletter for the curious and busy</p><h1>Big ideas.<br /><em>Clear language.</em></h1><p>Three surprising connections from science, history, politics, society, and spiritual life—written so the point lands before the footnotes begin.</p><div className="hero-links"><a href="#latest" className="newsletter-button">Read the latest <ArrowDownRight size={16} /></a><a href="#method" className="text-link">See the method <ArrowUpRight size={15} /></a></div></div><div className="hero-issue-card"><div className="issue-card-top"><span>Issue 001</span><span>{formatIssueDate(foundingIssue.publishedAt)}</span></div><p className="issue-card-kicker">The founding edition</p><h2>When a record becomes something else.</h2><p>Three ways institutions made information that later acquired a second life.</p><Link href={`/issue/${foundingIssue.slug}`} className="issue-card-link">Open the edition <ArrowUpRight size={15} /></Link><div className="orbit-field" aria-hidden="true"><i /><i /><i /><b /></div></div></section>

      <section className="reader-promise"><p>Start with the point. Stay for the proof.</p><div><span>01</span><strong>Plain-language claim</strong><small>What you need to know, without jargon.</small></div><div><span>02</span><strong>Why it matters</strong><small>The practical consequence, not just the trivia.</small></div><div><span>03</span><strong>Open audit</strong><small>Sources, caveats, and what could prove it wrong.</small></div></section>

      <section id="latest" className="latest-edition"><div className="section-heading"><p className="eyebrow"><BookOpen size={13} /> Latest edition</p><h2>{foundingIssue.title}</h2><p>{foundingIssue.standfirst}</p><Link href={`/issue/${foundingIssue.slug}`} className="text-link">Read the full issue <ArrowUpRight size={15} /></Link></div><div className="latest-insight-list">{foundingIssue.insights.map((insight, index) => <Link key={insight.title} href={`/issue/${foundingIssue.slug}`} className="latest-insight"><span>0{index + 1}</span><div><p>{insight.domains}</p><h3>{insight.title}</h3><strong>So what:</strong> {insight.soWhat}</div><ArrowUpRight size={18} /></Link>)}</div></section>

      <section className="current-lane"><div className="current-icon"><CalendarDays size={27} /></div><div><p className="eyebrow">Current-affairs commitment</p><h2>Once a week, the archive meets the news cycle.</h2><p>The upcoming research run will add a current-events signal only when it can state the date, name its sources, and explain the connection without forcing a trend.</p></div><div className="current-rules"><span>Weekly signal</span><p>Two current sources minimum. A dated relevance note. The same audit standard as every other edition.</p><span className="pending-chip"><Clock3 size={13} /> First signal queued</span></div></section>

      <section id="recents" className="recents-section"><div className="section-heading"><p className="eyebrow"><Clock3 size={13} /> Dated archive</p><h2>Recents</h2><p>Every edition stays where it was published. New research appears at the top; corrections are marked rather than silently swapped in.</p></div><div className="recent-feed">{recents.map((edition, index) => <Link href={`/issue/${edition.slug}`} className="recent-row" key={edition.slug}><span className="recent-number">{String(index + 1).padStart(2, "0")}</span><span className="recent-date">{formatIssueDate(edition.publishedAt)}</span><div><p>{edition.issueType === "current" ? "Current signal" : "Regular edition"}</p><h3>{edition.title}</h3><span>{edition.standfirst}</span></div><ArrowUpRight size={18} /></Link>)}</div></section>

      <section id="method" className="method-section"><div><p className="eyebrow"><FileSearch size={13} /> How the Dispatch earns attention</p><h2>Surprise is the invitation.<br />Truth is the constraint.</h2></div><div className="method-steps">{dates.map((step, index) => <article key={step.label}><span>0{index + 1}</span><h3>{step.label}</h3><p>{step.text}</p></article>)}</div></section>

      <section className="newsletter-footer"><div><p className="eyebrow"><CheckCircle2 size={13} /> Oracle Engine</p><h2>Ideas worth slowing down for.</h2></div><a href="#latest" className="newsletter-button">Read issue 001 <ExternalLink size={16} /></a></section>
    </main>
  </div>;
}
