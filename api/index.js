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

api.get("/login", async (reqeust, response) => {
	try {
		response.redirect(authClient.generateAuthURL({
			state: SERVICE_NAME,
			code_challenge_method: "s256",
		}));
	} catch (e) { console.error(e); }
});

api.get("/callback", async (request, response) => {
	try {
		const { code, state } = request.query;
		if (state !== SERVICE_NAME) {
			response.writeHeader(500, { "Content-Type": "text/plain; charset=utf-8" });
			response.end("Calls from different services.");
			return;
		}
		const token = await authClient.requestAccessToken(code);
		const me = await client.users.findMyUser();
		const cookie = [`uid=${me.data.id}`, `token_type=${token.token_type}`, `access_token=${token.access_token}`, "Secure=true", "HttpOnly=true"];
		const path = api.getRoot();
		if (path.length > 0)
			cookie.push(`Path=${path}`);
		console.debug(token);
		if (token.token_type === "bearer")
			bearerToken = new Twitter.OAuth2Bearer(token.access_token);
		response.setHeader('Set-Cookie', cookie);
		response.redirect(`/?login=${me.data.username}`);
	} catch (e) { console.error(e); }
});

api.get("/revoke", async (reqeust, response) => {
	try {
		response.json({ revoked: await authClient.revokeAccessToken() });
	} catch (e) { console.error(e); }
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
		if ("next" in request.query)
			params.pagination_token = request.query.next;
		response.json(await client.lists.listUserOwnedLists(uid, params));
	} catch (e) { console.error(e); }
});

api.post("/lists/create", async (reqeust, response) => {
	try {
		const q = reqeust.query;
		const params = { name: q.name };
		if ("discription" in q) params.discription = q.discription;
		if ("private" in q) params.private = q.private;
		const r = await client.lists.listIdCreate(params);
		console.debug(r);
		response.json(await client.lists.listIdGet(r.data.id, {
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
	} catch (e) { console.error(e) }
});

api.put("/lists/:id", async (reqeust, response) => {
	try {
		const q = reqeust.query;
		const params = { name: q.name };
		if ("name" in q) params.name = q.name;
		if ("discription" in q) params.discription = q.discription;
		if ("private" in q) params.private = q.private;
		response.json(await client.lists.listIdUpdate(q.id, params));
	} catch (e) { console.error(e) }
});

api.delete("/lists/:id", async (reqeust, response) => {
	try {
		response.json(await client.lists.listIdDelete(reqeust.query.id));
	} catch (e) { console.error(e) }
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
		if ("next" in request.query)
			params.pagination_token = request.query.next;
		response.json(await client.users.listGetMembers(request.query.id, params));
	} catch (e) { console.error(e); }
});

api.post("/list/:id", async (request, response) => {
	try {
		response.json(await client.lists.listAddMember(request.query.id, request.query.member_id));
	} catch (e) { console.error(e); }
});

api.delete("/list/:id", async (request, response) => {
	try {
		response.json(await client.lists.listRemoveMember(request.query.id, request.query.member_id));
	} catch (e) { console.error(e); }
});

///////////////////////////////////////////////////////////////////////////////

api.setRoot("/api");
api.listen(port);
