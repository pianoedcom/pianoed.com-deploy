import React from "react";
import { Link } from "react-router-dom";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

interface PianoEdLogoProps {
  className?: string;
  variant?: "header" | "large" | "icon" | "footer";
  showTagline?: boolean;
  tagline?: string;
  linkToHome?: boolean;
}

export const PianoEdLogo: React.FC<PianoEdLogoProps> = ({
  className = "",
  variant = "header",
  showTagline = true,
  tagline = "Your Life in Music",
  linkToHome = true,
}) => {
  const isLarge = variant === "large";
  const isIcon = variant === "icon";

  const content = (
    <div className={cn("inline-flex items-center gap-3 select-none group", className)}>
      {/* Ornate Gold Crest Emblem */}
      <div
        className={cn(
          "relative flex items-center justify-center shrink-0 overflow-hidden rounded-full transition-transform group-hover:scale-105 duration-300",
          isLarge ? "h-16 w-16 sm:h-20 sm:w-20" : "h-12 w-12 sm:h-[50px] sm:w-[50px]",
          // Gold rim halo
          "shadow-[0_0_12px_rgba(212,175,55,0.3)] border border-[#d4af37]/45 bg-[#0d0405]"
        )}
      >
        <img
          src="/images/brand/pianoed-crest-logo.jpg"
          alt="PianoEd Crest"
          className="h-full w-full object-cover mix-blend-screen scale-110"
        />
      </div>

      {/* Typography: Wordmark + Tagline - Perfectly height-matched with the crest */}
      {!isIcon && (
        <div
          className={cn(
            "flex flex-col justify-center",
            isLarge
              ? "h-16 sm:h-20 gap-1.5"
              : "h-12 sm:h-[50px] justify-between py-1"
          )}
        >
          <span
            className={cn(
              "font-serif font-bold tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#fff2db] via-[#f7dfb0] to-[#c99d42] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]",
              isLarge ? "text-3xl sm:text-4xl" : "text-xl sm:text-[1.65rem]"
            )}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            {siteConfig.name}
          </span>
          {showTagline && (
            <span
              className={cn(
                "italic font-serif tracking-tight text-[#d4af37] leading-none opacity-95 whitespace-nowrap",
                isLarge ? "text-sm sm:text-base" : "text-[11px] sm:text-[11.5px]"
              )}
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link
        to="/"
        className="transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d4af37] rounded-sm inline-flex items-center"
        aria-label={`${siteConfig.name} Home`}
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default PianoEdLogo;
