-- #27 https://github.com/briangormanly/agora/issues/27 make goal completable when no additional topics will be added (in production https://github.com/briangormanly/agora/pull/29)
ALTER TABLE goals ADD COLUMN completable BOOLEAN DEFAULT true;

-- #30 https://github.com/briangormanly/agora/issues/30 add pre assessment threshold and post (#31)
ALTER TABLE assessments ADD COLUMN pre_threshold INTEGER DEFAULT 90;
ALTER TABLE assessments ADD COLUMN post_threshold INTEGER DEFAULT 70;
