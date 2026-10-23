-- Remove the italic "Edit this ... in Admin ..." setup notes that were left visible in published content.

update public.solutions
set body = regexp_replace(body, '\s*\*Edit this [^*]*in Admin[^*]*\*', '', 'g')
where body ~ '\*Edit this [^*]*in Admin';

update public.pages
set body = regexp_replace(body, '\s*\*Edit this [^*]*in Admin[^*]*\*', '', 'g')
where body ~ '\*Edit this [^*]*in Admin';
