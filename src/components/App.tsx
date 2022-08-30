import MainScreen from './MainScreen';
import './App.scss';

const BeforeLogin = () => (
  <header className="App-header">
    <p>Twitter lists can be easily edited.</p>
    <a
      className="App-link"
      href="https://twlistedit.mrz-net.org/api/login"
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
