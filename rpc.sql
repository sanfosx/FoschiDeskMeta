create or replace function match_knowledge(
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_tenant uuid
) returns table (id uuid, problem text, solution text, similarity float)
language plpgsql as $$
begin
  return query
  select k.id, k.problem, k.solution, 1 - (k.embedding <=> query_embedding) as similarity
  from knowledge_items k
  where (k.tenant_id = filter_tenant or k.tenant_id is null)
    and 1 - (k.embedding <=> query_embedding) > match_threshold
  order by k.embedding <=> query_embedding
  limit match_count;
end;
$$;
