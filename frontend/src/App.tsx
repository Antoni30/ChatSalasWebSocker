import './App.css'
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CrearSala from "./Components/CrearSala";
import UnirSala from "./Components/UnirSala";
import Chat from "./Components/Chat";
import { useState, useCallback } from "react";
import Salas from './Components/Salas';

const App: React.FC = () => {
  const [sala, setSala] = useState<string | null>(null);
  const [usuario, setUsuario] = useState<string>("");
  const [pin, setPin] = useState<string>("");

  const manejarUnirSala = useCallback(
    (nombreSala: string, nombreUsuario: string, pin: string) => {
      setSala(nombreSala);
      setUsuario(nombreUsuario);
      setPin(pin);
    },
    []
  );

  const manejarSalir = () => {
    setSala(null);
    setUsuario("");
    setPin("");
  };

  if (sala) {
    return (
      <Chat sala={sala} nombreUsuario={usuario} pin={pin} onSalir={manejarSalir} />
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/crear"
          element={
            <div className="container-game">
              <div className="game-box">
                <CrearSala onUnirSala={manejarUnirSala} />
              </div>
            </div>
          }
        />
        <Route
          path="/unir"
          element={
            <div className="container-game">
              <div className="game-box">
                <UnirSala onUnirSala={manejarUnirSala} />
              </div>
              <div className="game-box">
                <Salas />
              </div>
            </div>
          }
        />
        <Route
          path="*"
          element={
            <div className="welcome-container">
              <h1>Bienvenido al Chat</h1>
              <div className="team-list">
                <h3>Integrantes:</h3>
                <div className="team-members">
                  <span>Antoni Toapanta</span><br />
                  <span>Milena Maldonado</span><br />
                  <span>Dennis Tovar</span>
                </div>
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
