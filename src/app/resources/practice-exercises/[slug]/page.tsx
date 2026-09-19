import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/layout/Seo";
import NotFound from "@/app/not-found";
import MdxRenderer from "@/components/mdx/MdxRenderer";
import { getExerciseBySlug } from "@/lib/content/exercises-loader";
import ExerciseLayout from "@/components/exercises/ExerciseLayout";
import { useI18n } from "@/lib/i18n/context";

const PracticeExerciseDetailPage: React.FC = () => {
  const { slug = "" } = useParams<{ slug: string }>();
  const { locale } = useI18n();

  const exercise = useMemo(() => {
    return getExerciseBySlug(slug);
  }, [slug]);

  if (!exercise) {
    return <NotFound />;
  }

  // Schema.org structured data for an educational music exercise
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: exercise.title,
    description: exercise.description,
    educationalLevel: exercise.difficulty,
    learningResourceType: "Practice Exercise",
    competencyRequired: `${exercise.difficulty} piano technique`,
    about: {
      "@type": "Thing",
      name: `Piano ${exercise.category}`,
    },
    provider: {
      "@type": "Organization",
      name: "PianoEd",
      url: "https://www.pianoed.com",
    },
  };

  return (
    <>
      <Seo
        title={`${exercise.title} — Piano Practice Exercise`}
        description={exercise.description}
        path={`/resources/practice-exercises/${exercise.slug}`}
        locale={locale}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaData),
        }}
      />

      <ExerciseLayout exercise={exercise}>
        <MdxRenderer body={exercise.body} slug={exercise.slug} />
      </ExerciseLayout>
    </>
  );
};

export default PracticeExerciseDetailPage;
