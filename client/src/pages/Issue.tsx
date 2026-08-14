import { useState } from "react";
import { ArrowLeft, ArrowUpRight, ChevronDown, ExternalLink, FileSearch, Share2 } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { foundingIssue, formatIssueDate, type NewsletterInsight } from "@/lib/newsletterData";

const tierName = { E: "Established", C: "Corroborated", F: "Falsifiable", S: "Speculative" };

function InsightStory({ insight, index }: { insight: NewsletterInsight; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <article className="story-card">
      <div className="story-number">0{index + 1}</div>
      <p className="story-domains">{insight.domains}</p>
      <div className="story-title-row"><h2>{insight.title}</h2><span className={`newsletter-tier tier-${insight.tier.toLowerCase()}`}>[{insight.tier}] {tierName[insight.tier]}</span></div>
      <div className="story-reading"><div><p className="story-label">The main claim</p><p>{insight.claim}</p></div><div className="story-so-what"><p className="story-label">Why it matters</p><p>{insight.soWhat}</p></div></div>
      <button className="audit-toggle" onClick={() => setOpen(value => !value)} aria-expanded={open}><FileSearch size={15} /> {open ? "Close the audit" : "Show the audit, source notes & falsifier"}<ChevronDown size={16} /></button>
      {open && <div className="story-audit"><div><p className="story-label">Audit</p><p>{insight.audit}</p></div><div><p className="story-label">What the record misses</p><p>{insight.denominator}</p></div><div><p className="story-label">What would change our mind</p><p>{insight.falsifier}</p></div><div className="story-sources"><p className="story-label">Sources</p>{insight.sources.map(source => <a href={source.url} target="_blank" rel="noreferrer" key={source.url}><span>{source.type}</span>{source.label}<ExternalLink size={13} /></a>)}</div></div>}
    </article>
  );
}

export default function Issue() {
  const [, params] = useRoute("/issue/:slug");
  const slug = params?.slug ?? foundingIssue.slug;
  const remote = trpc.newsletter.bySlug.useQuery({ slug }, { enabled: slug !== foundingIssue.slug });
  const source = slug === foundingIssue.slug ? foundingIssue : remote.data;

  if (remote.isLoading) return <div className="newsletter-shell issue-shell"><p className="eyebrow">Opening the issue…</p></div>;
  if (!source) return <div className="newsletter-shell issue-shell"><Link href="/" className="back-link"><ArrowLeft size={16} /> Back to Dispatch</Link><h1>That edition is not in the public archive yet.</h1></div>;

  const insights: NewsletterInsight[] = source.insights.map((insight: any) => ({
    title: insight.title,
    domains: insight.domains,
    tier: insight.tier,
    claim: insight.mainClaim ?? insight.claim,
    soWhat: insight.soWhat,
    audit: insight.auditNote ?? insight.audit,
    denominator: insight.denominatorNote ?? insight.denominator,
    falsifier: insight.falsifier,
    sources: (insight.sources ?? []).map((entry: any) => ({ label: entry.label, url: entry.url, type: entry.sourceType ?? entry.type })),
  }));

  return <div className="newsletter-shell issue-shell"><header className="newsletter-nav"><Link href="/" className="newsletter-brand"><span className="brand-orbit" /><span>Oracle Dispatch</span></Link><button onClick={() => navigator.clipboard?.writeText(window.location.href)} className="nav-share"><Share2 size={15} /> Share issue</button></header><main className="issue-main"><Link href="/" className="back-link"><ArrowLeft size={16} /> All editions</Link><p className="issue-kicker">Issue / {formatIssueDate(source.publishedAt)}</p><h1>{source.title}</h1><p className="issue-standfirst">{source.standfirst}</p>{source.editorNote && <aside className="editor-note"><span>From the desk</span>{source.editorNote}</aside>}<div className="story-stack">{insights.map((insight, index) => <InsightStory key={insight.title} insight={insight} index={index} />)}</div><section className="issue-closing"><p>Want the short version next time?</p><h2>One surprising idea, one practical implication, and the evidence trail to check it.</h2><Button className="newsletter-button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Read another edition <ArrowUpRight size={16} /></Button></section></main></div>;
}
