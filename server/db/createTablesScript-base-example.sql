-- Agora base database setup

-- setup (as root / postgres)
create database agora;
create user agora with encrypted password 'agora';
grant all privileges on database agora to agora;
grant connect on database agora to agora;
\c agora agora

-- create and inserts

CREATE TABLE IF NOT EXISTS cc_sponsors (
    id SERIAL PRIMARY KEY,
    gh_action VARCHAR,
    gh_sponsorship_id VARCHAR,
    gh_sponsorship_created_at VARCHAR,
    gh_user_login VARCHAR,
    gh_user_id integer,
    gh_user_url VARCHAR,
    gh_user_type VARCHAR,
    gh_privacy_level VARCHAR,
    gh_tier_node_id VARCHAR,
    gh_tier_created_at VARCHAR,
    gh_tier_monthly_price_in_cents integer,
    gh_tier_monthly_price_in_dollars integer,
    gh_tier_name VARCHAR,
    gh_tier_is_one_time boolean,
    gh_tier_is_custom_amount boolean,
    gh_repo_id integer,
    gh_repo_name VARCHAR,
    gh_repo_permissions VARCHAR,
    gh_repo_created_at VARCHAR,
    gh_repo_fork boolean
);

GRANT ALL PRIVILEGES ON TABLE cc_sponsors TO agora;
GRANT USAGE, SELECT ON SEQUENCE cc_sponsors_id_seq TO agora;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR,
    username VARCHAR,
    profile_filename VARCHAR,
    email_token VARCHAR,
    email_validated BOOLEAN,
    first_name VARCHAR,
    last_name VARCHAR,
    hashed_password VARCHAR,
    password_token VARCHAR,
    password_token_expiration BIGINT,
    role_id INTEGER DEFAULT 0,
    subscription_active BOOLEAN,
    beginning_programming BOOLEAN,
    intermediate_programming BOOLEAN,
    advanced_programming BOOLEAN,
    mobile_development BOOLEAN,
    robotics_programming BOOLEAN,
    web_applications BOOLEAN,
    web3 BOOLEAN,
    iot_programming BOOLEAN,
    database_design BOOLEAN,
    relational_database BOOLEAN,
    nosql_database BOOLEAN,
    object_relational_mapping BOOLEAN,
    stripe_id VARCHAR,
    available_access_tokens INTEGER,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE users TO agora;
GRANT USAGE, SELECT ON SEQUENCE users_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_users_username ON users (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));

CREATE TABLE IF NOT EXISTS session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

GRANT ALL PRIVILEGES ON TABLE session TO agora;
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON session ("expire");

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_type VARCHAR,
    product_name VARCHAR,
    product_description_1 VARCHAR,
    product_description_2 VARCHAR,
    product_purchase_text VARCHAR,
    stripe_product_id VARCHAR,
    stripe_price_id VARCHAR,
    price MONEY,
    product_url VARCHAR,
    product_static_image VARCHAR,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE products TO agora;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO agora;


CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    image_name VARCHAR,
    image_description_1 VARCHAR,
    image_description_2 VARCHAR,
    image_url VARCHAR, 
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);


GRANT ALL PRIVILEGES ON TABLE product_images TO agora;
GRANT USAGE, SELECT ON SEQUENCE product_images_id_seq TO agora;
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);


INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Some physical product', 
    'product',
    '<p>This product is really cool, you should buy it :)</p>', 
    '<p>It contains the following:</p>
                            <ul>
                                <li>Thing one that it includes</li>
                                <li>Micro Servo <- woah!</li>
                                <li>Another thing</li>
                                <li>Easy to follow instructions (meh)</li>
                            </ul>
                            <p>This will contain additional useful information! (or not)</p>
                            <p>This is also fun, fun with words, fun with HTML in databases, fun, fun fun.  I am having fun! I really mean it.  Do you believe me?</p>
                            <p><strong>Buy me!</strong></p>
                            <p>If you have any questions please email:
                                <a href="mailto:some@email.com">some@email.com</a>.
                            </p>',
    'Purchase this! [includes USPS First class shipping to nowhere]',
    'prod_XXXXXX', 'price_XXXXX', '49.99', '/api/stripe/cb1-checkout-session', '/assets/img/codebot/code-bot-parts.jpg', true
);

INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Founders Membership',
    'membership', 
    '<p></p>', 
    '<p>The Founders Membership is a limited time early adopter membership opportunity! Founders will always be offered first access to new features and their input will help direct the project. Thank you for helping bring the vision of Agora to reality!</p>',
    'Become a founding member!',
    'prod_xxxxxx', 'price_xxxxxx', '14.99', '/api/stripe/founders-checkout-session', '/assets/img/logos/agora-logo-a-bwn-1600.png', true
);

INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Topic Access Token',
    'topic_access', 
    '<p>Tokens can be purchased to allow access a to additional topics. Each token allows full access to the material in one topic.</p>', 
    '',
    'Purchase a Topic Access Token',
    'prod_xxxxxx', 'price_xxxxxx', '9.99', '/api/stripe/access-token-checkout-session', '/assets/img/robots-bg/balboa.png', true
);

INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', '<p class="mb-5 text-left">
                                        Assembled Code Bot 3π+ kit ready for installation on Pololu 3π+ robot shown in background(not included). The Code Bot 3π+ kit custom chassis design allows all hardware to be securely mounted to the robot and allows wires to be routed so that they do not get snagged or tangled. The innovative chassis design clips to the 3π+ robot without fasteners or glue but will stay in place even if the robot is completely upside down! 
                                    </p>
                                    <p>
                                        <strong>Note: </strong>The robot is not incuded in this kit and must be <a href="https://www.pololu.com/category/280/3pi-plus-32u4-oled-robot">purchased separately.</a>.
                                    </p>', 
    '', '/assets/img/robots-bg/henry-ix.png'
);

INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', '<p class="mb-5 text-left">
                                        All assembled components of the Code Bot 3π+ kit are shown here including the rear counterweight. The in-house designed components of the Code Bot 3π+ kit (Chassis, low profile ultrasonic mount, counterweight) are all constructed from thermoplastic polymer made strictly from renewable resources.  These pieces have been painstakingly engineered to fit perfectly to the robot and ensure durability while remaining light-weight. Assembly instructions are well documented and clear, assembly takes about 15 minutes!
                                    </p>', 
    '', '/assets/img/robots-bg/custom-2-wheel.png'
);


CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    product_id INTEGER,
    quantity INTEGER,
    user_id INTEGER,
    stripe_session_data jsonb,
    stripe_customer_data jsonb,
    mail_address_1 VARCHAR,
    mail_address_2 VARCHAR,
    mail_city VARCHAR,
    mail_state VARCHAR,
    mail_zip VARCHAR,
    mail_country VARCHAR,
    order_status VARCHAR,
    payment_intent VARCHAR,
    mode VARCHAR,
    stripe_email VARCHAR,
    create_time TIMESTAMP DEFAULT current_timestamp,
    amount INTEGER,
    sub_total INTEGER, 
    automatic_tax jsonb, 
    tax INTEGER
);

GRANT ALL PRIVILEGES ON TABLE orders TO agora;
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders (product_id);
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO agora;


CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    create_time TIMESTAMP DEFAULT current_timestamp,
    ip_address VARCHAR,
    client_type VARCHAR,
    client_name VARCHAR,
    client_version VARCHAR,
    client_engine VARCHAR,
    client_engine_version VARCHAR,
    os_name VARCHAR,
    os_version VARCHAR,
    os_platform VARCHAR,
    device_type VARCHAR,
    device_brand VARCHAR,
    device_model VARCHAR,
    bot VARCHAR

);

GRANT ALL PRIVILEGES ON TABLE user_sessions TO agora;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO agora;


CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR,
    role_description VARCHAR,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE roles TO agora;
GRANT USAGE, SELECT ON SEQUENCE roles_id_seq TO agora;

