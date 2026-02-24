from flask import Flask, jsonify, request, send_from_directory
from script_generator import generate_script_from_article
from scraper import fetch_news, fetch_full_article
from tts import generate_tts_audio
from avatar import generate_avatar_video
import os

app = Flask(__name__)

# Define static directories
AUDIO_DIR = os.path.join(os.path.dirname(__file__), "static")
VIDEO_DIR = os.path.join(os.path.dirname(__file__), "videos")
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)
from flask import send_from_directory

@app.route("/static/output.mp3")
def serve_audio(filename):
    return send_from_directory(AUDIO_DIR, filename)

@app.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    source = data.get("source", "dawn")
    limit = data.get("limit", 1)
    lang = data.get("lang", "en")  # 'en' or 'ur'

    try:
        articles = fetch_news(source=source, limit=limit)
        full_article = fetch_full_article(articles[0]['url'])
        script = generate_script_from_article(full_article)

        audio_filename = "output.mp3"
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        generate_tts_audio(script, lang=lang, output_path=audio_path)

        video_filename = "output.mp4"
        video_path = os.path.join(VIDEO_DIR, video_filename)
        generate_avatar_video(audio_path, output_path=video_path)

        return jsonify({
            "title": articles[0]['title'],
            "script": script,
            "audio_url": f"/static/{audio_filename}",
            "video_url": f"/videos/{video_filename}"
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve audio files

# Serve video files
@app.route("/videos/output.mp4")
def serve_video(filename):
    return send_from_directory(VIDEO_DIR, filename)

if __name__ == "__main__":
    app.run(debug=True)
