-- production coding coach database setup

-- setup (as root / postgres)
create database codingcoach;
create user codingcoach with encrypted password 'codingcoach';
grant all privileges on database codingcoach to codingcoach;
grant connect on database codingcoach to codingcoach;
\c codingcoach codingcoach

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

GRANT ALL PRIVILEGES ON TABLE cc_sponsors TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE cc_sponsors_id_seq TO codingcoach;

CREATE TABLE IF NOT EXISTS user_data (
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

GRANT ALL PRIVILEGES ON TABLE user_data TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE user_data_id_seq TO codingcoach;

CREATE INDEX IF NOT EXISTS idx_user_data_username ON user_data (LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_data_email ON user_data (LOWER(email));

CREATE TABLE IF NOT EXISTS session (
  sid varchar NOT NULL COLLATE "default",
  sess json NOT NULL,
  expire timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);

GRANT ALL PRIVILEGES ON TABLE session TO codingcoach;
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

GRANT ALL PRIVILEGES ON TABLE products TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE products_id_seq TO codingcoach;


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


GRANT ALL PRIVILEGES ON TABLE product_images TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE product_images_id_seq TO codingcoach;
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images (product_id);


INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Code Bot 3π+ Kit', 
    'product',
    '<p>The code bot kit is a complete kit that when added to a Polulu 3π+ robot enables to you build and follow along with the Robotics Programing video series.</p><p><strong>Please Note: In addition to this kit you also need to <a href="https://www.pololu.com/category/280/3pi-plus-32u4-oled-robot">purchase a Polulu 3π+ robot.</a>  We recommend the <a href="https://www.pololu.com/product/4976">turtle edition</a>, but any of the 3 editions [hyper, standard, turtle] will work.</strong></p>', 
    '<p>This kit contains the following:</p>
                            <ul>
                                <li>Custom chassis piece to mount servo and breadboard</li>
                                <li>Micro Servo</li>
                                <li>Ultrasonic Sensor [2cm - 400cm / 1 inch - 13 foot] range</li>
                                <li>Custom low profile ultrasonic mount</li>
                                <li>Custom rear mounted counter weight</li>
                                <li>Micro Breadboard [25 hole]</li>
                                <li>4 F-M jumper wires [10 cm]</li>
                                <li>3 M-M jumper wires [10 cm]</li>
                                <li>Capacitor [100uf or larger]</li>
                                <li>Easy to follow instructions</li>
                            </ul>
                            <p>The Code Bot 3π+ kit custom chassis design allows all hardware to be securely mounted to the robot and allows wires to be routed so that they do not get snagged or tangled. The innovative chassis design clips to the 3π+ robot without fasteners or glue but will stay in place even if the robot is completely upside down!</p>
                            <p>The in-house designed components of the Code Bot 3π+ kit [Chassis, low profile ultrasonic mount, counterweight] are all constructed from thermoplastic polymer made strictly from renewable resources.  These pieces have been painstakingly engineered to fit perfectly to the robot and ensure durability while remaining light-weight. Assembly instructions are well documented and clear, assembly takes about 15 minutes!</p>
                            <p>The ultrasonic sensor has a 2cm - 400cm / 1 meter [1 inch - 13 foot] range and can be rotated by the servo to provide the robot with a wide view of the world, the servo rotates more than 180 degrees. The servo has very low power consumption allowing it to be powered by the 4 AAA batteries powering the 3π+ robot [not included]. The custom designed sensor mount is exclusive to the Code Bot 3π+ kit and allows the ultrasonic sensor to be kept as low as possible allowing the robot to better see objects in the path of the robot, reducing blind spots low to the ground.</p>
                            <p><strong>The Code Bot 3π+ is the ultimate platform to learn robotics programming for the individual, K-12 school, or higher education institution!</strong></p>
                            <p>If you have any questions please email:
                                <a href="mailto:orders@codingcoach.net">orders@codingcoach.net</a>.
                            </p>',
    'Purchase Code Bot 3π+ [includes USPS First class shipping in United States of America]',
    'prod_L0DApx1FHftZzX', 'price_1KKCkEEfcKzaTpMsR0N8jZ6G', '49.99', '/api/stripe/cb1-checkout-session', '/assets/img/codebot/code-bot-parts.jpg', true
);

INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Founders Membership',
    'membership', 
    '<p>Membership to the coding coach allows you unlimited access to all course content. You also receive special access to weekly office hours and additional content based on your goals and the topics you are taking.  Membership is your all access pass!</p>', 
    '<p>The Founders Membership is a limited time early adopter membership opportunity! As a thank you for being an early believer you can keep the same benefits as full membership with a permanent lower rate!</p>',
    'Become a founding member!',
    'prod_L0DJYbRxyOF5pv', 'price_1KKCt4EfcKzaTpMs1vmvCDyX', '14.99', '/api/stripe/founders-checkout-session', '/assets/img/background-art-square.png', true
);

