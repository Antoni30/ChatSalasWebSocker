import { useState, useEffect } from "react";
import socket from "../utils/socket";

interface SalaCreadaPayload {
  nombreSala: string;
  pin: string;
}

interface UnidoASalaPayload {
  sala: string;
  nombreUsuario: string;
  pin: string;
}

interface ErrorPayload {
  mensaje: string;
}

interface CrearSalaProps {
  onUnirSala: (sala: string, nombreUsuario: string, pin: string) => void;
}

const CrearSala: React.FC<CrearSalaProps> = ({ onUnirSala }) => {
  const [nombreSala, setNombreSala] = useState<string>("");
  const [limite, setLimite] = useState<number>(2);
  const [nombreUsuario, setNombreUsuario] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  useEffect(() => {
    const onSalaCreada = (payload: SalaCreadaPayload) => {
      setMensaje(`Sala "${payload.nombreSala}" creada con éxito. PIN: ${payload.pin}`);
      setNombreSala("");
      setLimite(2);
      setNombreUsuario("");
    };

    const onUnidoASala = (payload: UnidoASalaPayload) => {
      setMensaje("");
      onUnirSala(payload.sala, payload.nombreUsuario, payload.pin);
    };

    const onErrorCrear = (error: ErrorPayload) => {
      setMensaje(error.mensaje || "Error desconocido");
    };

    socket.on("salaCreada", onSalaCreada);
    socket.on("unidoASala", onUnidoASala);
    socket.on("error", onErrorCrear);

    return () => {
      socket.off("salaCreada", onSalaCreada);
      socket.off("unidoASala", onUnidoASala);
      socket.off("error", onErrorCrear);
    };
  }, [onUnirSala]);

  const manejarCrearSala = () => {
    setMensaje("");
    if (!nombreSala.trim() || !nombreUsuario.trim() || limite < 1 || !Number.isInteger(limite)) {
      setMensaje("Por favor, completa todos los campos correctamente.");
      return;
    }
    socket.emit("crearSala", {
      nombreSala: nombreSala.trim(),
      limite,
      nombreUsuario: nombreUsuario.trim(),
    });
  };

  const esError = mensaje.toLowerCase().includes("error");

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Crear Sala</h2>
      <input
        type="text"
        placeholder="Nombre de la sala"
        value={nombreSala}
        onChange={(e) => {
          setNombreSala(e.target.value);
          setMensaje("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="number"
        min={1}
        placeholder="Límite de usuarios"
        value={limite}
        onChange={(e) => {
          setLimite(Number(e.target.value));
          setMensaje("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Tu nombre"
        value={nombreUsuario}
        onChange={(e) => {
          setNombreUsuario(e.target.value);
          setMensaje("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={manejarCrearSala} style={{ width: "100%" }}>
        Crear Sala
      </button>
      {mensaje && (
        <p
          style={{
            marginTop: 12,
            color: esError ? "red" : "green",
          }}
        >
          {mensaje}
        </p>
      )}
    </div>
  );
};

export default CrearSala;
