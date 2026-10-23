-- Remove the "starting template" legal disclaimer shown at the top of the Privacy Policy and Terms of Use.

update public.pages
set body = regexp_replace(body, '^\s*\*This is a starting template\.[^*]*\*\s*', '')
where body ~ '\*This is a starting template\.';
