type Props = {
	message: string;
	setMessage: Function;
}

export default function Message(props: Props) {
	const body = [];
	if (props.message)
		for (const e of props.message)
			body.push(e, <br />);
	return (<div className={`message ${body.length ? "message-show" : ""}`} onClick={() => props.setMessage(null)}>{body}</div>);
}