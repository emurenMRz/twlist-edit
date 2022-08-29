const http = require("http");

class API {
	#api = [];

	add(endPoint, handler) {
		if (endPoint.indexOf("/:"))
			endPoint = new RegExp(`^${endPoint.replace(/\/:([^/]+)/g, "/(?<$1>[^/]+)")}`);
		this.#api.push({ endPoint, handler });
	}

	call(endPoint, request, response) {
		for (const api of this.#api)
			if (api.endPoint instanceof RegExp) {
				const m = api.endPoint.exec(endPoint);
				if (m) {
					Object.assign(request.query, m.groups);
					api.handler(request, response);
					return true;
				}
			} else if (api.endPoint === endPoint)
				api.handler(request, response);
		return false;
	}
}

const getMethod = new API();
exports.get = (endPoint, handle) => getMethod.add(endPoint, handle);

const postMethod = new API();
exports.post = (endPoint, handle) => postMethod.add(endPoint, handle);

const putMethod = new API();
exports.put = (endPoint, handle) => putMethod.add(endPoint, handle);

const patchMethod = new API();
exports.patch = (endPoint, handle) => patchMethod.add(endPoint, handle);

const deleteMethod = new API();
exports.delete = (endPoint, handle) => deleteMethod.add(endPoint, handle);

const parseQueryString = (s) => Object.fromEntries(s.split("&").map(v => v.split("=").map(w => decodeURIComponent(w))));

const getRequestBody = async (request) => {
	const body = [];
	for await (const chunk of request)
		body.push(chunk);
	return Buffer.concat(body).toString();
};

const parseEntity = async (request) => {
	const body = await getRequestBody(request);
	const { "content-type": contentType } = request.headers;
	if (contentType) {
		if (contentType.indexOf("application/x-www-form-urlencoded") != -1)
			return parseQueryString(body);
		else if (contentType.indexOf("application/json") != -1)
			return JSON.parse(body);
	}
	return { body };
};

let rootPath = "";
exports.getRoot = () => rootPath;
exports.setRoot = (absolutePath) => {
	if (!absolutePath || absolutePath[0] !== "/")
		throw new Error("setRootPath: A '/' is required before path.");
	if (absolutePath.at(-1) === "/")
		absolutePath = absolutePath.substring(0, absolutePath.length - 1);
	console.info(`set root: ${absolutePath}`);
	rootPath = absolutePath;
}

exports.listen = function (port) {
	http.createServer(async function (request, response) {
		try {
			let endPoint = request.url.startsWith(rootPath) ? request.url.substring(rootPath.length) : request.url;
			let result = false;

			request.query = {};
			request.searchCookieValue = function (name) {
				const r = new RegExp(`${name}=(?<${name}>[^;]+)`);
				const m = this.headers.cookie.match(r);
				return m === null ? null : m.groups[name].trim();
			}
			response.redirect = function (path) {
				this.writeHeader(302, { "Location": path });
				this.end();
			};
			response.json = function (data) {
				this.writeHeader(200, { "Content-Type": "application/json; charset=utf-8" });
				this.end(JSON.stringify(data));
			};

			const paramIndex = endPoint.indexOf("?");
			if (paramIndex >= 0) {
				Object.assign(request.query, parseQueryString(endPoint.substring(paramIndex + 1)));
				endPoint = endPoint.substring(0, paramIndex);
			}

			if (request.method === "GET")
				result = getMethod.call(endPoint, request, response);
			else {
				let method = null;
				if (request.method === "POST") method = postMethod;
				else if (request.method === "PUT") method = putMethod;
				else if (request.method === "PATCH") method = patchMethod;
				else if (request.method === "DELETE") method = deleteMethod;

				Object.assign(request.query, await parseEntity(request));

				result = method.call(endPoint, request, response);
			}

			if (!result)
				throw new TypeError(`Not found API: ${request.method} ${endPoint}`);
		} catch (e) {
			response.writeHeader(400, { "Content-Type": "application/json; charset=utf-8" });
			response.end(JSON.stringify({ error: e.toString() }));
		}
	}).listen(port, () => console.info(`listening on ${port}`));
};
