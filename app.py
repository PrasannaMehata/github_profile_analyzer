from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

GITHUB_API_URL = "https://api.github.com/users/"

def analyze_profile(username):
    user_url = GITHUB_API_URL + username
    repos_url = user_url + "/repos?per_page=100"

    user_data = requests.get(user_url).json()
    repos_data = requests.get(repos_url).json()

    languages = {}
    stars = 0
    forks = 0
    commits = 0  # Basic estimate (since commit data needs deeper analysis)

    for repo in repos_data:
        stars += repo.get("stargazers_count", 0)
        forks += repo.get("forks_count", 0)
        lang = repo.get("language", "Unknown")
        languages[lang] = languages.get(lang, 0) + 1

    # Rating logic (basic)
    rating = round((stars + forks) / (len(repos_data) + 1), 2)

    return {
        "name": user_data.get("name", username),
        "avatar": user_data.get("avatar_url"),
        "languages": languages,
        "stars": stars,
        "forks": forks,
        "repos": len(repos_data),
        "rating": rating
    }

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/analyze', methods=['POST'])
def analyze():
    username = request.json.get("username")
    data = analyze_profile(username)
    return jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)
