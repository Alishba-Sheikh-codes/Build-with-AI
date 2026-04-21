import os
from dotenv import load_dotenv
from pathlib import Path
import google.generativeai as genai
from scraper import fetch_news, fetch_full_article

# Load .env file
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path)

# Configure Gemini API key
genai_api_key = os.getenv("GEMINI_API_KEY")
if not genai_api_key:
    raise ValueError("\u274c GEMINI_API_KEY not found in .env")
genai.configure(api_key=genai_api_key)

# Generate script from article text
def generate_script_from_article(article_text):
    prompt = f"Write a short, engaging 30-second spoken video script based on this article:\n\n{article_text}"
    model = genai.GenerativeModel("gemini-2.5-flash-preview-04-17")
    response = model.generate_content(prompt)

    if hasattr(response, 'text'):
        return response.text
    else:
        return "\u26a0\ufe0f Error: No script returned from Gemini."

def get_script_from_latest_article():
    articles = fetch_news(source="dawn", limit=1)

    if not articles:
        return "\u26a0 No news articles available."

    article = articles[0]
    content = fetch_full_article(article['url'])

    if not content:
        return "\u26a0 Couldn't fetch article content."

    return generate_script_from_article(content)

