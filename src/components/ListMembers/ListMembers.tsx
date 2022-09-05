import React from 'react';
import Member, { Props as MemberProps } from './Member';
import './ListMembers.scss';

export type Props = {
	id: string;
	name: string;
	count: number;
	setListInfo: Function;
	setMessage: Function;
}

export default function ListMembers(props: Props) {
	const beginImport = () => document.getElementsByName("file")[0].click();
	const abortImport = () => { };
	const refLoader = React.createRef<HTMLDivElement>();
	const [members, setMembers] = React.useState([] as MemberProps[]);
	const [nextToken, setNextToken] = React.useState<string | null>(null);
	const [importState, setImportState] = React.useState<{ text: string, onClick: React.MouseEventHandler<HTMLButtonElement> }>({ text: "Import", onClick: beginImport });

	React.useEffect(() => {
		if (props.id === undefined || props.id.length === 0) return;
		setMembers([]);
		setNextToken(null);
		GET(`list/${props.id}`)
			.then(json => {
				if (json.error)
					props.setMessage([json.error]);
				if (json.meta.result_count > 0)
					setMembers(json.data);
				setNextToken("next_token" in json.meta ? json.meta.next_token : null);
			})
			.catch(alert);
	}, [props.id]);

	React.useEffect(() => {
		if (props.id === undefined || props.id.length === 0) return;
		if (refLoader.current === null) return;
		const observer = new IntersectionObserver((entries: any) => {
			entries.forEach((entry: any) => {
				if (!entry.intersectionRatio) return;
				const t = entry.target;
				GET(`list/${props.id}?next=${t.dataset.nextToken}`)
					.then(json => {
						if (nextToken === null) return;
						if (json.error)
							props.setMessage([json.error]);
						if (json.meta.result_count > 0)
							setMembers(members.concat(json.data));
						setNextToken("next_token" in json.meta ? json.meta.next_token : null);
					})
					.catch(alert);
				observer.unobserve(entry.target);
			});
		});
		observer.observe(refLoader.current);
	}, [refLoader]);

	if (props.name === undefined)
		return <></>;

	const handleImport = function (e: React.ChangeEvent<HTMLInputElement>) {
		const files = (e.target as HTMLInputElement).files;
		if (files === null) return;
		const reader = new FileReader();
		reader.onload = async e => {
			const text = e.target?.result;
			if (typeof text !== "string") return;
			const users = (JSON.parse(text) as MemberProps[]).filter(u => !members.some(m => m.id === u.id));
			let importedUsers = 0;

			try {
				for (const user of users) {
					const json = await POST(`list/${props.id}`, { user_id: user.id })
					if (!json.data.is_member)
						alert(`Failed add member: ${user.id}`);
					else
						setMembers(members.concat(user));
					setImportState({ text: `Importing... [${importedUsers}/${users.length}]`, onClick: abortImport });
				}
				setImportState({ text: "Import", onClick: beginImport });
			} catch (e) {
				alert(e);
				setImportState({ text: "Aborted", onClick: abortImport });
			}
		};
		reader.readAsText(files[0]);
	}

	const handleExport = function (e: React.MouseEvent<HTMLButtonElement>) {
		if (members.length !== props.count)
			alert(`読込済の ${members.length}/${props.count} 件をエクスポートします`);
		const blob = new Blob([JSON.stringify(members)], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		document.body.appendChild(a);
		a.download = `${props.name}.json`;
		a.href = url;
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	return (
		<div className='members-box'>
			<div className="members-header">
				{props.name}
				<div className="members-action">
					<label><input type="file" style={{ display: "none" }} name="file" onChange={handleImport} /><button onClick={importState.onClick}>{importState.text}</button></label>
					<label><button onClick={handleExport}>Export [{members.length}/{props.count}]</button></label>
				</div>
			</div>
			<div className="members">
				{members.length === 0 ? "メンバーがいません" : members.map((m: MemberProps) => <Member key={m.id} member={m} />)}
				{nextToken !== null ? <div ref={refLoader} className="loader" data-next-token={nextToken}>Loading ...</div> : <></>}
			</div>
		</div >
	);
}