INSERT INTO products (
    product_name, product_type, product_description_1, product_description_2, product_purchase_text, stripe_product_id, stripe_price_id, price, product_url, product_static_image, active
)
VALUES (
    'Topic Access Token',
    'topic_access', 
    '<p>Tokens can be purchased to allow access a course topic. Each token allows full access to the material in one topic.</p>', 
    '',
    'Purchase a Topic Access Token',
    'prod_L0DKZxZVLsu8Jx', 'price_1KKCu5EfcKzaTpMsJXY0wosi', '9.99', '/api/stripe/access-token-checkout-session', '/assets/img/robot-fun.png', true
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
    '', '/assets/img/codebot/assembled-kit-off-robot.jpg'
);

INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', '<p class="mb-5 text-left">
                                        All assembled components of the Code Bot 3π+ kit are shown here including the rear counterweight. The in-house designed components of the Code Bot 3π+ kit (Chassis, low profile ultrasonic mount, counterweight) are all constructed from thermoplastic polymer made strictly from renewable resources.  These pieces have been painstakingly engineered to fit perfectly to the robot and ensure durability while remaining light-weight. Assembly instructions are well documented and clear, assembly takes about 15 minutes!
                                    </p>', 
    '', '/assets/img/codebot/assembled-kit-no-robot.jpg'
);
INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', 'p class="mb-5 text-left">
                                        Code Bot 3π+ ultrasonic sensor, specially crafted low profile servo mount, and micro low power servo. The ultrasonic sensor has a 2cm - 400cm / 1 meter [1 inch - 13 foot] range and can be rotated by the servo to provide the robot with a wide view of the world, the servo rotates more than 180 degrees. The servo has very low power consumption allowing it to be powered by the 4 AAA batteries powering the 3π+ robot (not included). The custom designed sensor mount is exclusive to the Code Bot 3π+ kit and allows the ultrasonic sensor to be kept as low as possible allowing the robot to better see objects in the path of the robot, reducing blind spots low to the ground.
                                    </p>', 
    '', '/assets/img/codebot/parts-servo-horn-sensor.jpg'
);
INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', '<p class="mb-5">
                                        Included Parts list (Numbers are referenced throughout individual steps in instruction booklet).
                                        </p><ol>
                                            <li>Code Bot chassis - servo and breadboard mount</li>
                                            <li>Code Bot low profile servo horn mount</li>
                                            <li>Code Bot counter weight</li>
                                            <li>Ultrasonic sensor</li>
                                            <li>Male - Female jumper wires (4)</li>
                                            <li>Male - Male jumper wires (3)</li>
                                            <li>Capacitor (100uf or greater)</li>
                                            <li>Male - Male coupler</li>
                                            <li>Servo mount screw</li>
                                            <li>Servo horn screw</li>
                                            <li>Micro 180 degree servo</li>
                                            <li>Micro breadboard (25 hole)</li>
                                        </ol>
                                    <p></p>', 
    '', '/assets/img/codebot/parts-diagram.jpg'
);
INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', '<p class="mb-5 text-left">
                                        This image shows a close-up of the rear counter-weight. You can order yours with a custom engraving, click on the "Name your bot" option to learn more. <strong>Note: </strong>This image shows Code Bot 3π+ components assembled on a Polulu 3π+ robot.  The robot is not incuded in this kit and must be <a href="https://www.pololu.com/category/280/3pi-plus-32u4-oled-robot">purchased separately.</a>
                                    </p>', 
    '', '/assets/img/codebot/codebot1-back.jpg'
);
INSERT INTO product_images (
    product_id, image_name, image_description_1, image_description_2, image_url
)
VALUES (
    1, 'Code Bot 3π+', 'p class="mb-5 text-left">
                                        Hello Code Bot! This robot is ready to navigate the world using the brain you provide it! <strong>Note: </strong>This image shows Code Bot 3π+ components assembled on a Polulu 3π+ robot.  The robot is not incuded in this kit and must be <a href="https://www.pololu.com/category/280/3pi-plus-32u4-oled-robot">purchased separately.</a>
                                    </p>', 
    '', '/assets/img/codebot/codebot1-front.jpg'
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

GRANT ALL PRIVILEGES ON TABLE orders TO codingcoach;
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON orders (product_id);
GRANT USAGE, SELECT ON SEQUENCE orders_id_seq TO codingcoach;


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

GRANT ALL PRIVILEGES ON TABLE user_sessions TO codingcoach;
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions (user_id);
GRANT USAGE, SELECT ON SEQUENCE user_sessions_id_seq TO codingcoach;


-- Roles and related <- userService?
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR,
    role_description VARCHAR,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE roles TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE roles_id_seq TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE user_role TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE user_role_id_seq TO codingcoach;

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
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE goals TO codingcoach;



CREATE TABLE IF NOT EXISTS topics ( -- <- pathService or separate topicService?
    id SERIAL PRIMARY KEY,
    topic_name VARCHAR,
    topic_description VARCHAR,
    topic_image VARCHAR,
    topic_html VARCHAR,
    assessment_id INTEGER, -- id of assessment given both at the begining (pre) and end (post) of a topic for each user.  This is always the same assessment.
    has_activity BOOLEAN DEFAULT true,
    activity_id INTEGER,  -- id of lab or activity associated with topic, all topics should have one
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE topics TO codingcoach;


CREATE TABLE IF NOT EXISTS goal_path (
    id SERIAL PRIMARY KEY,
    goal_rid INTEGER,
    topic_id INTEGER,
    position INTEGER,
    is_required BOOLEAN,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);
GRANT ALL PRIVILEGES ON TABLE goal_path TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE goal_path_id_seq TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE user_goal TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE user_goal_id_seq TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE user_topic TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE user_topic_id_seq TO codingcoach;

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
    create_time TIMESTAMP DEFAULT current_timestamp,
    owned_by INTEGER
);

GRANT ALL PRIVILEGES ON TABLE resources TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE topic_resource TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE topic_resource_id_seq TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE completed_resource TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE completed_resource_id_seq TO codingcoach;

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

GRANT ALL PRIVILEGES ON TABLE assessments TO codingcoach;




CREATE TABLE IF NOT EXISTS assessment_question (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER,   
    question VARCHAR,  
    is_required BOOLEAN,
    correct_option_id INTEGER,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE assessment_question TO codingcoach;
CREATE INDEX IF NOT EXISTS idx_assessment_question_assessment_id ON assessment_question (assessment_id);


CREATE TABLE IF NOT EXISTS assessment_question_option (
    id SERIAL PRIMARY KEY,
    assessment_question_id INTEGER,   
    option_number INTEGER,
    option_answer VARCHAR,  
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
);

GRANT ALL PRIVILEGES ON TABLE assessment_question_option TO codingcoach;
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
GRANT ALL PRIVILEGES ON TABLE completed_assessment TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE completed_assessment_id_seq TO codingcoach;

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
GRANT ALL PRIVILEGES ON TABLE completed_assessment_question TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE completed_assessment_question_id_seq TO codingcoach;

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

GRANT ALL PRIVILEGES ON TABLE activities TO codingcoach;


CREATE TABLE IF NOT EXISTS completed_activity (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER,
    user_id INTEGER,
    submission_text VARCHAR,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp,
    update_time TIMESTAMP
);
GRANT ALL PRIVILEGES ON TABLE completed_activity TO codingcoach;
GRANT USAGE, SELECT ON SEQUENCE completed_activity_id_seq TO codingcoach;

CREATE INDEX IF NOT EXISTS idx_completed_activity_activity_id ON completed_activity (activity_id);

