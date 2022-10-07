import React from 'react';
import Header from "./Header";
import OwnershipList, { ListImport, Props as ListProps } from './OwnershipList';
import ListMembers, { Props as ListInfo } from './ListMembers';
import UserInfo from './UserInfo';
import Message from "./Message";
import './MainScreen.scss';

export type OwnershipList = {
	lists: ListProps[];
	nextToken: string | null | undefined;
}

type Props = {
	name: string | null;
}

export default function MainScreen(props: Props) {
	const [ownershipList, setOwnershipList] = React.useState<OwnershipList>({ lists: [], nextToken: undefined });
	const [message, setMessage] = React.useState("");
	const [listInfo, setListInfo] = React.useState({} as ListInfo);
	const [userSign, setUserSign] = React.useState<string | undefined>("");

	const handleSearch = (target: string | undefined) => { setUserSign(target) };
	const handleUpdateListData = (id: string) => {
		GET(`lists/${id}`)
			.then(json => {
				const list = ownershipList.lists.find(v => v.id === id);
				if (!list) return;
				const { data } = json;
				if (!data) return;
				Object.assign(list, data);
				listInfo.count = list.member_count;
			})
			.catch(alert);
	};
	const handleAddMember = (userId: string) => {
		const { id: listId } = listInfo;
		if (!listId) return;
		POST(`list/${listId}`, { user_id: userId })
			.then(json => {
				const { data: { is_member } } = json;
				if (!is_member)
					throw new Error("Failed to add member to list.");
				const li = { ...listInfo };
				++li.count;
				setListInfo(li);
			})
			.catch(alert);
	};
	const handleRemoveMember = (userId: string) => {
		const { id: listId } = listInfo;
		if (!listId) return;
		DELETE(`list/${listId}/members/${userId}`)
			.then(json => {
				const { data: { is_member } } = json;
				if (is_member)
					throw new Error("Failed to remove a member from the list.");
				const li = { ...listInfo };
				--li.count;
				setListInfo(li);
			})
			.catch(alert);
	};
	if (props.name === null || ownershipList.nextToken === undefined)
		return <ListImport setOwnershipList={setOwnershipList} />;

	return (<>
		<Header name={props.name} numberOfLists={ownershipList.lists.length} handleSearch={handleSearch} />
		<div className="workspace">
			<OwnershipList username={props.name!} ownershipList={ownershipList} setOwnershipList={setOwnershipList} setListInfo={setListInfo} setMessage={setMessage} />
			<ListMembers id={listInfo.id} name={listInfo.name} count={listInfo.count} onUpdateListData={handleUpdateListData} onUserSign={setUserSign} setMessage={setMessage} />
			<UserInfo user={userSign} onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} />
		</div>
		<Message message={message} setMessage={setMessage} />
	</>);
}
