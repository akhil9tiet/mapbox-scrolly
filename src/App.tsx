import './App.css';
import { Container } from './components/common';
import { MapViewer } from './components';

function App() {
  return (
    <div className="App">
      <Container>
        <h1>Mapbox Scrolly</h1>
        <MapViewer />
      </Container>
    </div>
  );
}

export default App;