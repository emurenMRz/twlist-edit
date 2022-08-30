declare type APIParams = { [key: string]: string | number | boolean }

declare type APIResult = {
	error?: string;
	data?: any;
	meta?: any;
}

declare function GET(api: string): Promise<APIResult>;
declare function POST(api: string, body: string | APIParams): Promise<APIResult>;
declare function PUT(api: string, body: string | APIParams): Promise<APIResult>;
declare function PATCH(api: string, body: string | APIParams): Promise<APIResult>;
declare function DELETE(api: string): Promise<APIResult>;
