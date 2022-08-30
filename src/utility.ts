export { }

const checkAPI = async (r: Response): Promise<APIResult> => {
	if (!r.ok) throw new Error(`Failed API request: ${r.url}[${r.status}]`);
	const json = await r.json();
	if ("error" in json) throw new Error(`API[${r.url}]: ${JSON.stringify(json.error)}`);
	return json;
}

const do_api = (api: string, method: string, body?: string | APIParams) => {
	const params = { method } as any;
	if (body !== undefined) {
		if (typeof body === "string") {
			params["headers"] = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" };
			params["body"] = body;
		} else {
			params["headers"] = { "Content-Type": "application/json; charset=UTF-8" };
			params["body"] = JSON.stringify(body);
		}
	}
	return fetch(`api/${api}`, params).then(checkAPI);
}

function GET(api: string) { return do_api(api, "GET"); }
function POST(api: string, body: string | APIParams) { return do_api(api, "POST", body); }
function PUT(api: string, body: string | APIParams) { return do_api(api, "PUT", body); }
function PATCH(api: string, body: string | APIParams) { return do_api(api, "PATCH", body); }
function DELETE(api: string) { return do_api(api, "DELETE"); }

(window as any).GET = GET;
(window as any).POST = POST;
(window as any).PUT = PUT;
(window as any).PATCH = PATCH;
(window as any).DELETE = DELETE;
