import React from 'react';
import Portal from '../Portal';
import "./Confirm.scss";

export const Mode = {
	Close: 0,
	Create: 1,
	Edit: 2,
	Delete: 3,
} as const;
export type Mode = typeof Mode[keyof typeof Mode];

type Props = {
	mode: Mode;
	name?: string;
	description?: string;
	private?: boolean;
	onClick: React.MouseEventHandler<HTMLButtonElement>;
	onCancel: React.MouseEventHandler<HTMLButtonElement>;
};

export default function Confirm(props: Props = {
	mode: Mode.Close,
	name: "",
	description: "",
	private: false,
	onClick: () => { },
	onCancel: () => { },
}) {
	let title = "";
	let done = "";
	const disabled = props.mode === Mode.Delete;

	switch (props.mode) {
		case Mode.Create:
			title = "Create new list";
			done = "Create";
			break;
		case Mode.Edit:
			title = "Edit list data";
			done = "Update";
			break;
		case Mode.Delete:
			title = "Delete list";
			done = "Delete";
			break;
		default:
			return <></>;
	}

	return (
		<Portal targetID="confirm" >
			<div className={"confirm" + (props.mode ? " confirm-open" : "")}>
				<div className="confirm-base">
					<div className="confirm-message">{title}</div>
					<label>Name: <input type="text" disabled={disabled} defaultValue={props.name} required={true} /></label>
					<label>Description: <input type="text" disabled={disabled} defaultValue={props.description} /></label>
					<label>Private: <input type="checkbox" disabled={disabled} defaultChecked={props.private} /></label>
					<div className="button-group">
						<button onClick={props.onClick}>{done}</button>
						<button onClick={props.onCancel}>Cancel</button>
					</div>
				</div>
			</div>
		</Portal>
	);
}