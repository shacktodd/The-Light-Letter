export type NewsletterSource = { label: string; url: string; type: string };

export type NewsletterInsight = {
  title: string;
  domains: string;
  tier: "E" | "C" | "F" | "S";
  claim: string;
  soWhat: string;
  audit: string;
  denominator: string;
  falsifier: string;
  sources: NewsletterSource[];
};

export const foundingIssue = {
  slug: "founding-issue-2026-08-13",
  title: "Three places where the record did more than record",
  standfirst:
    "A mosque office became an astronomy service; imperial paperwork became climate data; a census category became a political handle. The connecting lesson is not that institutions secretly plan everything. It is that a routine record can acquire a second life when people learn how to use it.",
  editorNote:
    "Start with the readable version. Open the audit only if you want to inspect the brake system. Both are part of the argument.",
  issueType: "regular" as const,
  publishedAt: "2026-08-13T17:00:00.000Z",
  currentRelevance: null,
  insights: [
    {
      title: "A mosque timekeeper was also an applied astronomer.",
      domains: "Spirituality · science · city life",
      tier: "E" as const,
      claim:
        "From at least the thirteenth century, major urban mosques employed timekeepers who used astronomical calculation to coordinate prayer times and religious calendars.",
      soWhat:
        "It is a useful correction to the idea that faith and precise science always occupied separate rooms. Some of the most practical scientific work happens when a community needs a reliable shared rhythm.",
      audit:
        "The job, instruments, and working texts are documented. What is not proven is that mosque patrons set out to advance science as a separate goal.",
      denominator:
        "Small mosques, informal timekeepers, lost manuals, and people who used the schedule without owning instruments are largely invisible in the surviving record.",
      falsifier:
        "A representative study showing that these timekeepers rarely performed astronomical calculation, or that the tools were not used for ritual timekeeping, would overturn the narrow claim.",
      sources: [
        { label: "Hill Museum & Manuscript Library — Astronomical Technology and Religious Practice in Islam", url: "https://hmml.org/stories/series-celestial-astronomical-technology/", type: "Manuscript collection overview" },
        { label: "David A. King — The Astronomy of the Mamluks", url: "https://doi.org/10.1086/353360", type: "History of science" },
      ],
    },
    {
      title: "Imperial ship logs became climate observations.",
      domains: "Climate science · history · politics",
      tier: "E" as const,
      claim:
        "Daily weather notes kept on European naval vessels have been turned into a major source for reconstructing ocean weather before modern instruments were widespread.",
      soWhat:
        "A record made for navigation and command can later answer a different question altogether. That makes provenance important: useful data can still carry the shape of the power that produced it.",
      audit:
        "The digitized observation set and its climate-reconstruction uses are documented. It is too strong to call it a neutral global observing network.",
      denominator:
        "The maps follow imperial routes and archival survival. Non-European mariners, unstrategic seas, lost voyages, and non-digitized logs do not appear at the same rate.",
      falsifier:
        "If transcription or calibration audits showed the weather fields were non-contemporaneous, systematically copied, or unusable against independent climate indicators, the claim would fail.",
      sources: [
        { label: "García-Herrera et al. — Ship logbooks help analyze pre-instrumental climate", url: "https://epic.awi.de/id/eprint/17061/", type: "Project publication" },
        { label: "NOAA/NCEI — ICOADS", url: "https://www.ncei.noaa.gov/products/international-comprehensive-ocean-atmosphere-data-set", type: "Data documentation" },
      ],
    },
    {
      title: "A census label can become a political audience.",
      domains: "Politics · sociology · history",
      tier: "C" as const,
      claim:
        "In late colonial India, official efforts to classify society helped give caste-cluster organizations a public category to argue with, organize around, and contest.",
      soWhat:
        "Data labels do not merely describe. When a label is public, repeatable, and tied to status or resources, people may have to respond to it—even when they did not choose it.",
      audit:
        "Historical cases show a credible feedback loop. They do not justify the sweeping claim that a census simply ‘created caste’ across an entire subcontinent.",
      denominator:
        "Visible associations, literate elites, and surviving press records are overrepresented; non-formation and local variation are much harder to count.",
      falsifier:
        "The interpretation weakens if comparable classification exposure shows no association, petition, or category-claim effects after law, print, education, hierarchy, and resource access are considered.",
      sources: [
        { label: "Lucy Carroll — Colonial Perceptions of Indian Society and the Emergence of Caste(s) Associations", url: "https://doi.org/10.2307/2054164", type: "Historical scholarship" },
      ],
    },
  ],
};

export const formatIssueDate = (value: Date | string | null | undefined) => {
  if (!value) return "In the archive";
  return new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
};
