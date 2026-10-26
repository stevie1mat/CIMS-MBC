-- Teachers may read exams/results only for their assigned subjects.
-- SECURITY DEFINER avoids policy recursion when checking a quiz's subject.
create or replace function public.teacher_can_view_exam(exam_id bigint)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.quizzes q
    join public.categories c on lower(btrim(c.name)) = lower(btrim(q.student_subject))
    join public.subject_teachers st on st.category_id = c.id
    where q.id = exam_id and st.teacher_id = auth.uid()
  );
$$;

-- Restrictive policies also constrain any existing permissive staff policies.
do $$
declare
  relation_name text;
begin
  foreach relation_name in array array['quizzes', 'questions', 'question_options', 'quiz_groups', 'quiz_users', 'quiz_selection_rules'] loop
    execute format('create policy "Only admins insert exam data" on public.%I as restrictive for insert to authenticated with check (public.is_admin())', relation_name);
    execute format('create policy "Only admins update exam data" on public.%I as restrictive for update to authenticated using (public.is_admin()) with check (public.is_admin())', relation_name);
    execute format('create policy "Only admins delete exam data" on public.%I as restrictive for delete to authenticated using (public.is_admin())', relation_name);
  end loop;
  foreach relation_name in array array['quiz_attempts', 'attempt_answers'] loop
    execute format('create policy "Teachers cannot insert results" on public.%I as restrictive for insert to authenticated with check (public.current_account_role() <> ''teacher'')', relation_name);
    execute format('create policy "Teachers cannot update results" on public.%I as restrictive for update to authenticated using (public.current_account_role() <> ''teacher'') with check (public.current_account_role() <> ''teacher'')', relation_name);
    execute format('create policy "Teachers cannot delete results" on public.%I as restrictive for delete to authenticated using (public.current_account_role() <> ''teacher'')', relation_name);
  end loop;
end;
$$;

create policy "Teachers read assigned exams" on public.quizzes as restrictive for select to authenticated
using (public.current_account_role() <> 'teacher' or public.teacher_can_view_exam(id));
create policy "Teachers read assigned exam attempts" on public.quiz_attempts as restrictive for select to authenticated
using (public.current_account_role() <> 'teacher' or public.teacher_can_view_exam(quiz_id));
create policy "Teachers read assigned exam answers" on public.attempt_answers as restrictive for select to authenticated
using (public.current_account_role() <> 'teacher' or exists (
  select 1 from public.quiz_attempts qa where qa.id = attempt_id and public.teacher_can_view_exam(qa.quiz_id)
));
create policy "Teachers read assigned exam questions" on public.questions as restrictive for select to authenticated
using (public.current_account_role() <> 'teacher' or public.teacher_can_view_exam(quiz_id));
create policy "Teachers read assigned exam options" on public.question_options as restrictive for select to authenticated
using (public.current_account_role() <> 'teacher' or exists (
  select 1 from public.questions q where q.id = question_id and public.teacher_can_view_exam(q.quiz_id)
));
