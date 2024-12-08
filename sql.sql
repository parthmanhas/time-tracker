select * from public."Timer" where title like '%display%';

select * from public."Timer" order by "completedAt" desc;

alter table public."Timer" rename column due to due_at;
alter table public."Timer" rename column createdat to "createdAt";

select * from public."Timer" where title like '%ec2%';

select distinct(tag) from tags;

select * from public."Timer";

create table tags (
	id serial primary key,
	tag varchar(100), 
	timerId text,
	constraint fk_timer foreign key (timerId) references public."Timer"(id)
)

alter table tags alter column tag set not null;
alter table tags alter column id set not null;
alter table tags alter column timerId set not null;

alter table tags drop constraint fk_timer;

alter table tags add constraint fk_timer foreign key (timerId) references public."Timer"(id) on delete cascade; 

alter table tags add constraint unique_tag_timerId unique (tag, timerId);

alter table tags drop constraint unique_tag_timerId;

select * from tags;
INSERT INTO tags (timerId, tag) values ('e2da3712-2ce1-4de1-a444-bee89803d10a', 'test');
select * from public."Timer";
select
	t.id,
	t.status,
	t.title,
	t.duration,
	t."remainingTime",
	t."completedAt",
	t."createdAt",
	t.due_at,
	coalesce(array_agg(distinct tags.tag), '{}') as tags,
	coalesce(array_agg(distinct comments.comment), '{}') as comments
from public."Timer" t 	
left join tags on t.id = tags.timerId
left join comments on t.id = comments.timerId
group by t.id;

select coalesce (null, '{}');

create table comments (
	id serial primary key not null,
	comment text not null,
	timerId text not null,
	constraint fk_comments foreign key (timerId) references "Timer"(id)
);

select * from comments;

select * from public."Timer" where title like '%add time to timer functionality%';

alter table public."Timer" alter column "createdAt" set default current_timestamp;

select * from public."Timer" where title like '%test%';

select * from public."Timer" where id = '1274df86-a11a-42ad-a273-c845ca61e209';

SELECT column_name, is_nullable
FROM information_schema.columns
WHERE table_name = 'Timer';

	