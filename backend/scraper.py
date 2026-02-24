import requests
from bs4 import BeautifulSoup

def fetch_news(source="dawn", limit=3):
    """
    Fetches the latest news headlines and URLs from Dawn.com.
    Returns a list of dictionaries with title and url.
    """
    url = "https://www.dawn.com/latest-news"
    response = requests.get(url)

    if response.status_code != 200:
        print("Failed to fetch news.")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    article_tags = soup.select("article h2 a")

    news = []
    for tag in article_tags[:limit]:
        title = tag.text.strip()
        link = tag['href']
        news.append({"title": title, "url": link})

    return news


def fetch_full_article(url):
    """
    Given a news URL, fetches the full article text.
    Returns a single string containing all paragraphs.
    """
    response = requests.get(url)

    if response.status_code != 200:
        print(f"Failed to fetch article at {url}")
        return ""

    soup = BeautifulSoup(response.text, 'html.parser')
    paragraphs = soup.select("article .story__content p")

    full_text = ' '.join(p.get_text(strip=True) for p in paragraphs)
    return full_text


# 🔧 TEST FUNCTION (optional)
if __name__ == "__main__":
    news_list = fetch_news()
    for news in news_list:
        print(f"🔹 {news['title']}")
        content = fetch_full_article(news['url'])
        print(f"✏️ Content Preview: {content[:200]}...\n")
