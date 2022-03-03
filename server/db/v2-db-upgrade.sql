-- #27 https://github.com/briangormanly/agora/issues/27 make goal completable when no additional topics will be added
ALTER TABLE goals ADD COLUMN completable BOOLEAN DEFAULT true;

