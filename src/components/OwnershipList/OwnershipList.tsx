import React from 'react';
import List, { Props as ListProps } from './List';
import { OwnershipList } from '../MainScreen';
import Confirm, { Mode } from './Confirm';
import './OwnershipList.scss';

type Props = {
	username: string;
	ownershipList: OwnershipList;
	setOwnershipList: Function;
	setListInfo: Function;
	setMessage: Function;
}

export default function OwnershipList(props: Props) {
	const refLoader = React.createRef<HTMLDivElement>();
	const [selectedListID, setSelectedListID] = React.useState<string | null>(null);
	const [confirmMode, displayConfirm] = React.useState<Mode>(Mode.Close);

	React.useEffect(() => {
		if (refLoader.current === null) return;
		const observer = new IntersectionObserver((entries: any) => {
			entries.forEach((entry: any) => {
				if (!entry.intersectionRatio) return;
				const t = entry.target;
				GET(`lists?next=${t.dataset.nextToken}`)
					.then(json => {
						if (props.ownershipList.nextToken === null) return;
						const { data, meta: { result_count: resultCount, next_token: nextToken } } = json;
						const ol = { ...props.ownershipList };
						if (resultCount > 0)
							ol.lists.concat(data);
						ol.nextToken = nextToken === undefined ? null : nextToken;
						props.setOwnershipList(ol);
					})
					.catch(alert);
				observer.unobserve(entry.target);
			});
		});
		observer.observe(refLoader.current);
	}, [refLoader]);

	const handleOpenList = (id: string, name: string, count: number) => {
		setSelectedListID(id);
		props.setListInfo({ id, name, count });
	}

	const handleUpdateList = (id: string, action: { updated: boolean, deleted: boolean, name: string, description: string, private: boolean }) => {
		if ("updated" in action) {
			const ol = { ...props.ownershipList };
			const target = ol.lists.find(v => v.id === id);
			if (!target) throw new Error(`Not found id: [${id}] ${action.name}`);
			target.description = action.description;
			target.private = action.private;
			props.setOwnershipList(ol);
			setSelectedListID(id);
			props.setListInfo({ id, name: action.name, count: target.member_count });
		} else if ("deleted" in action) {
			const ol = { ...props.ownershipList };
			ol.lists = ol.lists.filter(v => v.id !== id);
			props.setOwnershipList(ol);
			setSelectedListID(null);
			props.setListInfo({});
		}
	}

	const handleCreate = function (e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		const parent = (e.target as HTMLButtonElement).parentElement?.parentElement;
		if (!parent) throw new TypeError("Not found parent element.");
		const input = parent.querySelectorAll("input");
		if (input.length !== 3) throw new TypeError("Need three input element.");

		const params = {
			name: input[0].value,
			private: input[2].checked
		} as any;

		if (params.name.length === 0) {
			alert("'Name' is required.");
			return;
		}

		const description = input[1].value;
		if (description.length > 0) params["description"] = description;
		POST("lists/create", params)
			.then(json => {
				if ("data" in json) {
					const ol = { ...props.ownershipList };
					ol.lists.concat(json.data);
					props.setOwnershipList(ol);
				}
			})
			.catch(alert);
		displayConfirm(Mode.Close);
	}

	const handleCancel = function (e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		displayConfirm(Mode.Close);
	}

	return (
		<div className='lists-box'>
			<div className="lists">
				{props.ownershipList.lists.map((l: ListProps) => <List key={l.id} list={l} onOpenList={handleOpenList} onUpdateList={handleUpdateList} selectedListID={selectedListID} />)}
				{props.ownershipList.nextToken !== null ? <div ref={refLoader} className="loader" data-next-token={props.ownershipList.nextToken}>Loading ...</div> : null}
				<div className='list' onClick={() => displayConfirm(Mode.Create)}>
					<div className="list-line">
						<div className="cell add"><img src="./images/add.svg" alt="Add" /></div>
					</div>
				</div>
			</div>
			<Confirm mode={confirmMode} onClick={handleCreate} onCancel={handleCancel} />
		</div>
	);
}
