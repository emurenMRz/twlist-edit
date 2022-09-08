export function stringFromCodePoint(codeNum: number) {
	const cp = codeNum - 0x10000;
	const high = 0xD800 | (cp >> 10);
	const low = 0xDC00 | (cp & 0x3FF);
	return String.fromCharCode(high, low);
}

export function localizeDate(date: string) {
	const obj = new Date(Date.parse(date));
	const yy = obj.getFullYear();
	const mm = obj.getMonth() + 1;
	const dd = obj.getDate();
	const h = obj.getHours();
	const m = obj.getMinutes();
	const s = obj.getSeconds();
	const p = (v: number) => ("" + v).padStart(2, "0");
	return `${yy}/${p(mm)}/${p(dd)} ${p(h)}:${p(m)}:${p(s)}`;
}

/**
 * 
 */

type URLEntitiesProps = {
	start: number;
	end: number;
	expanded_url: string;
	display_url: string;
}

type UserMentionsProps = {
	start: number;
	end: number;
	username: string;
}

type HashTagsProps = {
	start: number;
	end: number;
	text: string;
}

type MediaProps = {
	start: number;
	end: number;
	media_url_https: string;
};

type EntityProps = {
	start: number;
	end: number;
	body: string;
}

export function applyEntities(extended_entities: any, entities: any, text: string) {
	if (!entities)
		return text.replace(/\n/g, "<br>");

	const ent: Array<EntityProps> = [];

	for (const key in entities) {
		let done = null;
		switch (key) {
			case 'urls':
				done = (v: URLEntitiesProps) => ent.push({
					start: v.start,
					end: v.end,
					body: `<a href="${v.expanded_url}" target="_blank">${v.display_url}</a>`
				});
				break;

			case 'user_mentions':
				done = (v: UserMentionsProps) => ent.push({
					start: v.start,
					end: v.end,
					body: `<span class="RT_for">@${v.username}</span>`
				});
				break;

			case 'hashtags':
				done = (v: HashTagsProps) => ent.push({
					start: v.start,
					end: v.end,
					body: `<span class="tag">#${v.text}</span>`
				});
				break;

			case 'media':
				done = (v: MediaProps) => {
					let html = '';
					if (extended_entities && extended_entities[key]) {
						extended_entities[key].forEach((w: any) => {
							let url = w.type == 'photo' ? `${w.media_url_https}:orig` : w.url;
							if ((w.type == 'video' || w.type == 'animated_gif') && w.video_info && w.video_info.variants) {
								let bitrate = -1;
								for (let v of w.video_info.variants)
									if (v.url && v.content_type == 'video/mp4' && v.bitrate > bitrate) {
										url = v.url;
										bitrate = v.bitrate;
									}
							}
							html += `<a class="image_board" href="${url}" target="_blank"><img src="${w.media_url_https}:small")></div>`;
						})
					}
					else
						html = `<a class="image_board" href="${v.media_url_https}:orig" target="_blank"><img src="${v.media_url_https}:small")></div>`;
					ent.push({
						start: v.start,
						end: v.end,
						body: `<br>${html}`
					});
				}
				break;
		}

		if (done)
			entities[key].forEach(done);
	}

	ent.sort((a: any, b: any) => b.start - a.start);
	for (let i = 1; i < ent.length;)
		if (ent[i - 1].start == ent[i].start) {
			ent[i - 1].body += ent[i].body;
			ent.splice(i, 1);
		} else
			++i

	ent.forEach((v: any) => {
		const part = v.body;
		let start = v.start, end = v.end;
		let offset = 0;
		let delta = start < end ? end - start : start - end;

		for (; offset < text.length; ++offset) {
			if (!start)
				break;
			const ch = text.charCodeAt(offset);
			if (ch >= 0xd800 && ch < 0xdc00)
				++offset;
			--start;
		}
		start = offset;

		for (; offset < text.length; ++offset) {
			if (!delta)
				break;
			const ch = text.charCodeAt(offset);
			if (ch >= 0xd800 && ch < 0xdc00)
				++offset;
			--delta;
		}
		end = offset;

		const left = text.substring(0, start);
		const right = text.substring(end);
		text = left + part + right;
	});

	return text.replace(/\n/g, "<br>");
}
