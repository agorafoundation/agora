![alt text](https://github.com/briangormanly/agora/blob/main/client/agora/public/assets/img/logos/Agora-Logo-1-wText-1080.png?raw=true)
## To create the single best place to take notes, research and learn. A free digital space that resets our expectations regarding cloud data ownership and privacy.

> *"We should not trust the masses that say only the free can be educated, but rather the lovers of wisdom that say only the educated can be free"*. - Epictetus

Agora is an open, free, cloud based learning and research platform. We are creating the most intutitive way to research and learn available on the internet. Protected by the Agora Foundation, a Public Service charged with protecting individual data as a service rendered in the public interest, ensuring your privacy and ownership of data within the system now and for the lifetime of the foundation!

The workspaces behind agora are to be an open, decentralized, collaborative, and forever free environment where we can conduct our learning, research our ideas, and remember all the lessons we learn, forever. An environment that is not owned by an academic institution or corporation but by everyone. Guided only by virtue and principles:  

The perfect research and learning platform:
- Is accessible: Free and open source and will remain so forever
- Provides feedback to both the learner and teacher. Learners can see what they have learned and what need more attention.  Teachers can see how well lessons are recieved and how well content is working. Agora closes the loop.
- User, not institution centric: Lifelong learners require a lifelong system that follows them.
- Is social: Opening a safe central hub of learning means collaboration and sharing of
information can be easier than ever.
- Is safe: Your data will never be used against you, only for you. it will not be sold or used
for marketing and is only seen by people you authorize.
- Is smart: It is intuitive to use and can suggest helpful resources getting you closer to the
answers you seek
- Listens: To its users, the sum of its parts, always remains a force for good.

## Installation  

### Dependencies:
 * Postgres 
 * Node.js
 * That's it!

## Database setup
* You can either run /server/db/createDatabase.sql or create a copy and modify / comment out default data to your liking
>  psql -U postgres -f server/db/createDatabase.sql (from the root directory of the project, default agora password is 'agora')
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

----- output ------
>
> Agora running... {localhost:4200}
7. Navigate your web browser to http://localhost:PORT (default port is 4200) if you are running on your local machine.
8. Nice!


### Current Features
1. Improved main dashboard interface
2. Sharing and Collaboration
3. Full user creation / login / security / email verification
4. Avatar / file upload
5. Basic Stripe integration to allow for community support
6. Advanced Workspace / Topic / Resource hierarchy for note taking and resource management 
7. Fully responsive UI based on Bootstrap


### What's next (very soon!)
1. Web3 and other decentrailized solution evaluation
2. Discussions (At global, workspace and topic level)
3. Classroom sharing (Workspaces can be shared as a classroom environment)
