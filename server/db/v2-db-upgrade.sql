-- #27 https://github.com/briangormanly/agora/issues/27 make goal completable when no additional topics will be added (in production https://github.com/briangormanly/agora/pull/29)
ALTER TABLE goals ADD COLUMN completable BOOLEAN DEFAULT true;

-- in production https://github.com/briangormanly/agora/pull/46
-- #30 https://github.com/briangormanly/agora/issues/30 add pre assessment threshold and post (#31)
ALTER TABLE assessments ADD COLUMN pre_threshold INTEGER DEFAULT 90;
ALTER TABLE assessments ADD COLUMN post_threshold INTEGER DEFAULT 70;

-- #41 https://github.com/briangormanly/agora/issues/41
ALTER TABLE completed_assessment RENAME COLUMN pre_post TO topic_assessment_number;
ALTER TABLE completed_assessment ADD COLUMN percentage_correct DECIMAL(4,3);            -- existing rows will need to be computed as they are already saved (maybe leave null then have code respond to null and show message?)
ALTER TABLE completed_assessment ADD COLUMN completion_time TIMESTAMP;                  -- existing rows should be set to match create_time (or leave null, see above)

-- #45 https://github.com/briangormanly/agora/issues/45
ALTER TABLE topics ADD COLUMN has_activity BOOLEAN DEFAULT true;
-- end production https://github.com/briangormanly/agora/pull/46

-- #38 https://github.com/briangormanly/agora/issues/38
ALTER TABLE goals DROP CONSTRAINT goals_pkey;
ALTER TABLE goals ADD COLUMN rid SERIAL PRIMARY KEY;

ALTER TABLE goal_path RENAME COLUMN goal_id TO goal_rid;
ALTER TABLE goal_path DROP COLUMN goal_version;
DROP INDEX IF EXISTS idx_goal_path_goal_id;
DROP INDEX IF EXISTS idx_goal_path_goal_version;
CREATE INDEX IF NOT EXISTS idx_goal_path_goal_rid ON goal_path (goal_rid);

ALTER TABLE user_goal RENAME COLUMN goal_id TO goal_rid;
ALTER TABLE user_goal DROP COLUMN goal_version;
DROP INDEX IF EXISTS idx_user_goal_goal_id;
DROP INDEX IF EXISTS idx_user_goal_goal_version;
CREATE INDEX IF NOT EXISTS idx_user_goal_goal_rid ON user_goal (goal_rid);

-- #48 https://github.com/briangormanly/agora/issues/48 
-- I don't see any difference in the database between the tables created with just SERIAL and the ones with SERIAL PRIMARY KEY, I just made the change for the create scripts.

