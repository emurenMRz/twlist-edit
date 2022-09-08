import React from "react";
import { stringFromCodePoint, localizeDate, applyEntities } from "./utility";

type Props = {
	tweet: any;
}

export default function Profile(props: Props) {
	const tw = props.tweet;
	const refUri = React.createRef<HTMLDivElement>();
	const refDesc = React.createRef<HTMLDivElement>();

	const applyEntitiesForProfile = (profile: any, id: string) => applyEntities(null, profile.entities[id], profile[id]);

	if (!tw) return null;

	React.useEffect(() => {
		if (!refUri || !refUri.current) return;
		if (tw.url && tw.entities)
			refUri.current.innerHTML = `🔗${applyEntitiesForProfile(tw, "url")}`;
	});

	React.useEffect(() => {
		if (!refDesc || !refDesc.current) return;
		if (tw.entities)
			refDesc.current.innerHTML = applyEntitiesForProfile(tw, "description");
	});

	let mark = "";
	if (tw.protected) mark += stringFromCodePoint(0x1F512);
	if (tw.following) mark += stringFromCodePoint(0x1F517);
	if (tw.verified) mark += stringFromCodePoint(0x1F4AE);

	return (
		<div className="profile">
			<div className="profile-data">
				<div className="icon-area"><img className="user_icon" src={tw.profile_image_url} /></div>
				<div className="data-area">
					<div className="name">
						<div className="owner">{tw.name}{mark}</div>
						<div className="username"><a href={`https://twitter.com/intent/user?user_id=${tw.id}`} target="_blank" rel="noreferrer">{`@${tw.username}`}</a></div>
					</div>
					<div className="date">📅{localizeDate(tw.created_at)}</div>
					<div className="detail">
						<div>{tw.public_metrics.following_count} following</div>
						<div>{tw.public_metrics.followers_count} followers</div>
						<div>list: {tw.public_metrics.listed_count}</div>
						<div>tweet: {tw.public_metrics.tweet_count}</div>
						<div>🌎{tw.location}</div>
						<div ref={refUri}></div>
						<div ref={refDesc}></div>
					</div>
				</div>
			</div>
		</div>
	);
}
