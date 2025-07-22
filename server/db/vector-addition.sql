-- ## make sure postgres is on the latest version (16.3 for me on hombrew on 24.7.7)
-- ## Install the vector db extension (mac / homebrew shown.. have to look up linux package for server)
brew install pgvector
-- ## run the following command in the postgres command client
CREATE EXTENSION IF NOT EXISTS vector;
