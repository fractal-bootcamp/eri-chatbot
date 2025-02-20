
import json
from datasets import Dataset
from transformers import AutoTokenizer
import pandas as pd
import re
import numpy as np
import os

def load_twitter_data(json_file_path):
    """
    Load Twitter data from JSON file and convert to HuggingFace Dataset
    """
    with open(json_file_path, 'r') as f:
        data = json.load(f)
    
    # Extract tweets into a list
    tweets = data.get('tweets', [])
    tweet_texts = [tweet['content'] for tweet in tweets]
    
    # Convert to DataFrame first
    df = pd.DataFrame({'text': tweet_texts})
    
    # Convert to HuggingFace Dataset
    dataset = Dataset.from_pandas(df)
    return dataset

def clean_tweet(text):
    """
    Clean tweet text by removing URLs, mentions, hashtags, and special characters
    """
    # Remove URLs
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    
    # Remove mentions
    text = re.sub(r'@\w+', '', text)
    
    # Remove hashtags
    text = re.sub(r'#\w+', '', text)
    
    # Remove RT
    text = re.sub(r'^RT[\s]+', '', text)
    
    # Remove special characters and numbers
    text = re.sub(r'[^\w\s]', '', text)
    text = re.sub(r'\d+', '', text)
    
    # Remove extra whitespace
    text = ' '.join(text.split())
    
    return text.strip()

def preprocess_dataset(dataset):
    """
    Clean and preprocess the dataset
    """
    # Clean tweets
    dataset = dataset.map(
        lambda x: {'cleaned_text': clean_tweet(x['text'])}
    )
    
    # Remove empty tweets
    dataset = dataset.filter(lambda x: len(x['cleaned_text']) > 0)
    
    return dataset

def tokenize_dataset(dataset, tokenizer_name="gpt2", max_length=128):
    """
    Tokenize the dataset using specified tokenizer
    """
    tokenizer = AutoTokenizer.from_pretrained(tokenizer_name)
    tokenizer.pad_token = tokenizer.eos_token
    
    def tokenize_function(examples):
        return tokenizer(
            examples['cleaned_text'],
            truncation=True,
            padding='max_length',
            max_length=max_length,
            return_tensors="pt"
        )
    
    tokenized_dataset = dataset.map(
        tokenize_function,
        batched=True,
        remove_columns=dataset.column_names
    )
    
    return tokenized_dataset, tokenizer

def prepare_training_data(username=None, tokenizer_name="gpt2", max_length=128):
    """
    Main function to prepare data for training
    """
    training_data_dir = './training_data'  # Updated path to match getTweets.ts
    
    if username:
        json_file_path = os.path.join(training_data_dir, f"{username}_tweets.json")
        if not os.path.exists(json_file_path):
            raise FileNotFoundError(f"No training data found for user {username}")
        
        # Load data for specific user
        dataset = load_twitter_data(json_file_path)
    else:
        # Load all JSON files in the directory
        datasets = []
        for filename in os.listdir(training_data_dir):
            if filename.endswith('_tweets.json'):
                file_path = os.path.join(training_data_dir, filename)
                datasets.append(load_twitter_data(file_path))
        
        # Concatenate all datasets
        dataset = Dataset.concatenate_datasets(datasets) if datasets else None
        
        if dataset is None:
            raise FileNotFoundError("No training data found in directory")
    
    # Preprocess
    cleaned_dataset = preprocess_dataset(dataset)
    
    # Tokenize
    tokenized_dataset, tokenizer = tokenize_dataset(
        cleaned_dataset, 
        tokenizer_name=tokenizer_name,
        max_length=max_length
    )
    
    # Split into train/val
    split_dataset = tokenized_dataset.train_test_split(test_size=0.1)
    
    return split_dataset, tokenizer
