-- Rebrand: Digitora Next -> Capitalink Technologies (display name) and digitoranext -> capitalink (placeholder email domain).

create or replace function pg_temp.rebrand(t text) returns text language sql immutable as $$
  select replace(replace(t, 'Digitora Next', 'Capitalink Technologies'), 'digitoranext', 'capitalink');
$$;

update public.site_settings
set value = pg_temp.rebrand(value::text)::jsonb
where value::text ilike '%digitora%';

update public.pages
set title = pg_temp.rebrand(title),
    body = pg_temp.rebrand(body),
    seo_title = pg_temp.rebrand(seo_title),
    seo_description = pg_temp.rebrand(seo_description)
where concat_ws(' ', title, body, seo_title, seo_description) ilike '%digitora%';

update public.blog_posts
set author_name = pg_temp.rebrand(author_name),
    body = pg_temp.rebrand(body),
    title = pg_temp.rebrand(title),
    excerpt = pg_temp.rebrand(excerpt)
where concat_ws(' ', author_name, body, title, excerpt) ilike '%digitora%';

update public.faqs
set question = pg_temp.rebrand(question),
    answer = pg_temp.rebrand(answer)
where concat_ws(' ', question, answer) ilike '%digitora%';

update public.services
set body = pg_temp.rebrand(body),
    short_description = pg_temp.rebrand(short_description)
where concat_ws(' ', body, short_description) ilike '%digitora%';

update public.solutions
set body = pg_temp.rebrand(body),
    summary = pg_temp.rebrand(summary),
    headline = pg_temp.rebrand(headline)
where concat_ws(' ', body, summary, headline) ilike '%digitora%';
