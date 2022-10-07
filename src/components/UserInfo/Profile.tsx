import React from "react";
import { stringFromCodePoint, localizeDate, applyEntities } from "./utility";
import "./Profile.scss";

type Props = {
	tweet: any;
	onAddMember: Function;
	onRemoveMember: Function;
}

export default function Profile(props: Props) {
	const tw = props.tweet;
	const refUri = React.createRef<HTMLDivElement>();
	const refDesc = React.createRef<HTMLDivElement>();

	const applyEntitiesForProfile = (profile: any, id: string) => applyEntities(null, profile.entities[id], profile[id]);

	React.useEffect(() => {
		if (!refUri || !refUri.current) return;
		if (!tw || !tw.url || !tw.entities) return;
		refUri.current.innerHTML = `🔗${applyEntitiesForProfile(tw, "url")}`;
	}, [tw]);

	React.useEffect(() => {
		if (!refDesc || !refDesc.current) return;
		if (!tw || !tw.entities) return;
		refDesc.current.innerHTML = applyEntitiesForProfile(tw, "description");
	}, [tw]);

	if (!tw) return null;

	let mark = "";
	if (tw.protected) mark += stringFromCodePoint(0x1F512);
	if (tw.following) mark += stringFromCodePoint(0x1F517);
	if (tw.verified) mark += stringFromCodePoint(0x1F4AE);

	const profileUrl = `https://twitter.com/intent/user?user_id=${tw.id}`;

	return (
		<div className="profile">
			<div className="basic-data">
				<img className="icon" src={tw.profile_image_url} />
				<div className="name">
					<div className="username"><a href={profileUrl} target="_blank" rel="noreferrer">{`@${tw.username}`}</a></div>
					<div className="owner">{tw.name}{mark}</div>
				</div>
			</div>
			<div className="additional-data">
				<div className="follow">
					<div>{tw.public_metrics.following_count} following</div>
					<div>{tw.public_metrics.followers_count} followers</div>
					<div>list: {tw.public_metrics.listed_count}</div>
					<div>tweet: {tw.public_metrics.tweet_count}</div>
				</div>

				<div ref={refUri} className="uri"></div>
				<div ref={refDesc} className="description"></div>

				<div className="location-and-create_at">
					<div className="location">🌎{tw.location}</div>
					<div className="craete_at">📅{localizeDate(tw.created_at)}</div>
				</div>
			</div>
			<div className="command">
				<a href={profileUrl} target="_blank" rel="noreferrer"><button>Open with Twitter</button></a>
				<button onClick={() => props.onAddMember(tw.id)}>Add to List</button>
				<button onClick={() => props.onRemoveMember(tw.id)}>Remove from List</button>
			</div>
		</div>
	);
}
