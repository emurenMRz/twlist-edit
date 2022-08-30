import '../utility';
import React from 'react';
import List, { Props as ListProps } from './List';
import Confirm, { Mode } from '../Confirm';
import './OwnershipList.scss';

type Props = {
	username: string;
	setListInfo: Function;
	setMessage: Function;
}

export default function OwnershipList(props: Props) {
	const refLoader = React.createRef<HTMLDivElement>();
	const [lists, setLists] = React.useState([] as ListProps[]);
	const [nextToken, setNextToken] = React.useState<string | null>(null);
	const [selectedListID, setSelectedListID] = React.useState<string | null>(null);
	const [confirmMode, displayConfirm] = React.useState<Mode>(Mode.Close);

	React.useEffect(() => {
		setLists([]);
		setNextToken(null);
		setSelectedListID(null);
		GET("lists")
			.then(json => {
				if (json.error)
					props.setMessage([json.error]);
				if (json.meta.result_count > 0)
					setLists(json.data);
				setNextToken("next_token" in json.meta ? json.meta.next_token : null);
			})
			.catch(alert);
	}, [props.username]);

	React.useEffect(() => {
		if (refLoader.current === null) return;
		const observer = new IntersectionObserver((entries: any) => {
			entries.forEach((entry: any) => {
				if (!entry.intersectionRatio) return;
				const t = entry.target;
				GET(`lists?next=${t.dataset.nextToken}`)
					.then(json => {
						if (nextToken === null) return;
						if (json.error)
							props.setMessage([json.error]);
						if (json.meta.result_count > 0)
							setLists(lists.concat(json.data));
						setNextToken("next_token" in json.meta ? json.meta.next_token : null);
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
			const newLists = [...lists];
			const target = newLists.find(v => v.id === id);
			if (!target) throw new Error(`Not found id: [${id}] ${action.name}`);
			target.description = action.description;
			target.private = action.private;
			setLists(newLists);
			setSelectedListID(id);
			props.setListInfo({ id, name: action.name, count: target.member_count });
		} else if ("deleted" in action) {
			setLists(lists.filter(v => v.id !== id));
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
				if ("error" in json)
					console.error(JSON.stringify(json));
				if ("data" in json)
					setLists([...lists, json.data]);
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
				{lists.map((l: ListProps) => <List key={l.id} list={l} onOpenList={handleOpenList} onUpdateList={handleUpdateList} selectedListID={selectedListID} />)}
				{nextToken !== null ? <div ref={refLoader} className="loader" data-next-token={nextToken}>Loading ...</div> : <></>}
				{
					<div className='list' onClick={() => displayConfirm(Mode.Create)}>
						<div className="list-line">
							<div className="cell add"><img src="./images/add.svg" alt="Add" /></div>
						</div>
					</div>
				}
			</div>
			<Confirm mode={confirmMode} onClick={handleCreate} onCancel={handleCancel} />
		</div>
	);
}
