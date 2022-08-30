import './Member.scss';

function MemberDetail(props: {}) {
	return (<></>);
}

export type Props = {
	id: string;
	name: string;
	username: string;
	profile_image_url: string;
	verified: boolean;
	protected: boolean;
}

export default function Member(props: { member: Props }) {
	const u = props.member;

	return (
		<a href={`https://twitter.com/${u.username}`} target="_blank" rel="noreferrer">
			<div className="member-frame">
				<img className="icon" src={u.profile_image_url} alt={u.profile_image_url} />
				<div className="detail">
					<div className="screen_name">{u.username}{u.protected ? "🔒" : ""}{u.verified ? <img style={{ width: "1em" }} src="./images/verified.svg" alt="a" /> : <></>}</div>
					<div className="name">{u.name}</div>
				</div>
			</div>
		</a>
	);
}

