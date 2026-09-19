import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import NotFound from "@/app/not-found";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import { getSheetMusicBySlug } from "@/lib/content/sheet-music-loader";
import SheetMusicDetailLayout from "@/components/sheet-music/SheetMusicDetailLayout";
import { useI18n } from "@/lib/i18n/context";

const SheetMusicDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { locale } = useI18n();

  const piece = useMemo(() => {
    return getSheetMusicBySlug(slug);
  }, [slug]);

  if (!piece) {
    return <NotFound />;
  }

  // Schema.org structured data for a classical music piece
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    name: piece.title,
    composer: {
      "@type": "Person",
      name: piece.composer,
    },
    musicalKey: piece.keySignature,
    timeSignature: piece.timeSignature,
    genre: piece.genre,
    description: piece.description,
    educationalLevel: piece.difficulty,
    inLanguage: "en",
    publisher: {
      "@type": "Organization",
      name: "PianoEd",
      url: "https://www.pianoed.com",
    },
  };

  return (
    <>
      <Seo
        title={`${piece.title} (${piece.composer}) — Sheet Music & Study Guide`}
        description={
          piece.description ||
          `Study notes, practice routine, keyboard diagrams, and PDF sheet music for ${piece.title} by ${piece.composer}.`
        }
        path={`/resources/sheet-music-library/${piece.slug}`}
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      <SheetMusicDetailLayout piece={piece}>
        <MdxRenderer body={piece.body} slug={piece.slug} />
      </SheetMusicDetailLayout>
    </>
  );
};

export default SheetMusicDetailPage;
