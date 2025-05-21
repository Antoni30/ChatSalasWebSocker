import './App.css'

import { BrowserRouter, Routes, Route,Link } from "react-router-dom";
import CrearSala from "./Components/CrearSala";
import UnirSala from "./Components/UnirSala";
import Chat from "./Components/Chat";
import Salas from "./Components/Salas"

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/crear" element={
            <div className="container-game">
              <div className="game-box">
                <CrearSala />
              </div>
            </div>
          } />
        <Route path="/unir" element={
            <div className="container-game">
              <div className="game-box">
                <UnirSala />
              </div>
              <div className="game-box">
                <Salas />
              </div>
            </div>
          } />
        <Route path="/chat/:sala" element={<Chat />} />
    <Route
  path="*"
  element={
    <div className="welcome-container">
      <h1 className="welcome-title">¡Bienvenido al Chat  📩!</h1>

      <div className="team-list">
        <h3 className="team-heading">Equipo de Desarrollo</h3>
        <ul className="team-members">
          <li>Antoni Toapanta</li>
          <li>Milena Maldonado</li>
          <li>Dennis Tovar</li>
        </ul>
      </div>

      <div className="button-group">
        <Link to="/crear">
          <button className="btn-primary">Crear Sala</button>
        </Link>
        <Link to="/unir">
          <button className="btn-primary">Unirse a Sala</button>
        </Link>
      </div>
    </div>
  }
/>

      </Routes>
    </BrowserRouter>
  );
};

export default App;


