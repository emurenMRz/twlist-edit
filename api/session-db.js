const Twitter = require("twitter-api-sdk");
const crypto = require('crypto')

exports.SessionDB = class {
	#sessions = {};

	generate() {
		const sid = crypto.createHmac("sha512", "" + Date.now()).update(process.env.SESSION_SEED).digest('hex');
		const auth = new Twitter.auth.OAuth2User({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			callback: `${process.env.API_SERVER_HOST}/callback`,
			scopes: ["tweet.read", "users.read", "list.read", "list.write"],
		});

		this.#sessions[sid] = { auth };
		return [sid, auth];
	}

	has(id) { return id in this.#sessions; }

	getAuth(id) {
		if (!this.has(id)) throw new Error("Unknown session ID");
		return this.#sessions[id].auth;
	}

	makeClient(id_or_auth) {
		let auth = null;
		if (typeof id_or_auth === "string")
			auth = this.getAuth(id_or_auth);
		else if (id_or_auth instanceof Twitter.auth.OAuth2User)
			auth = id_or_auth;
		else
			throw new TypeError("makeClient: id or auth is required");
		return new Twitter.Client(auth);
	}
}
