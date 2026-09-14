-- Applied as remote migration jonah_regroup_verse_5.
-- Keep original audio objects in Storage; only superseded metadata is removed.
create or replace function public.jonah_regroup_verse_5(p_start integer, p_end integer, p_color integer)
returns setof public.jonah_haftorah_1_1_10_highlight_groups_v1
language plpgsql security invoker set search_path = ''
as $$
begin
  if p_start is null or p_end is null or p_color is null
     or p_start < 0 or p_end < p_start or p_end >= 18 or p_color not in (1, 2) then
    raise exception 'Invalid verse 5 word selection';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(510106, 5);
  if exists (select 1 from public.jonah_haftorah_1_1_10_highlight_groups_v1
             where verse = 5 and start_word = p_start and end_word = p_end) then
    return query select * from public.jonah_haftorah_1_1_10_highlight_groups_v1
                 where verse = 5 and start_word = p_start and end_word = p_end;
    return;
  end if;
  delete from public.jonah_haftorah_1_1_10_highlight_groups_v1
    where verse = 5 and start_word <= p_end and end_word >= p_start;
  return query insert into public.jonah_haftorah_1_1_10_highlight_groups_v1
    (verse, start_word, end_word, color) values (5, p_start, p_end, p_color) returning *;
end;
$$;
revoke all on function public.jonah_regroup_verse_5(integer, integer, integer) from public;
grant execute on function public.jonah_regroup_verse_5(integer, integer, integer) to anon, authenticated;
