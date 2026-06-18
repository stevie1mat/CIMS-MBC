-- Drop old mapping table
DROP TABLE IF EXISTS "public"."quiz_questions";

-- Drop constraints that might exist
ALTER TABLE "public"."questions" DROP CONSTRAINT IF EXISTS questions_category_id_fkey;
ALTER TABLE "public"."questions" DROP CONSTRAINT IF EXISTS questions_level_id_fkey;

-- Modify questions table
ALTER TABLE "public"."questions" 
  DROP COLUMN IF EXISTS "category_id",
  DROP COLUMN IF EXISTS "level_id",
  DROP COLUMN IF EXISTS "body",
  ADD COLUMN IF NOT EXISTS "quiz_id" BIGINT REFERENCES "public"."quizzes"("id") ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS "question_text" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "description" TEXT;

-- We don't need categories and levels anymore for this new flow
-- But we can leave the tables or drop them. Let's drop them to clean up.
DROP TABLE IF EXISTS "public"."question_levels";
DROP TABLE IF EXISTS "public"."question_categories";

-- Ensure options refer to questions cleanly
-- Option text might need to hold more data now, but TEXT is fine.
