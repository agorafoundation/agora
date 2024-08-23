'''
Semantic Comparison for Tone Analysis
Author: Christian Sarmiento
Date Created: 8/14/2024
Last Updated: 8/14/2024
Description: This file's purpose is to use BERT to make word embeddings of the input text (text from the
text editor) and the generations from IBM Granite and compare the quality of the output of the two derived
vectors with cosine similarity. 
----------------------------------------------------------------------------------------------------------
Agora - Close the loop
© 2021-2024 Brian Gormanly
BSD 3-Clause License
see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
'''

# Imports
import sys
import json
from transformers import BertModel, BertTokenizer
import torch
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import logging
import warnings

# Ignore Warnings
loggers = [logging.getLogger(name) for name in logging.root.manager.loggerDict]
for logger in loggers:
    if "transformers" in logger.name.lower():
        logger.setLevel(logging.ERROR)
        
warnings.filterwarnings("ignore")


# Load BERT & BERTTokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertModel.from_pretrained('bert-base-uncased')

# Function to dervive word embedding vector for text
def getWordEmbeddings(text):

    # Tokenize inputs
    inputs = tokenizer(text, 
                       return_tensors='pt', 
                       truncation=True, 
                       padding=True,
                       clean_up_tokenization_spaces=True)

    # Get embeddings
    with torch.no_grad():
        outputs = model(**inputs)
    embeddings = outputs.last_hidden_state

    # Final embedding output
    finalEmbedding = embeddings[0][0]

    return finalEmbedding

# Main process
def main():
    
    # Variables
    keywordSimilarities = {}
    finalJSON = {}

    # Receive data from node.js file
    recievedData = json.loads(sys.stdin.read())
    inputSentences = recievedData['input']
    generation = recievedData['inputGeneration']
    processType = recievedData['processType']
    #print(f"Input Sentences: {inputSentences} \nGeneration: {generation} \nProcess Type: {processType}")

    # Semantic comparison for explanations
    if processType == "explanation":

        # Get embedding vector for generation
        generationEmbedding = np.array(getWordEmbeddings(generation).reshape(1,-1))
        #print(f"Embedding: {generationEmbedding}")

        # Calculate an average similarity for the input text by sentence
        count = 0
        similaritySum = 0
        explanationAvgSimilarity = 0
        for sentence in inputSentences:

            embedding = np.array(getWordEmbeddings(sentence).reshape(1,-1))
            count += 1

            similarity = cosine_similarity(generationEmbedding, embedding)
            similaritySum += similarity[0][0]

        explanationAvgSimilarity = similaritySum / count
        #print(f"Similarity: {explanationAvgSimilarity}")
        # Package into JSON object
        finalJSON['result'] = explanationAvgSimilarity
    
    # Semantic comparison for keywords
    elif processType == "keywords":
    
        # Iterate through each keyword
        for keyword in generation:

            # Get embedding for the keyword
            keywordEmbedding = np.array(getWordEmbeddings(keyword).reshape(1,-1))

           # Calculate an average similarity for the input text by sentence
            count = 0
            similaritySum = 0
            avgSimilarity = 0
            for sentence in inputSentences:

                embedding = np.array(getWordEmbeddings(sentence).reshape(1,-1))
                count += 1

                similarity = cosine_similarity(keywordEmbedding, embedding)
                similaritySum += similarity[0][0]
            
            avgSimilarity = similaritySum / count
            keywordSimilarities[keyword] = avgSimilarity

        # Package into JSON object
        finalJSON['result'] = keywordSimilarities

    # Return back to server process
    #print(f"Final JSON: {finalJSON}")
    print(json.dumps(finalJSON))
    

if __name__ == "__main__":

    main()