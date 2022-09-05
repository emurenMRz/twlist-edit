import React from 'react';
import Header from "./Header";
import OwnershipList from './OwnershipList';
import ListMembers, { Props as ListInfo } from './ListMembers';
import Message from "./Message";
import './MainScreen.scss';

type Props = {
	name: string | null;
}

export default function MainScreen(props: Props) {
	const [message, setMessage] = React.useState("");
	const [listInfo, setListInfo] = React.useState({} as ListInfo);
	const [reset, setReset] = React.useState(0);

	const handleSearch = (phrase: string | undefined) => {
	};

	const handleReset = () => {
		setListInfo({} as ListInfo);
		setReset(reset + 1);
	};

	return (<>
		<Header name={props.name} handleSearch={handleSearch} />
		<div className="workspace">
			<OwnershipList reset={reset} username={props.name!} setListInfo={setListInfo} setMessage={setMessage} />
			<ListMembers id={listInfo.id} name={listInfo.name} count={listInfo.count} onReset={handleReset} setMessage={setMessage} />
		</div>
		<Message message={message} setMessage={setMessage} />
	</>);
}
