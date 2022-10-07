import React from 'react';
import Profile from "./Profile";
import "./UserInfo.scss";

const Tweet = {
	buildProfile: (o: any): HTMLElement => { return document.createElement("div"); },
	buildStatus: (o: any): HTMLElement => { return document.createElement("div"); }
};

type Props = {
	user: string | undefined;
	onAddMember: Function;
	onRemoveMember: Function;
}

export default function UserInfo(props: Props) {
	const [tweet, setTweet] = React.useState<any>(null);
	const user = props.user;

	React.useEffect(() => {
		if (user === undefined || user.length === 0) return;
		(user[0] !== '@' ? GET(`user/${user}`) : GET(`userby/${user.substring(1)}`))
			.then(json => {
				if ("data" in json)
					setTweet(json.data);
			})
			.catch(alert);
	}, [user]);

	if (user === undefined || user.length === 0)
		return null;

	return (
		<div className="userinfo">
			<Profile tweet={tweet} onAddMember={props.onAddMember} onRemoveMember={props.onRemoveMember} />
		</div>
	);
}
