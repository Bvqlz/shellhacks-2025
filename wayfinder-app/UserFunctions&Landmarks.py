from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = {}
checkins = {}

##LANDMARKS
landmarks = {
    "Florida International University Graham Center Pit":
        {"lat": 25.756305010307514, "lng": -80.37291507782811, "visits": 0},
    "Arbetters Hot Dogs":
        {"lat": 25.733552302746368, "lng": -80.33680016181258, "visits": 0},
}

##CREATING NEW USER
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    if username in users:
        return jsonify({"error": "User exists"}), 400
    users[username] = {"points": 0}
    checkins[username] = []
    return jsonify({"message": "Registered!", "username": username})

##CHECKIN TO LANDMARK
@app.route("/checkin", methods=["POST"])
def checkin():
    data = request.json
    username = data["username"]
    landmark = data["landmark"]

    if landmark not in landmarks:
        return jsonify({"error": "Landmark not found"}), 404

    ##UPDATING LANDMARK STATS,
    landmarks[landmark]["visits"] += 1
    checkins[username].append(landmark)
    users[username]["points"] += 10  # 10 points added to user per check in

    return jsonify({
        "message": f"{username} checked in at {landmark}!",
        "points": users[username]["points"],
        "landmark_visits": landmarks[landmark]["visits"]
    })

@app.route("/leaderboard", methods=["GET"])
def leaderboard():
    sorted_users = sorted(users.items(), key=lambda x: x[1]["points"], reverse=True)
    return jsonify([{ "username": u, "points": d["points"] } for u,d in sorted_users])



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=4444, debug=True)
