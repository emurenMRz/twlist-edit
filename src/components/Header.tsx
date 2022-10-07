import Input from './Input';
import './Header.scss';

type Props = {
	name: string | null;
	numberOfLists: number;
	handleSearch: Function;
}

export default function Header(props: Props) {
	return (<div className="main-header">
		<div>
			<span className="screen-name">{props.name}</span>
			<span className="number-of-lists">lists: {props.numberOfLists}</span>
		</div>
		<Input onSearch={props.handleSearch} />
	</div>);
}