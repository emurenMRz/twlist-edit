const Twitter = require("twitter-api-sdk");
const api = require("./api-server");

const authClient = new Twitter.auth.OAuth2User({
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
	callback: `${process.env.API_SERVER_HOST}/callback`,
	scopes: ["tweet.read", "users.read", "list.read", "list.write"],
});

const client = new Twitter.Client(authClient);
const port = process.env.PORT || 3000;

const SERVICE_NAME = "tw-list-edit";
let bearerToken = null;

function responseException(response, e) {
	console.dir(e, { depth: null });

	let result = e.message;
	if (!result) result = `${e.status} ${e.statusText}`;
	response.json({ error: result });
}

api.get("/login", async (reqeust, response) => {
	try {
		response.redirect(authClient.generateAuthURL({
			state: SERVICE_NAME,
			code_challenge_method: "s256",
		}));
	} catch (e) { responseException(response, e); }
});

api.get("/callback", async (request, response) => {
	try {
		const { code, state } = request.query;
		if (state !== SERVICE_NAME) {
			response.writeHeader(500, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("Calls from different services.");
			return;
		}
		const { token_type, access_token } = await authClient.requestAccessToken(code);
		const { data: { id, username } } = await client.users.findMyUser();
		const cookie = [`uid=${id}`, `token_type=${token_type}`, `access_token=${access_token}`, "Secure=true", "HttpOnly=true"];
		const path = api.getRoot();
		if (path.length > 0)
			cookie.push(`Path=${path}`);
		if (token_type === "bearer")
			bearerToken = new Twitter.OAuth2Bearer(access_token);
		response.setHeader('Set-Cookie', cookie);
		response.redirect(`/?login=${username}`);
	} catch (e) { responseException(response, e); }
});

api.get("/revoke", async (reqeust, response) => {
	try {
		response.json({ revoked: await authClient.revokeAccessToken() });
	} catch (e) { responseException(response, e); }
});

//
// Manage lists
//

api.get("/lists", async (request, response) => {
	try {
		const uid = request.searchCookieValue("uid");
		const params = {
			expansions: ["owner_id"],
			"list.fields": [
				"created_at",
				"follower_count",
				"member_count",
				"private",
				"description"
			],
			"user.fields": ["created_at"],
		};
		const { next } = request.query;
		if (next)
			params.pagination_token = next;
		response.json(await client.lists.listUserOwnedLists(uid, params));
	} catch (e) { responseException(response, e); }
});

api.post("/lists/create", async (reqeust, response) => {
	try {
		const { name, description, private } = reqeust.query;
		if (!name || name.length === 0) throw new TypeError("'Name' is required.");
		const params = {};
		if (name) params.name = name;
		if (description) params.description = description;
		if (private) params.private = private;
		const { data: { id } } = await client.lists.listIdCreate(params);
		response.json(await client.lists.listIdGet(id, {
			expansions: ["owner_id"],
			"list.fields": [
				"created_at",
				"follower_count",
				"member_count",
				"private",
				"description"
			],
			"user.fields": ["created_at"],
		}));
	} catch (e) { responseException(response, e); }
});

api.put("/lists/:id", async (reqeust, response) => {
	try {
		const { id, name, description, private } = reqeust.query;
		const params = {};
		if (name) params.name = name;
		if (description) params.description = description;
		if (private) params.private = private;
		if (Object.keys(params).length === 0) throw new TypeError("request parameter is empty.");
		response.json(await client.lists.listIdUpdate(id, params));
	} catch (e) { responseException(response, e); }
});

api.delete("/lists/:id", async (reqeust, response) => {
	try {
		const { id } = reqeust.query;
		response.json(await client.lists.listIdDelete(id));
	} catch (e) { responseException(response, e); }
});

//
// List members
//

api.get("/list/:id", async (request, response) => {
	try {
		const params = {
			expansions: ["pinned_tweet_id"],
			"user.fields": [
				"id",
				"name",
				"username",
				"profile_image_url",
				"created_at",
				"description",
				"entities",
				"location",
				"pinned_tweet_id",
				"protected",
				"public_metrics",
				"url",
				"verified",
				"withheld"
			],
		};
		const { id, next } = request.query;
		if (next)
			params.pagination_token = next;
		response.json(await client.users.listGetMembers(id, params));
	} catch (e) { responseException(response, e); }
});

api.post("/list/:id", async (request, response) => {
	try {
		const { id, member_id } = request.query;
		if (!member_id) throw new TypeError("'member_id' is required.");
		response.json(await client.lists.listAddMember(id, member_id));
	} catch (e) { responseException(response, e); }
});

api.delete("/list/:id", async (request, response) => {
	try {
		const { id, member_id } = request.query;
		if (!member_id) throw new TypeError("'member_id' is required.");
		response.json(await client.lists.listRemoveMember(id, member_id));
	} catch (e) { responseException(response, e); }
});

///////////////////////////////////////////////////////////////////////////////

api.setRoot("/api");
api.listen(port);
