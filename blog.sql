--My "CREATE" sql statement dissapears. Don't know how to retrive it.
--This is today's sql statements I did.
SELECT * FROM public.articles
ORDER BY id ASC 

SELECT * FROM public.categories
ORDER BY id ASC 

SELECT * FROM public.articles
ORDER BY id ASC 

ALTER TABLE articles
ADD category_id INT REFERENCES categories(id);