import React from 'react';
import Confirm, { Mode } from '../Confirm';
import './list.scss';

export type Props = {
	id: string;
	name: string;
	created_at: string;
	private: boolean,
	follower_count: number;
	member_count: number;
	description: string;
}

export default function List(props: { list: Props, onOpenList: Function, onUpdateList: Function, selectedListID: string | null }) {
	const [confirmMode, displayConfirm] = React.useState<Mode>(Mode.Close);

	const createAt = new Date(Date.parse(props.list.created_at));

	const handleClick = () => props.onOpenList(props.list.id, props.list.name, props.list.member_count);

	const handleEdit = function (e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();

		const parent = (e.target as HTMLButtonElement).parentElement?.parentElement;
		if (!parent) throw new TypeError("Not found parent element.");
		const input = parent.querySelectorAll("input");
		if (input.length !== 3) throw new TypeError("Need three input element.");

		const params = {
			name: input[0].value,
			description: input[1].value,
			private: input[2].checked,
		};

		PUT(`lists/${props.list.id}`, params)
			.then(json => {
				const { data: { updated } } = json;
				if (!updated)
					throw new Error("Failed list update.");
				props.onUpdateList(props.list.id, {
					updated,
					name: params.name,
					description: params.description,
					private: params.private,
				});
			})
			.catch(alert);
		displayConfirm(Mode.Close);
	}

	const handleDelete = function (e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		DELETE(`lists/${props.list.id}`)
			.then(json => {
				const { data: { deleted } } = json;
				if (!deleted)
					throw new Error("Failed list delete.");
				props.onUpdateList(props.list.id, { deleted });
			})
			.catch(alert);
		displayConfirm(Mode.Close);
	}

	const handleCancel = function (e: React.MouseEvent<HTMLButtonElement>) {
		e.stopPropagation();
		displayConfirm(Mode.Close);
	}

	return (
		<div id={props.list.id} className='list' onClick={handleClick}>
			<div className="list-line">
				<div className="cell mark">{props.list.private ? "🔒" : "　"}</div>
				<div className="cell name">{props.list.name}</div>
				<div className="cell member_count">👥{props.list.member_count}</div>
			</div>
			<div className="list-line">
				<div className="cell description" >{props.list.description}</div>
			</div>
			<div className="list-line">
				<div className="cell follower_count">👁️{props.list.follower_count}</div>
				<div className="cell created_at" >{formatedDate(createAt)}</div>
			</div>
			{
				props.selectedListID === props.list.id
					? (
						<div className="command">
							{/* <button onClick={() => displayConfirm(Mode.Edit)}>Edit</button> */}
							<button onClick={() => displayConfirm(Mode.Delete)}>Delete</button>
						</div>
					)
					: (<></>)
			}
			{
				confirmMode === Mode.Edit
					? <Confirm mode={confirmMode} name={props.list.name} description={props.list.description} private={props.list.private} onClick={handleEdit} onCancel={handleCancel} />
					: confirmMode === Mode.Delete
						? <Confirm mode={confirmMode} name={props.list.name} description={props.list.description} private={props.list.private} onClick={handleDelete} onCancel={handleCancel} />
						: <></>
			}
		</div>
	);
}

function formatedDate(date: Date) {
	const pad = (n: number, pads: number = 2) => ('' + n).padStart(pads, "0");
	const Y = pad(date.getFullYear(), 4);
	const M = pad(date.getMonth() + 1);
	const D = pad(date.getDate());
	const h = pad(date.getHours());
	const m = pad(date.getMinutes());
	const s = pad(date.getSeconds());
	return `${Y}/${M}/${D} ${h}:${m}:${s}`;
}