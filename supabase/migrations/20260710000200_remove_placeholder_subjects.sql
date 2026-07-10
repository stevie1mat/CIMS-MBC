do $$
declare
  placeholder_ids bigint[];
begin
  select array_agg(id)
  into placeholder_ids
  from public.categories
  where name in ('General knowledge', 'Math');

  if placeholder_ids is null then
    return;
  end if;

  update public.assignments
  set category_id = null
  where category_id = any(placeholder_ids);

  update public.questions
  set category_id = null
  where category_id = any(placeholder_ids);

  update public.quiz_selection_rules
  set category_id = null
  where category_id = any(placeholder_ids);

  update public.study_materials
  set category_id = null
  where category_id = any(placeholder_ids);

  delete from public.subject_teachers
  where category_id = any(placeholder_ids);

  delete from public.categories
  where id = any(placeholder_ids);
end $$;