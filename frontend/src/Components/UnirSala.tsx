import { useState, useEffect } from "react";
import socket from "../utils/socket";

interface UnidoASalaPayload {
  sala: string;
  nombreUsuario: string;
  pin?: string; // opcional en la respuesta, minúscula
}

interface ErrorPayloadU {
  mensaje: string;
}

interface UnirSalaProps {
  onUnirSala: (sala: string, nombreUsuario: string, pin?: string) => void;
}

const UnirSala: React.FC<UnirSalaProps> = ({ onUnirSala }) => {
  const [nombreSala, setNombreSala] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [mensajeU, setMensajeU] = useState("");

  useEffect(() => {
    const onUnidoASala = (payload: UnidoASalaPayload) => {
      setMensajeU("");
      onUnirSala(payload.sala, payload.nombreUsuario, payload.pin);
    };

    const onErrorUnir = (error: ErrorPayloadU) => {
      setMensajeU(error.mensaje || "Error desconocido");
    };

    socket.on("unidoASala", onUnidoASala);
    socket.on("error", onErrorUnir);

    return () => {
      socket.off("unidoASala", onUnidoASala);
      socket.off("error", onErrorUnir);
    };
  }, [onUnirSala]);

  const manejarUnirSala = () => {
    setMensajeU("");
    if (!nombreSala.trim() || !nombreUsuario.trim() || !pin.trim()) {
      setMensajeU("Por favor, completa todos los campos correctamente.");
      return;
    }
    socket.emit("unirSala", {
      sala: nombreSala.trim(),
      nombreUsuario: nombreUsuario.trim(),
      pin: pin.trim(),
    });
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>Unirse a Sala</h2>
      <input
        type="text"
        placeholder="Nombre de la sala"
        value={nombreSala}
        onChange={(e) => {
          setNombreSala(e.target.value);
          setMensajeU("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Tu nombre"
        value={nombreUsuario}
        onChange={(e) => {
          setNombreUsuario(e.target.value);
          setMensajeU("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="PIN de la sala"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          setMensajeU("");
        }}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={manejarUnirSala} style={{ width: "100%" }}>
        Unirse a Sala
      </button>
      {mensajeU && (
        <p
          style={{
            marginTop: 12,
            color: mensajeU.toLowerCase().includes("error") ? "red" : "green",
          }}
        >
          {mensajeU}
        </p>
      )}
    </div>
  );
};

export default UnirSala;
