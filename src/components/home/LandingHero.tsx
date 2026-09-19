import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Wrench, BookOpen } from "lucide-react";
import Container from "@/components/layout/Container";
import { useI18n } from "@/lib/i18n/context";

export const LandingHero: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="relative w-full overflow-hidden bg-[#0c0406] text-white">
      {/* Cinematic Grand Piano Library Background */}
      <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] w-full flex flex-col justify-between">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/hero/library-grand-piano.jpg"
            alt="Steinway & Sons Grand Piano in Private Library"
            className="h-full w-full object-cover object-center lg:object-[center_35%]"
          />
          {/* Multi-layered cinematic gradient overlays */}
          {/* Horizontal darkening for left-aligned typography */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c0406]/95 via-[#0c0406]/85 sm:via-[#0c0406]/75 lg:via-[#0c0406]/55 to-transparent" />
          {/* Subtle vignette from top and bottom */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0c0406]/60 via-transparent to-[#0c0406]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 my-auto py-16 sm:py-20 lg:py-24">
          <Container width="default">
            <div className="max-w-2xl text-left">
              {/* Eyebrow */}
              <div className="mb-4 inline-flex items-center gap-2">
                <span className="h-px w-6 bg-[#d4af37]" />
                <span className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-[#d4af37] uppercase">
                  Learn · Practice · Explore · Belong
                </span>
              </div>

              {/* Main Display Heading */}
              <h1
                className="font-serif text-4xl sm:text-5xl lg:text-[3.75rem] font-medium leading-[1.12] text-[#fcf9f2] mb-5 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                A Deeper Journey with the Piano
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-[#d4c3b3] leading-relaxed mb-8 max-w-xl font-light opacity-95">
                Thoughtful articles, practical tools, and trusted resources to help you grow as a pianist — at any stage of your journey.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to="/articles"
                  className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#d4af37] via-[#e8c868] to-[#b38822] px-6 py-3.5 text-sm sm:text-base font-semibold text-[#180d04] shadow-[0_4px_16px_rgba(212,175,55,0.4)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_6px_22px_rgba(212,175,55,0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
                >
                  <span>Explore Articles</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <Link
                  to="/tools"
                  className="inline-flex items-center justify-center rounded-lg border border-[#d4af37]/60 bg-[#120507]/65 px-6 py-3.5 text-sm sm:text-base font-medium text-[#f6deb3] shadow-[0_2px_8px_rgba(0,0,0,0.5)] backdrop-blur-sm transition-all duration-200 hover:bg-[#22070a]/90 hover:border-[#d4af37] hover:text-[#fff3db] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37]"
                >
                  Browse Tools
                </Link>
              </div>
            </div>
          </Container>
        </div>

        {/* Under-Hero Feature Strip / Quick-links Bar */}
        <div className="relative z-10 border-t border-[#a87d3b]/30 bg-[#0c0406]/90 backdrop-blur-md">
          <Container width="default">
            <div className="grid grid-cols-1 divide-y divide-[#a87d3b]/20 sm:grid-cols-3 sm:divide-y-0 sm:divide-x sm:divide-[#a87d3b]/20 py-4 sm:py-5">
              {/* Feature 1: Articles */}
              <Link
                to="/articles"
                className="group flex items-center gap-4 py-3 sm:py-2 px-3 sm:px-4 rounded-lg transition hover:bg-[#d4af37]/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#1c070a] text-[#d4af37] shadow-sm group-hover:border-[#d4af37] group-hover:scale-105 transition-all">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-[#fcf9f2] group-hover:text-[#d4af37] transition-colors">
                    In-Depth Articles
                  </h3>
                  <p className="text-xs text-[#a89688]">
                    Insights, techniques, and inspiration
                  </p>
                </div>
              </Link>

              {/* Feature 2: Tools */}
              <Link
                to="/tools"
                className="group flex items-center gap-4 py-3 sm:py-2 px-3 sm:px-4 rounded-lg transition hover:bg-[#d4af37]/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#1c070a] text-[#d4af37] shadow-sm group-hover:border-[#d4af37] group-hover:scale-105 transition-all">
                  <Wrench className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-[#fcf9f2] group-hover:text-[#d4af37] transition-colors">
                    Helpful Tools
                  </h3>
                  <p className="text-xs text-[#a89688]">
                    Practice aids, calculators, and more
                  </p>
                </div>
              </Link>

              {/* Feature 3: Resources */}
              <Link
                to="/resources"
                className="group flex items-center gap-4 py-3 sm:py-2 px-3 sm:px-4 rounded-lg transition hover:bg-[#d4af37]/5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#d4af37]/40 bg-[#1c070a] text-[#d4af37] shadow-sm group-hover:border-[#d4af37] group-hover:scale-105 transition-all">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-sm sm:text-base font-semibold text-[#fcf9f2] group-hover:text-[#d4af37] transition-colors">
                    Curated Resources
                  </h3>
                  <p className="text-xs text-[#a89688]">
                    Books, courses, and recommendations
                  </p>
                </div>
              </Link>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default LandingHero;
