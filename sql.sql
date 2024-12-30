SELECT
	*
FROM
	"public"."Timer"
WHERE
	ID = '03750621-9617-4a6b-a719-b538444f4b1e';

SELECT
	*
FROM
	"public"."Timer";

SELECT
	*
FROM
	TAGS;

SELECT
	*
FROM
	TAGS
WHERE
	TAG = 'test';

-- 03750621-9617-4a6b-a719-b538444f4b1e
DELETE FROM TAGS
WHERE
	TAG = 'timer1';

-- timers which do not have tags
SELECT
	*
FROM
	"public"."Timer"
WHERE
	TITLE LIKE '%adding%';

SELECT
	*
FROM
	"public"."Timer" T
	LEFT JOIN TAGS TG ON T.ID = TG.TIMERID;

SELECT
	*
FROM
	TAGS;

SELECT
	*
FROM
	COMMENTS;

INSERT INTO
	TAGS (TAG)
VALUES
	('test');

SELECT
	TABLE_SCHEMA,
	TABLE_NAME
FROM
	INFORMATION_SCHEMA.TABLES;

ALTER TABLE PUBLIC."Timer"
RENAME TO TIMER;

SELECT
	T.ID,
	T.STATUS,
	T.TITLE,
	T.DURATION,
	T."remainingTime",
	T."completedAt",
	T."createdAt",
	T.DUE_AT,
	COALESCE(ARRAY_AGG(DISTINCT TAGS.TAG), '{}') AS TAGS,
	COALESCE(ARRAY_AGG(DISTINCT COMMENTS.COMMENT), '{}') AS COMMENTS
FROM
	TIMER T
	LEFT JOIN TAGS ON T.ID = TAGS.TIMERID
	LEFT JOIN COMMENTS ON T.ID = COMMENTS.TIMERID
GROUP BY
	T.ID;

alter table timer rename column "remainingTime" to remaining_time;
alter table timer rename column "completedAt" to completed_at;
alter table timer rename column "createdAt" to created_at;

select * from timer;

create table users (
	id text primary key,
	email varchar(100) unique not null,
	name varchar(100) not null,
	password text not null,
	reset_token text,
	reset_token_expiry TIMESTAMP,
	created_at TIMESTAMP default current_timestamp,
	updated_at TIMESTAMP
);

alter table timer add column user_id text;
alter table timer alter column user_id set not null;
alter table timer alter column user_id drop not null;
alter table users rename to "user";

select * from "user";

select * from timer;

update timer set user_id = '1774790c-8150-4b93-af5a-1ef1be9ec63b';
update tags set user_id = '1774790c-8150-4b93-af5a-1ef1be9ec63b';
update comments set user_id = '1774790c-8150-4b93-af5a-1ef1be9ec63b';

select * from tags;
select * from comments;

alter table tags add column user_id text;
alter table comments add column user_id text;

alter table tags alter column user_id set not null;
alter table comments alter column user_id set not null;


alter table timer add constraint fk_user foreign key (user_id) references "user"(id);

alter table tags add constraint fk_user foreign key (user_id) references "user"(id);
alter table comments add constraint fk_user foreign key (user_id) references "user"(id);

create table journal (
	id serial primary key,
	content text not null,
	user_id text not null,
	created_at timestamp default current_timestamp,
	constraint fk_users foreign key (user_id) references "user"(id)
);

create type "GoalPriority" as enum ('HIGH', 'MEDIUM', 'LOW');

create table goal (
	id serial primary key,
	title varchar(100) not null,
	description text,
	target_hours float not null,
	priority "GoalPriority",
	user_id text not null,
	created_at timestamp default current_timestamp,
	is_active boolean default true,
	constraint fk_users foreign key (user_id) references "user"(id)
);
alter table goal add column priority "GoalPriority";
alter table goal alter column priority set default 'MEDIUM';
alter table goal drop column priority;
select * from goal where completed_at is null;
alter table goal add column completed_at timestamp;
select * from tags;
alter table tags add column goal_id int;

describe table tags;
select * from timer;

create type "GoalType" as enum ('TIME', 'COUNT');
alter table goal alter column target_hours drop not null;
alter table goal add column target_count int;
alter table goal add column current_count int;
alter table goal add column type "GoalType";
select * from goal;

select * from "user";

alter table "user" add column paid boolean default false;


create table routine (
	id serial primary key,
	user_id text not null,
	title text unique not null,
	description text,
	type "GoalType" not null,
	daily_target int not null,
	streak int not null,
	created_at TIMESTAMP default current_timestamp,
	last_completed_at timestamp,
	constraint fk_users foreign key (user_id) references "user"(id)
);

create table routine_progress (
	id serial primary key,
	user_id text not null,
	routine_id int not null,
	completed_at timestamp default current_timestamp,
	constraint fk_routine foreign key (routine_id) references routine(id),
	constraint fk_user foreign key (user_id) references "user"(id)
);

alter table routine_progress add column user_id text not null;
alter table routine_progress add constraint fk_user foreign key (user_id) references "user"(id);

select * from routine;
select * from routine_progress;