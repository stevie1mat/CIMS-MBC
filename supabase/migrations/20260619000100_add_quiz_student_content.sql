alter table public.quizzes
  add column if not exists student_subject text,
  add column if not exists student_teacher text,
  add column if not exists exam_instructions_title text,
  add column if not exists exam_time_text text,
  add column if not exists exam_questions_text text,
  add column if not exists exam_result_text text;
