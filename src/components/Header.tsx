import Input from './Input';
import './Header.scss';

type Props = {
	name: string | null;
	handleSearch: Function;
}

export default function Header(props: Props) {
	return (<div className="main-header">
		<span className="screen-name">{props.name}</span>
		<Input handleSearch={props.handleSearch} />
	</div>);
}