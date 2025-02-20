import os
import modal
from transformers import (
    GPT2LMHeadModel,
    TrainingArguments,
    Trainer
)
from dataProcessing import prepare_training_data

# Use modal.App instead of modal.Stub
app = modal.App("train_twitter_clone")

# Define container image with required dependencies
image = modal.Image.debian_slim().pip_install(
    "transformers",
    "torch", 
    "datasets",
    "pandas",
    "numpy",
    "scikit-learn"
).add_local_python_source("_remote_module_non_scriptable", "dataProcessing")

# Remove the 'secret' parameter for now
@app.function(
    gpu="A10G",
    image=image
)
def train_model(
    username=None,
    model_name="gpt2",
    output_dir="./models",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    warmup_steps=500,
    learning_rate=5e-5,
    max_length=128
):
    """
    Train a GPT-2 model on Twitter data using Modal cloud infrastructure
    """
    # Prepare the training data
    dataset_splits, tokenizer = prepare_training_data(
        username=username,
        tokenizer_name=model_name,
        max_length=max_length
    )

    # Initialize model
    model = GPT2LMHeadModel.from_pretrained(model_name)
    model.resize_token_embeddings(len(tokenizer))

    # Define training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_train_epochs,
        per_device_train_batch_size=per_device_train_batch_size,
        per_device_eval_batch_size=per_device_eval_batch_size,
        warmup_steps=warmup_steps,
        learning_rate=learning_rate,
        logging_dir='./logs',
        logging_steps=100,
        save_strategy="epoch",
        evaluation_strategy="epoch",
        load_best_model_at_end=True,
    )

    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=dataset_splits["train"],
        eval_dataset=dataset_splits["test"],
        tokenizer=tokenizer
    )

    # Train the model
    trainer.train()

    # Save the final model
    if username:
        final_output_dir = os.path.join(output_dir, f"{username}_model")
    else:
        final_output_dir = os.path.join(output_dir, "combined_model")
    
    trainer.save_model(final_output_dir)
    tokenizer.save_pretrained(final_output_dir)

    return model, tokenizer

@app.local_entrypoint()
def main():
    try:
        # Get username from command line or environment
        username = input("Enter Twitter username to train model on: ")
        
        # Train on the specified user's data
        model, tokenizer = train_model.remote(username=username)
        print("Training completed successfully!")
    except Exception as e:
        print(f"An error occurred during training: {str(e)}")
