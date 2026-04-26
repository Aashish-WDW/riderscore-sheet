import { Link } from "react-router-dom";

type TestCard = {
  slug: string;
  category: string;
  title: string;
  appendix: string;
  description: string;
  accent: string;
};

const TESTS: TestCard[] = [
  {
    slug: "young-rider",
    category: "Young Rider",
    title: "Dressage Test",
    appendix: "Appendix A",
    description: "Time 6′30″ · Minimum age of horse: 6 years",
    accent: "from-highlight/20 to-transparent",
  },
  {
    slug: "junior",
    category: "Junior",
    title: "Dressage Test",
    appendix: "Appendix C",
    description: "Junior level dressage scoring sheet",
    accent: "from-primary/15 to-transparent",
  },
  {
    slug: "children-i",
    category: "Children I",
    title: "Dressage Test",
    appendix: "Appendix D",
    description: "Children Preliminary level test",
    accent: "from-accent to-transparent",
  },
  {
    slug: "children-ii",
    category: "Children II",
    title: "Dressage Test",
    appendix: "Appendix E",
    description: "Children Team & Individual test",
    accent: "from-highlight/15 to-transparent",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto max-w-[1200px] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary text-primary-foreground grid place-items-center font-display font-semibold">
              H
            </div>
            <div>
              <div className="font-display text-lg leading-tight">Horsey</div>
              <div className="text-xs text-muted-foreground tracking-wide uppercase">Dressage · Interactive sheets</div>
            </div>
          </div>
          <div className="hidden md:block text-xs text-muted-foreground">
            Select a test to begin scoring
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-16">
        <section className="mb-14 text-center md:text-left">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            FEI · Dressage
          </div>
          <h1 className="font-display text-5xl md:text-6xl tracking-tight">
            The <span className="italic text-highlight">scoring</span> system
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-2xl">
            A quiet, focused workspace for judges and stewards. Pick a test below to open its
            interactive scoring sheet — your work autosaves as you go.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
          {TESTS.map((t) => (
            <Link
              key={t.slug}
              to={`/scoring/${t.slug}`}
              className="group relative overflow-hidden bg-card border border-border rounded-xl p-7 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5"
            >
              <div
                className={`absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br ${t.accent} blur-3xl opacity-70 group-hover:opacity-100 transition-opacity`}
              />
              <div className="relative">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                      {t.appendix}
                    </div>
                    <h2 className="font-display text-2xl tracking-tight leading-tight">
                      {t.category}
                    </h2>
                    <div className="text-sm text-muted-foreground mt-1">{t.title}</div>
                  </div>
                  <div className="h-10 w-10 rounded-full border border-border grid place-items-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                    →
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.description}
                </p>
                <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    Open scoring sheet
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    /{t.slug}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        Horsey · FEI Dressage Interactive Scoring Sheets
      </footer>
    </div>
  );
};

export default Index;
