from flask import Flask, render_template, jsonify, send_from_directory
from script_generator import generate_script_from_article
from scraper import fetch_news, fetch_full_article
from backend.tts import generate_audio
import os

app = Flask(__name__)

@app.route("/templates")
def index():
    return render_template("index.html")

@app.route("/latest")
def latest_news_audio():
    articles = fetch_news(limit=1)
    if not articles:
        return jsonify({"error": "No news found"}), 500

    article = articles[0]
    content = fetch_full_article(article['url'])
    if not content:
        return jsonify({"error": "Failed to fetch content"}), 500

    script = generate_script_from_article(content)
    audio_path = "static/output.mp3"
    generate_audio(script, filename=audio_path)

    return jsonify({
        "title": article['title'],
        "script": script,
        "audio_url": "/static"
    })

@app.route("/static")
def audio():
    return send_from_directory("static", "output.mp3", mimetype="audio/mpeg")

if __name__ == "__main__":
    os.makedirs("static", exist_ok=True)
    app.run(debug=True)
