import React from "react";
import { Download, ExternalLink, FileText, CheckCircle2, ShieldCheck } from "lucide-react";

interface SheetMusicExternalLinksProps {
  pdfUrl?: string;
  imslpUrl?: string;
  title: string;
  composer: string;
  className?: string;
}

export const SheetMusicExternalLinks: React.FC<SheetMusicExternalLinksProps> = ({
  pdfUrl,
  imslpUrl,
  title,
  composer,
  className = "",
}) => {
  return (
    <div className={`rounded-xl border border-border bg-card p-5 shadow-sm space-y-4 ${className}`}>
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <FileText className="h-5 w-5 text-accent" />
        <h3 className="font-serif text-base font-semibold text-foreground">
          Sheet Music Score
        </h3>
      </div>

      {pdfUrl ? (
        <div className="space-y-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Download className="h-4 w-4" />
            Download Clean PDF Score
          </a>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Public Domain Edition • Ready to Print (Letter / A4)</span>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-muted/40 border border-border/60 p-3.5 text-xs text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
            <span>PDF Score Being Prepared</span>
          </div>
          <p>
            A high-resolution, finger-annotated edition of this piece is currently being prepared for our R2 library.
          </p>
        </div>
      )}

      {imslpUrl && (
        <div className="border-t border-border/60 pt-3">
          <a
            href={imslpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-accent transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Historical Editions on IMSLP Petrucci Library
          </a>
        </div>
      )}
    </div>
  );
};

export default SheetMusicExternalLinks;
