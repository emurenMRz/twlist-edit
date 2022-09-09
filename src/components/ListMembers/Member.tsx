import './Member.scss';

export type Props = {
	id: string;
	name: string;
	username: string;
	profile_image_url: string;
	verified: boolean;
	protected: boolean;
}

export default function Member(props: { member: Props, onUserSign: Function }) {
	const u = props.member;

	return (
		<div className="member-frame" onClick={() => props.onUserSign(`@${u.username}`)}>
			<img className="icon" src={u.profile_image_url} alt={u.profile_image_url} />
			<div className="detail">
				<div className="screen_name">{u.username}{u.protected ? "🔒" : ""}{u.verified ? <img style={{ width: "1em" }} src="./images/verified.svg" alt="a" /> : <></>}</div>
				<div className="name">{u.name}</div>
			</div>
		</div>
	);
}

