const api = require("./api-server");
const sessionDb = require("./session-db");

const PORT = process.env.PORT || 3000;
const sdb = new sessionDb.SessionDB();

function responseException(res, e) {
	console.dir(e, { depth: null });

	let result = e.message;
	if (!result) result = `${e.status} ${e.statusText}`;
	res.json({ error: result });
}

api.get("/login", async (req, res) => {
	try {
		const [sid, auth] = sdb.generate();
		res.redirect(auth.generateAuthURL({
			state: sid,
			code_challenge_method: "s256",
		}));
	} catch (e) { responseException(res, e); }
});

api.get("/callback", async (req, res) => {
	try {
		const { code, state: sid } = req.query;
		if (!sdb.has(sid)) {
			res.writeHeader(500, { "Content-Type": "text/plain; charset=utf-8" });
			res.end("Calls from different services.");
			return;
		}
		const auth = sdb.getAuth(sid);
		const { token: { token_type, access_token } } = await auth.requestAccessToken(code);
		const client = sdb.makeClient(auth);
		const { data: { id, username } } = await client.users.findMyUser();
		res.setHeader('Set-Cookie', [
			`sid=${sid}; Path=/; SameSite=Lax; secure; httponly`,
			`uid=${id}; Path=/; SameSite=Lax; secure; httponly`,
			`token_type=${token_type}; Path=/; SameSite=Lax; secure; httponly`,
			`access_token=${access_token}; Path=/; SameSite=Lax; secure; httponly`
		]);
		res.redirect(`/?login=${username}`);
	} catch (e) { responseException(res, e); }
});

api.get("/revoke", async (req, res) => {
	try {
		const sid = req.searchCookieValue("sid");
		const auth = sdb.getAuth(sid);
		res.json({ revoked: await auth.revokeAccessToken() });
	} catch (e) { responseException(res, e); }
});

//
// Manage lists
//

api.get("/lists", async (req, res) => {
	try {
		const uid = req.searchCookieValue("uid");
		const params = {
			"list.fields": [
				"created_at",
				"follower_count",
				"member_count",
				"private",
				"description"
			],
		};
		const { next } = req.query;
		if (next)
			params.pagination_token = next;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.listUserOwnedLists(uid, params));
	} catch (e) { responseException(res, e); }
});

api.post("/lists/create", async (req, res) => {
	try {
		const { name, description, private } = req.query;
		if (!name || name.length === 0) throw new TypeError("'Name' is required.");
		const params = {};
		if (name) params.name = name;
		if (description) params.description = description;
		if (private) params.private = private;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		const { data: { id } } = await client.lists.listIdCreate(params);
		res.json(await client.lists.listIdGet(id, {
			"list.fields": [
				"created_at",
				"follower_count",
				"member_count",
				"private",
				"description"
			],
		}));
	} catch (e) { responseException(res, e); }
});

api.get("/lists/:id", async (req, res) => {
	try {
		const { id } = req.query;
		res.json(await client.lists.listIdGet(id, {
			"list.fields": [
				"created_at",
				"follower_count",
				"member_count",
				"private",
				"description"
			],
		}));
	} catch (e) { responseException(res, e); }
});

api.put("/lists/:id", async (req, res) => {
	try {
		const { id, name, description, private } = req.query;
		const params = {};
		if (name) params.name = name;
		if (description) params.description = description;
		if (private) params.private = private;
		if (Object.keys(params).length === 0) throw new TypeError("request parameter is empty.");
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.listIdUpdate(id, params));
	} catch (e) { responseException(res, e); }
});

api.delete("/lists/:id", async (req, res) => {
	try {
		const { id } = req.query;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.listIdDelete(id));
	} catch (e) { responseException(res, e); }
});

//
// List members
//

api.get("/list/:id", async (req, res) => {
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
		const { id, next } = req.query;
		if (next)
			params.pagination_token = next;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.users.listGetMembers(id, params));
	} catch (e) { responseException(res, e); }
});

api.post("/list/:id", async (req, res) => {
	try {
		const { id, user_id } = req.query;
		if (!user_id) throw new TypeError("'member_id' is required.");
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.listAddMember(id, { user_id }));
	} catch (e) { responseException(res, e); }
});

api.delete("/list/:id/members/:user_id", async (req, res) => {
	try {
		const { id, user_id } = req.query;
		if (!user_id) throw new TypeError("'member_id' is required.");
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.listRemoveMember(id, user_id));
	} catch (e) { responseException(res, e); }
});

//
// Users
//

api.get("/user/:id", async (req, res) => {
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
		const { id } = req.query;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.users.findUserById(id, params));
	} catch (e) { responseException(res, e); }
});

api.get("/userby/:name", async (req, res) => {
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
		const { name } = req.query;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.users.findUserByUsername(name, params));
	} catch (e) { responseException(res, e); }
});

api.get("/user/:id/list_memberships", async (req, res) => {
	try {
		const params = {
			expansions: ["owner_id"],
			"list.fields": ["private"],
		};
		const { id, next } = req.query;
		if (next)
			params.pagination_token = next;
		const client = sdb.makeClient(req.searchCookieValue("sid"));
		res.json(await client.lists.getUserListMemberships(id, params));
	} catch (e) { responseException(res, e); }
});

///////////////////////////////////////////////////////////////////////////////

api.setRoot("/api");
api.listen(PORT);
