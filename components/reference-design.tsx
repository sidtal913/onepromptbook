import type React from "react"

// Simple in-file UI primitives to avoid external deps
function Container({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}
function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-2xl shadow-sm border border-black/5 bg-white ${className}`}>{children}</div>
}
function Button({ children, className = "", href }: React.PropsWithChildren<{ className?: string; href?: string }>) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition transform-gpu hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2"
  const styles = "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500"
  const btn = <span className={`${base} ${styles} ${className}`}>{children}</span>
  if (href) return <a href={href}>{btn}</a>
  return <button>{btn}</button>
}

export default function ChildrenAIPortal() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-[#FFF8F1] via-[#F7F7FF] to-[#F1FAFF] text-slate-800">
      {/* Decorative background shapes */}
      <svg
        className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[600px] -translate-x-1/2 opacity-60"
        viewBox="0 0 600 600"
        fill="none"
        aria-hidden
      >
        <g filter="url(#a)">
          <circle cx="300" cy="300" r="180" fill="#E0E7FF" />
          <circle cx="420" cy="240" r="110" fill="#FDE68A" />
          <circle cx="220" cy="200" r="90" fill="#A7F3D0" />
        </g>
        <defs>
          <filter
            id="a"
            x="0"
            y="0"
            width="600"
            height="600"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="60" />
          </filter>
        </defs>
      </svg>

      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-black/10">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-sm" />
            <span className="text-lg font-black tracking-tight text-slate-900">KinderForge</span>
          </div>
          <nav className="hidden gap-6 text-sm md:flex">
            <a className="hover:text-indigo-700 text-slate-800 font-medium transition-colors" href="#features">
              Features
            </a>
            <a className="hover:text-indigo-700 text-slate-800 font-medium transition-colors" href="#demo">
              Demo
            </a>
            <a className="hover:text-indigo-700 text-slate-800 font-medium transition-colors" href="#gallery">
              Gallery
            </a>
            <a className="hover:text-indigo-700 text-slate-800 font-medium transition-colors" href="#pricing">
              Pricing
            </a>
            <a className="hover:text-indigo-700 text-slate-800 font-medium transition-colors" href="#faq">
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-black/5 text-slate-800 transition-colors"
              href="#"
            >
              Sign in
            </a>
            <Button href="#pricing">Get started</Button>
          </div>
        </Container>
      </header>

      {/* Hero */}
      <section className="relative">
        <Container className="grid grid-cols-1 items-center gap-10 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              Create children’s ebooks & coloring books from a simple prompt
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600">
              Parents get peace at dinner. Kids get delightful pages—coloring, mazes, word searches—automatically laid
              out for Amazon KDP or instant printables.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button href="#demo">Try the live demo</Button>
              <a href="#how" className="text-sm font-semibold underline underline-offset-4">
                See how it works
              </a>
            </div>
            <ul className="mt-8 grid max-w-lg grid-cols-2 gap-3 text-sm text-slate-700">
              <li className="rounded-xl bg-white/80 px-4 py-3 shadow-sm">KDP-ready sizes (8.5×11, 8×10, 6×9)</li>
              <li className="rounded-xl bg-white/80 px-4 py-3 shadow-sm">Age presets (2–4, 5–7, 8–12)</li>
              <li className="rounded-xl bg-white/80 px-4 py-3 shadow-sm">Brand-safe, original art</li>
              <li className="rounded-xl bg-white/80 px-4 py-3 shadow-sm">One-click PDF export</li>
            </ul>
          </div>

          {/* Hero preview card */}
          <Card className="relative overflow-hidden">
            <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-pink-200/60" />
            <div className="absolute -bottom-8 -left-10 h-40 w-40 rounded-full bg-sky-200/60" />
            <div className="relative p-6">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Live builder preview
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm">
                  Theme
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
                    placeholder="Dinosaurs at the park"
                  />
                </label>
                <label className="text-sm">
                  KDP Size
                  <select className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2">
                    <option>8.5 × 11 in</option>
                    <option>8 × 10 in</option>
                    <option>6 × 9 in</option>
                  </select>
                </label>
                <label className="text-sm">
                  Pages
                  <input
                    type="number"
                    className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2"
                    defaultValue={30}
                  />
                </label>
                <label className="text-sm">
                  Age range
                  <select className="mt-1 w-full rounded-xl border border-black/10 px-3 py-2">
                    <option>2–4</option>
                    <option>5–7</option>
                    <option>8–12</option>
                  </select>
                </label>
              </div>
              <div className="mt-4">
                <textarea
                  className="h-28 w-full resize-none rounded-xl border border-black/10 px-3 py-2 text-sm"
                  placeholder="Describe your book. Example: 10 coloring pages of friendly dinosaurs, 5 easy mazes from egg to nest, 5 word searches with dino words, cover with a smiling T-Rex."
                ></textarea>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-500">Est. 30 pages • PDF ~8 MB</span>
                <Button className="">Generate book</Button>
              </div>
            </div>
          </Card>
        </Container>
      </section>

      {/* Features */}
      <section id="features" className="py-16 md:py-24">
        <Container>
          <h2 className="text-3xl font-black tracking-tight">Built for speed, safety, and quality</h2>
          <p className="mt-2 max-w-2xl text-slate-600">
            Launch themed activity books in minutes with brand-safe art and age-appropriate content.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                t: "One‑prompt builder",
                d: "Describe your idea once—get a full page plan with coloring, mazes, word searches, tracing, and more.",
              },
              {
                t: "KDP-ready PDFs",
                d: "Trim sizes, margins, and grayscale embedded. Export as PDF or PNG bundle for printables.",
              },
              {
                t: "Original line art",
                d: "Brand-safe, high-contrast outlines suitable for kids’ coloring. No copyrighted characters.",
              },
              {
                t: "Procedural puzzles",
                d: "Mazes and word searches generated with guaranteed solvability and answer keys.",
              },
              { t: "Multilingual", d: "English & French content with age-appropriate tone and simple reading levels." },
              { t: "Team & quotas", d: "Org workspaces, roles, usage limits, and billing for predictable costs." },
            ].map((f, i) => (
              <Card key={i} className="p-6">
                <div className="mb-2 h-10 w-10 rounded-xl bg-indigo-100" />
                <div className="text-base font-bold">{f.t}</div>
                <p className="mt-1 text-sm text-slate-600">{f.d}</p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Demo strip */}
      <section id="demo" className="border-y border-black/5 bg-white/70 py-14">
        <Container className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h3 className="text-2xl font-black">See a page come to life</h3>
            <p className="mt-2 text-slate-600">
              Preview low‑res thumbnails while the job runs in the background. Regenerate any page you don’t love.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <Button href="#">Open interactive demo</Button>
              <a className="text-sm font-semibold underline underline-offset-4" href="#">
                View sample PDF
              </a>
            </div>
          </div>
          <Card className="overflow-hidden">
            <div className="grid grid-cols-3 gap-2 p-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="aspect-[3/4] w-full rounded-xl bg-gradient-to-br from-violet-50 to-sky-50" />
              ))}
            </div>
          </Card>
        </Container>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-16 md:py-24">
        <Container>
          <h3 className="text-2xl font-black">Themes parents love</h3>
          <p className="mt-2 text-slate-600">
            Restaurant Survival • Playground Fun • Space Adventure • Cute Pets • Soccer Stars • Dino World
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Restaurant Survival",
              "Playground Fun",
              "Space Adventure",
              "Cute Pets",
              "Soccer Stars",
              "Dino World",
            ].map((name, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-40 w-full bg-gradient-to-br from-amber-50 to-rose-50" />
                <div className="p-4">
                  <div className="text-sm font-bold">{name}</div>
                  <p className="mt-1 text-xs text-slate-600">
                    Includes coloring, 5–10 mazes, 3–5 word searches, and tracing pages.
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-black/5 bg-white/70 py-16 md:py-24">
        <Container>
          <h3 className="text-2xl font-black">Simple pricing</h3>
          <p className="mt-2 text-slate-600">Start free. Upgrade when you’re ready to publish.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Free",
                price: "$0",
                desc: "Great for exploration",
                features: ["20 pages/mo", "Watermarked PDFs", "No image generation"],
              },
              {
                name: "Pro",
                price: "$19",
                desc: "For solo creators",
                features: ["300 pages/mo", "Image generation", "Priority queue"],
              },
              {
                name: "Team",
                price: "$49",
                desc: "For small studios",
                features: ["1000 pages/mo", "Org roles", "Shared assets"],
              },
            ].map((tier, i) => (
              <Card key={i} className={`p-6 ${tier.name === "Pro" ? "ring-2 ring-indigo-500" : ""}`}>
                <div className="text-sm font-bold">{tier.name}</div>
                <div className="mt-1 text-3xl font-black">
                  {tier.price}
                  <span className="text-base font-semibold text-slate-500">/mo</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{tier.desc}</p>
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {tier.features.map((f, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full">Choose {tier.name}</Button>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 md:py-24">
        <Container>
          <h3 className="text-2xl font-black">FAQ</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <Card className="p-5">
              <div className="font-semibold">Are the images safe to use commercially?</div>
              <p className="mt-1 text-sm text-slate-600">
                Yes. We generate original, brand-safe line art and block trademarked terms. You can publish on KDP or
                sell printables.
              </p>
            </Card>
            <Card className="p-5">
              <div className="font-semibold">Which sizes do you support?</div>
              <p className="mt-1 text-sm text-slate-600">
                8.5×11”, 8×10”, and 6×9” with proper margins; PNG bundles for Etsy are also available.
              </p>
            </Card>
            <Card className="p-5">
              <div className="font-semibold">Can I edit a single page?</div>
              <p className="mt-1 text-sm text-slate-600">
                Yes—regenerate or tweak any page before compiling your final PDF.
              </p>
            </Card>
            <Card className="p-5">
              <div className="font-semibold">Do you support bilingual books?</div>
              <p className="mt-1 text-sm text-slate-600">
                Yes. English and French content generation is built-in with age-appropriate tone.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      {/* Footer */}
      <footer className="border-t border-black/5 py-10 text-sm">
        <Container className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-slate-600">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500" />
            <span>KinderForge</span>
            <span className="mx-2">•</span>
            <span className="text-slate-500">Create. Print. Play.</span>
          </div>
          <div className="flex items-center gap-6 text-slate-600">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </Container>
      </footer>
    </main>
  )
}
