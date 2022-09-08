import MainScreen from './MainScreen';
import './App.scss';

const BeforeLogin = () => (
  <header className="App-header">
    <h1><img src="./logo512.png" alt="logo" />TwList Backupper</h1>
    <p>You can import and export your Twitter list.</p>
    <a
      className="App-link"
      href="https://twlist.mrz-net.org/api/login"
      rel="noopener noreferrer"
    >
      Login to Twitter
    </a>
  </header>
);

function App() {
  const query = new URLSearchParams(window.location.search);
  const isLogin = query.has("login");

  return (
    <div className="App">
      {isLogin ? <MainScreen name={query.get("login")} /> : <BeforeLogin />}
    </div >
  );
}

export default App;