insert into roles (role_name, role_description, active) values ('Administrator', 'Administrator', true);
insert into roles (role_name, role_description, active) values ('User', 'General authenticated access', true);
insert into roles (role_name, role_description, active) values ('Founder', 'Founder membership', true);
insert into roles (role_name, role_description, active) values ('Creator', 'Content Creator', true);



CREATE TABLE IF NOT EXISTS user_role (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    role_id INTEGER,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    end_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE user_role TO agora;
GRANT USAGE, SELECT ON SEQUENCE user_role_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_user_role_user_id ON user_role (user_id);
CREATE INDEX IF NOT EXISTS idx_user_role_role_id ON user_role (role_id);

-- insert into user_role_goal (user_id, role_id, active) values (1, 1, true);
-- creator waiting for the first user
insert into user_role (user_id, role_id, active, end_time) values (1, 1, true, 'infinity');
insert into user_role (user_id, role_id, active, end_time) values (1, 4, true, 'infinity');



-- goals and related <- goalService
CREATE TABLE IF NOT EXISTS goals (
    rid SERIAL PRIMARY KEY,
    id INTEGER,
    goal_version INTEGER,       -- every time a goal or its path of topics is changed this is incremented but the id stays the same, the key is a composite key of id and version.
    goal_name VARCHAR,
    goal_description VARCHAR,
    goal_image VARCHAR,
    active BOOLEAN,
    completable BOOLEAN,
    visibility INTEGER,     -- Enumeration -> 0 = Private / none, 1 = Shared with groups or individuals, 2 = Public
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE goals TO agora;
CREATE INDEX IF NOT EXISTS idx_goals_visibility ON goals (visibility);


CREATE TABLE IF NOT EXISTS topics ( -- <- pathService or separate topicService?
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR,
    topic_description VARCHAR,
    topic_image VARCHAR,
    topic_html VARCHAR,
    assessment_id INTEGER, -- id of assessment given both at the begining (pre) and end (post) of a topic for each user.  This is always the same assessment.
    has_activity BOOLEAN DEFAULT false,
    has_assessment BOOLEAN DEFAULT false,
    activity_id INTEGER,  -- id of lab or activity associated with topic, all topics should have one
    active BOOLEAN,
    visibility INTEGER,     -- Enumeration -> 0 = Private / none, 1 = Shared with groups or individuals, 2 = Public
    topic_type INTEGER,     -- Enumeration -> 0 = Research, 1 = Educational
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE topics TO agora;
CREATE INDEX IF NOT EXISTS idx_topics_visibility ON topics (visibility);


CREATE TABLE IF NOT EXISTS goal_path (
    id SERIAL PRIMARY KEY,
    goal_rid INTEGER,
    topic_id INTEGER,
    position INTEGER,
    is_required BOOLEAN,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON TABLE goal_path TO agora;
GRANT USAGE, SELECT ON SEQUENCE goal_path_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_goal_path_goal_rid ON goal_path (goal_rid);



-- used to track a users interest in completing a goal (and at a specific goal version so the correct path can be identified)
-- also tracks actually completion of a goal.
CREATE TABLE IF NOT EXISTS user_goal (
    id SERIAL PRIMARY KEY,
    goal_rid INTEGER,
    user_id INTEGER,
    is_completed BOOLEAN,
    completed_date TIMESTAMP,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON TABLE user_goal TO agora;
GRANT USAGE, SELECT ON SEQUENCE user_goal_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_user_goal_goal_rid ON user_goal (goal_rid);
CREATE INDEX IF NOT EXISTS idx_user_goal_user_id ON user_goal (user_id);


-- Effectively an enrollment 
-- These records can be recified with the defined path for a topic to 
-- track a users progess twoards a goal.
-- querying in this matter can progmattically determine completion, but it
-- would not actually be recorded anywhere in the db. Further if the path 
-- changed 
CREATE TABLE IF NOT EXISTS user_topic (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER,
    user_id INTEGER,
    is_intro_complete BOOLEAN,
    pre_completed_assessment_id INTEGER,
    post_completed_assessment_id INTEGER,
    completed_activity_id INTEGER,
    is_completed BOOLEAN,
    completed_date TIMESTAMP,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    update_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE user_topic TO agora;
GRANT USAGE, SELECT ON SEQUENCE user_topic_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_user_topic_topic_id ON user_topic (topic_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_user_id ON user_topic (user_id);


CREATE TABLE IF NOT EXISTS resources (
    id SERIAL PRIMARY KEY,
    resource_type INTEGER, -- ?? 1-html, 2-link, 3.. etc
    resource_name VARCHAR,
    resource_description VARCHAR,
    resource_content_html VARCHAR,
    resource_image VARCHAR,
    resource_link VARCHAR,
    is_required BOOLEAN,
    active BOOLEAN,
    visibility INTEGER,     -- Enumeration -> 0 = Private / none, 1 = Shared with groups or individuals, 2 = Public
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE resources TO agora; 
CREATE INDEX IF NOT EXISTS idx_resources_visibility ON resources (visibility);
CREATE INDEX IF NOT EXISTS idx_resounces_owned_by ON resources (owned_by);

CREATE TABLE IF NOT EXISTS tags (
    id SERIAL PRIMARY KEY,
    tag VARCHAR UNIQUE,
    last_used TIMESTAMP,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE tags TO agora;
GRANT USAGE, SELECT ON SEQUENCE tags_id_seq TO agora;
CREATE INDEX IF NOT EXISTS idx_tags_tag ON tags (tag);
CREATE INDEX IF NOT EXISTS 

CREATE TABLE IF NOT EXISTS tag_association (
    id SERIAL PRIMARY KEY,
    entity_type INTEGER, --  1-goal, 2-topic, 3-resource, 
    entity_id INTEGER, -- fk to entity id for entity_type
    user_id INTEGER, -- fk of user that set tag
    use_count INTEGER, -- incremented when user finds entity via tag lookup
    last_used TIMESTAMP,
    active BOOLEAN,
    visibility INTEGER,     -- Enumeration -> 0 = Private / none, 1 = Shared with groups or individuals, 2 = Public
    create_time TIMESTAMP DEFAULT current_timestamp
);



-- make resources many to many with topics instead of many to one
CREATE TABLE IF NOT EXISTS topic_resource (
    id SERIAL PRIMARY KEY,
    topic_id INTEGER,
    resource_id INTEGER,
    position INTEGER,
    is_required BOOLEAN,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by integer
);
GRANT ALL PRIVILEGES ON TABLE topic_resource TO agora;
GRANT USAGE, SELECT ON SEQUENCE topic_resource_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_topic_resource_topic_id ON topic_resource (topic_id);
CREATE INDEX IF NOT EXISTS idx_topic_resource_resource_id ON topic_resource (resource_id);
CREATE INDEX IF NOT EXISTS idx_topic_resource_owned_by ON topic_resource (owned_by);


-- maintains a record of resources reviewed by the user within a topic
-- when combined with user_topic (pre_completed_assessment_id, post_completed_assessment_id and completed_activity_id) denotes completed topic
CREATE TABLE IF NOT EXISTS completed_resource (
    id SERIAL PRIMARY KEY,
    resource_id INTEGER,
    user_id INTEGER,
    submission_text VARCHAR, -- is the user going to actually submit something here ever?
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    update_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE completed_resource TO agora;
GRANT USAGE, SELECT ON SEQUENCE completed_resource_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_completed_resource_resource_id ON completed_resource (resource_id);
CREATE INDEX IF NOT EXISTS idx_completed_resource_user_id ON completed_resource (user_id);


CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    assessment_type INTEGER,   -- ?? 1-pre/post eval, 2.. quiz?, etc not sure if this is needed depends on how tests are done outside of pre/post assessments
    assessment_name VARCHAR,  
    assessment_description VARCHAR,
    pre_threshold INTEGER,
    post_threshold INTEGER,
    is_required BOOLEAN,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE assessments TO agora;




CREATE TABLE IF NOT EXISTS assessment_question (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER,   
    question VARCHAR,  
    is_required BOOLEAN,
    correct_option_id INTEGER,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE assessment_question TO agora;
CREATE INDEX IF NOT EXISTS idx_assessment_question_assessment_id ON assessment_question (assessment_id);


CREATE TABLE IF NOT EXISTS assessment_question_option (
    id SERIAL PRIMARY KEY,
    assessment_question_id INTEGER,   
    option_number INTEGER,
    option_answer VARCHAR,  
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE assessment_question_option TO agora;
CREATE INDEX IF NOT EXISTS idx_assessment_question_option_assessment_question_id ON assessment_question_option (assessment_question_id);


CREATE TABLE IF NOT EXISTS completed_assessment (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER,
    user_id INTEGER,
    topic_assessment_number INTEGER,    -- 1-Pre, 2-Post, 3-Post-retake 1, 4-post-retake 2, etc
    percentage_correct DECIMAL(4,3),    -- ex: .923 (92.3%), 1.000 (100%)
    completion_time TIMESTAMP,          -- Incase computation of corrcect percentage is different or re-done from intial record create
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON TABLE completed_assessment TO agora;
GRANT USAGE, SELECT ON SEQUENCE completed_assessment_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_completed_assessment_assessment_id ON completed_assessment (assessment_id);
CREATE INDEX IF NOT EXISTS idx_completed_assessment_user_id ON completed_assessment (user_id);

CREATE TABLE IF NOT EXISTS completed_assessment_question (
    id SERIAL PRIMARY KEY,
    completed_assessment_id INTEGER,
    assessment_question_id INTEGER,
    assessment_question_option_id INTEGER,  -- this is the users chosen answer
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON TABLE completed_assessment_question TO agora;
GRANT USAGE, SELECT ON SEQUENCE completed_assessment_question_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_completed_assessment_question_assessment_question_id ON completed_assessment_question (assessment_question_id);
CREATE INDEX IF NOT EXISTS idx_completed_assessment_question_completed_assessment_id ON completed_assessment_question (completed_assessment_id);


CREATE TABLE IF NOT EXISTS activities (
    id SERIAL PRIMARY KEY,
    activity_type INTEGER,   -- ?? TODO: what types will there be, do i need this? activities currently a design STUB
    activity_name VARCHAR,  
    activity_description VARCHAR,
    activity_html VARCHAR,
    is_required BOOLEAN,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE activities TO agora;


CREATE TABLE IF NOT EXISTS completed_activity (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER,
    user_id INTEGER,
    submission_text VARCHAR,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    update_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE completed_activity TO agora;
GRANT USAGE, SELECT ON SEQUENCE completed_activity_id_seq TO agora;

CREATE INDEX IF NOT EXISTS idx_completed_activity_activity_id ON completed_activity (activity_id);


-- Discussion API tables

CREATE TABLE IF NOT EXISTS discussions (
    discussion_id SERIAL,
    resource_id INTEGER,
    discussion_text VARCHAR,
    CONSTRAINT composite_id PRIMARY KEY (resource_id, discussion_id)
);

GRANT ALL PRIVILEGES ON TABLE discussions TO agora;
GRANT USAGE, SELECT ON SEQUENCE discussions TO agora;

CREATE TABLE IF NOT EXISTS discussion_comments (
    comment_id SERIAL,
    discussion_id INTEGER,
    comment_text VARCHAR,
    CONSTRAINT composite_id PRIMARY KEY (comment_id, discussion_id)

);

GRANT ALL PRIVILEGES ON TABLE discussion_comments TO agora;
GRANT USAGE, SELECT ON SEQUENCE discussion_comments TO agora;

CREATE TABLE IF NOT EXISTS discussion_comment_ratings (
    comment_id PRIMARY KEY,
    rating BOOLEAN,
    user_id INTEGER
);

GRANT ALL PRIVILEGES ON TABLE discussion_comment_ratings TO agora;
GRANT USAGE, SELECT ON SEQUENCE discussion_comment_ratings TO agora;