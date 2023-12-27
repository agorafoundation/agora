![alt text](https://github.com/briangormanly/agora/blob/main/client/agora/public/assets/img/logos/Agora-Logo-1-wText-1080.png?raw=true)
## The AI driven Research and Learning Platform [https://freeagora.org](https://freeagora.org)

> #### *"The natural can never be inferior to the artificial; art imitates nature, not the reverse. ... Now, all the arts move from the lower goals to higher ones. Won't nature do the same?"*. - Marcus Aurelius \ Meditations [11:10]

## Let's build the next generation of software together.
Agora is born of a moment. It is abundantly clear that AI will increase our productivity, help us make new connections and discoveries, and potentially make the world a better place. We know that technologies such as semantic search and generative AI improve vastly as the size of the context (our data) we provide increases. Having all lived through the birth of Web 2.0 we all watched as a few companies amassed immeasurable wealth by offering services that harvested the most valuable commodity, information. Our vision is to create a trusted platform, focused on the individual that allows people to safely collect their data in a cloud platform that is engineered to provide all the value of these data driven tools, but allowing them complete control over their data and serious value even when they choose to keep it 100% private.

Agora is an open, free, cloud based learning and research platform. It is a living experiment, built by educators, researchers and students to envision what is possible tomorrow, by building it today. Untethered by the past, a framework for developing the next generation of Human Computer Interaction (HCI) driven by safe AI interacting privately with your data. Its architecture is simple, fast and light, a solid core that allows endless experimentation in semantic search and generative AI assistance. We envision it growing into your cloud based operating system of the future. 

Protected by the Agora Foundation, a Public Service charged with protecting individual data as a service rendered in the public interest, ensuring your privacy and ownership of data within the system now and for the lifetime of the foundation!

## Agora's guiding principles:
- Accessible: Free and open source and will remain so forever
- Feedback: Agora will keep the loop closed, using visualizations and chain of thought reasoning.
- User Centric: Lifelong learners require a lifelong system - not the institutions they are affiliated with.
- Collaborative: Agora can help you make new connections based on the semantic meaning of your data, true connections with like-minded people working on related problems.
- Safe: Your data will never be used against you, only for you. it will not be sold or used for marketing and is only seen by people you authorize.
- Smart: It can suggest helpful resources getting you closer to the answers you seek
- Listens: To its users, the sum of its parts, always remains a force for good.
### Above all: The mission must remain first.

## Join the Agora Community Today!

Take the first step in revolutionizing your learning and research experience. Agora is more than just a platform; it's a community of forward-thinkers, innovators, and lifelong learners like you. By joining Agora, you're not just accessing a powerful tool; you're becoming part of a movement to shape the future of human-computer interaction.

### Don't just watch the future unfold; be a part of creating it.
 * 🧭 Explore the Possibilities: Visit freeagora.org to discover how Agora can transform your data into knowledge.
 * 💡 Sign Up for Free: Get immediate access to Agora's features by [signing up here](https://freeagora.org/dashboard).
 * 👩‍💻 Contribute to Our Growth: If you're interested in contributing to Agora's development, check our [Contribution Guide](https://github.com/agorafoundation/agora?tab=coc-ov-file#readme), [List of work to do](https://github.com/agorafoundation/agora/issues) and [Wiki](https://github.com/agorafoundation/agora/wiki).
Empower yourself with control over your data and join a community committed to innovation and privacy. Be a part of Agora – where your ideas and data drive the future.

## Code Installation / Development  
Agora is open source, and easy to install if you want to manage a local installation or set up a development environment to contribute to its growth.
Before working with Agora source please read the [Contributor code of conduct](https://github.com/agorafoundation/agora?tab=coc-ov-file#readme) and the [security policy](https://github.com/agorafoundation/agora?tab=security-ov-file#readme). Also be aware that the Agora source is protected by the [BSD 3-clause License](https://github.com/agorafoundation/agora?tab=BSD-3-Clause-1-ov-file#readme).

### Dependencies:
 * Postgres 
 * Node.js
 * That's it!

### Clone the repo
clone this git repo  
    > git clone https://github.com/briangormanly/agora.git  
    > cd agora 

### Database setup
You can either run /server/db/createDatabase.sql or create a copy and modify / comment out default data to your liking  
* From the agora project home directory:  
    > psql -U postgres -f server/db/createDatabase.sql   
* The script will try to create the agora database using your admin user, you can do this step manually if you perfer.
* Once the agora database and role are created the script will create the tables and data using the agora role. It will prompt you for the agora password, which if you did not change it in the script before running is 'agora'.

### Quick start setup
After ensuring that Node.js and PostgreSQL are installed and working and your database is created, you need to create a .env file, configure, install dependencies and run.  

1. *Make a copy of the .env.example file and call the copy `.env`, save it in the project home directory* 
2. In the .env file: 
    1. Note the FRONT_END_NAME in the future you can change this to use your own front end / Theme, set to agora by default. The theme is located in a folder of the same name in the client folder.
    2. Edit Postgres settings to connect to your database server (default shown)
        > PG_USER = agora  
        > PG_HOST = localhost  
        > PG_PASSWORD = agora  
        > PG_DATABASE = agora  
        > PG_PORT = 5432  
        > PG_SSL = false  
    3. Set a random session secret string 
        > SESSION_SECRET = EUOee33unt5haEAOUOMAKE_THIS_YOUR_OWNa34uei58355
    4. You can set email, stripe, GitHub and OpenAI integrations off by setting the following:
        > EMAIL_TOGGLE = false  
        > STRPIE_TOGGLE = false  
        > GITHUB_TOGGLE = false  
        > OPENAI_TOGGLE = false  
    5. To use any of these integrations (email is a good one as you will need it for user email verification and password reset) set the parameter to 'true' (lowercase without the single quotes). You must also then set all the affiliated settings for that integration.
    6. To use the openAI integrations you must apply your OpenAI API key, you should also provide a semantic scholar API key as this is used for sementic search and verification.
        > OPENAI_API_KEY = YOUR_API_KEY  
        > SEMANTIC_SCHOLAR_API_KEY = API_KEY  
    7. Make sure not to commit any of your keys to Git! the .env is in the .gitignore by default but the .env.example file will be committed!
3. Save your .env file
4. Install node.js dependencies 
    > npm i  
5. Start the Agora service!  
    > npm start

----- output ------
>
> Agora running... {localhost:4200}  
6. Navigate your web browser to http://localhost:PORT (default port is 4200) if you are running on your local machine.
7. Enjoy!

## API Documentation
API docs are managed in swagger and can be seen [here](https://freeagora.org/api-docs/). You can authenticate with your Agora user login.

## Current Features
1. Fully functional Editor for notes, papers and more.
2. Innovative Workspace / Topic / Resource organizational pattern for data
3. User management / email verification / Google SSO
4. Sharing and Collaboration of 
5. Automated Semantic and GenAI based productivity features
   - Keyword search assistance
   - Verified research and academic recommendations for current research
   - Web resource recommendations   
6. AI generated avatar image / avatar upload
7. Basic Stripe integration to allow for community support
8. Fully responsive UI based on Bootstrap


### What's next (very soon!)
1. ORCID integration (in testing)
2. Discussions (At global, workspace and topic level)
3. Recommendations regarding future work, literature to read.
4. Document formatting and grammar recommendations.
