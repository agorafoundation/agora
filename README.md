![alt text](https://github.com/briangormanly/agora/blob/main/client/agora/public/assets/img/logos/agora-logo-bwn-1200.png?raw=true)
# Agora - Open source, closed loop, user centric, cloud based learning platform
### The Agora project is building a free space to Research, Learn and Collaborate.

> *"We should not trust the masses that say only the free can be educated, but rather the lovers of wisdom that say only the educated can be free"*. - Epictetus

The goals behind agora are to be an open, decentralized, collaborative, and forever free environment where we can conduct our learning, research our ideas, and remember all the lessons we learn, forever. An environment that is not owned by an academic institution or corporation but by everyone. Guided only by virtue and principles:  

The perfect research and learning platform:
- Is accessible: Free and open source and will remain so forever.
- Provides feedback to both the learner and teacher. Learners can see what they have learned and what need more attention.  Teachers can see how well lessons are recieved and how well content is working. Agora closes the loop.
- User, not institution centric: Lifelong learners require a lifelong system that follows them.
- Is social: Opening a safe central hub of learning means collaboration and sharing of
information can be easier than ever.
- Is safe: Your data will never be used against you, only for you. it will not be sold or used
for marketing and is only seen by people you authorize.
- Is smart: It is intuitive to use and can suggest helpful resources getting you closer to the
answers you seek
- Listens: To its users, the sum of its parts, always remains a force for good.

### You can learn more about the pedagogical approaches that agora is designed to promote and try it out for yourself on the original running Agora platform, the Coding Coach, here: https://codingcoach.net  

## Installation  

### Dependencies:
 * Postgres 
 * Node.js
 * That's it!

## Database setup
* You can either run /server/db/CreateTablesScript-base-example.sql or create a copy and modify / comment out default data to your liking
>  psql -U postgres -f server/db/createTablesScript-base-example.sql (from the project's root directory, default agora password is 'agora')
* Run the script to create the database.  If you run the script with postgres / root user it will create a database and user named 'agora', then connect to the new database and create the schema using the agora user.

### Quick start setup
1. After installing and configuring Node.js and Postgres clone this git repo
> git clone https://github.com/briangormanly/agora.git
> cd agora
2. *Make a copy of the .env.example file called .env in the project home directory* 
3. In the .env file: 
    1. Note the FRONT_END_NAME in the future you can change this to use your own front end / Theme 
    2. Edit Postgres settings to connect to your database server
    3. Set a random session secret string 
    > SESSION_SECRET = EUOee33unt5haEAOUOMAKE_THIS_YOUR_OWNa34uei58355
    4. You can set email, stripe and github integrations off by setting the following:
    > EMAIL_TOGGLE = false  
    > STRPIE_TOGGLE = false  
    > GITHUB_TOGGLE = false  
    5. To use any of these integrations (email is a good one as you will need it for user email verification and password reset) set the parameter to 'true' (lowercase without the single quotes). You must also then set all the affiliated settings for that integration.
4. Save your .env file
5. Install dependencies 
> npm i
6. Start the service
> npm start
7. Navigate your web browser to http://localhost:2633 if you are running on your local machine.
8. Nice!


### Current Features
1. Full user creation / login / security / email verification
2. Avatar / file upload
3. Basic Stripe integration to allow for community support
4. Event feed API / Service 
5. Goal and Topic oriented learning path. Goals represent what the user wants to learn, topics are the pieces they need to know to accomplish the goal.
6. Topic flow based on closed loop teaching philosophy. All topics use the following structure for content
    1. Introduction
    2. Pre Assessment
    3. Resources
    4. Activity        
    5. Post Assessment 
    6. Summary         
7. Fully responsive UI based on Bootstrap


### What's next (very soon!)
1. Discussions (At global, goal and topic level)
2. Teacher / Administrator roles and backend to create content without having to insert into database directly
3. Github repository integration so students can create / integrate github repo into topic activities.

### And then?
1. Web3 based decentralization! Own your academic record. (more on this soon).
2. Remove the CodingCoach content from base Agora build
