import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

print("--- Checking available Gemini models for your API key ---")

try:
    # Configure the client with your API key
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not defined in your .env file.")
    genai.configure(api_key=api_key)

    print("\nModels that support the 'generateContent' method:")
    print("-------------------------------------------------")
    
    found_models = False
    # List all available models
    for m in genai.list_models():
        # Check if the model supports the method used by our app
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
            found_models = True

    if not found_models:
        print("No models supporting 'generateContent' were found for this API key.")

except Exception as e:
    print(f"\n--- An error occurred ---")
    print(e)