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

  // Memoizar para evitar renders innecesarios
  const manejarUnirSala = useCallback(
    (nombreSala: string, nombreUsuario: string, pin: string) => {
      setSala(nombreSala);
      setUsuario(nombreUsuario);
      setPin(pin);
    },
    []
  );

  // Opcional: función para "salir" del chat y volver a crear/unir sala
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
        <Route path="/crear" element={<CrearSala onUnirSala={manejarUnirSala} />} />
        <Route
          path="/unir"
          element={
            <>
              <UnirSala onUnirSala={manejarUnirSala} />
              <br />
              <Salas />
            </>
          }
        />
        <Route
          path="*"
          element={
            <div style={{ maxWidth: 400, margin: "auto" }}>
              <h1>Bienvenido</h1>
              <Link to="/crear">
                <button style={{ marginRight: 10 }}>Crear Sala</button>
              </Link>
              <Link to="/unir">
                <button>Unirse a Sala</button>
              </Link>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
