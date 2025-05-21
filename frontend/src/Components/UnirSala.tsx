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
  <div style={{
      display: "flex",
      justifyContent: "center", // centra horizontalmente
      alignItems: "center",     // centra verticalmente
      width: "100%",
    //  minHeight: "100vh"        // ocupar toda la altura de la ventana
    }}>
    <div
      style={{
        padding: "10px",
        borderRadius: "12px",
        maxWidth: "300px",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>Unirse a Sala</h2>

      <input
        type="text"
        placeholder="Nombre de la sala"
        value={nombreSala}
        onChange={(e) => {
          setNombreSala(e.target.value);
          setMensajeU("");
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#1e1e2f",
          color: "#f5f5f5",
        }}
      />

      <input
        type="text"
        placeholder="Tu nombre"
        value={nombreUsuario}
        onChange={(e) => {
          setNombreUsuario(e.target.value);
          setMensajeU("");
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "12px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#1e1e2f",
          color: "#f5f5f5",
        }}
      />

      <input
        type="text"
        placeholder="PIN de la sala"
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          setMensajeU("");
        }}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "16px",
          borderRadius: "6px",
          border: "1px solid #444",
          backgroundColor: "#1e1e2f",
          color: "#f5f5f5",
        }}
      />

      <button
        onClick={manejarUnirSala}
        style={{
          width: "100%",
          padding: "10px",
          backgroundColor: "000000",
          color: "#ffff",
          border: "none",
          borderRadius: "6px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
        onMouseOver={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ca60df";
        }}
        onMouseOut={(e) => {
          (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#000000";
        }}
      >
        Unirse a Sala
      </button>

      {mensajeU && (
        <p
          style={{
            marginTop: "15px",
            color: mensajeU.toLowerCase().includes("error") ? "#e57373" : "#81c784",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          {mensajeU}
        </p>
      )}
    </div>
  </div>
);

}


export default UnirSala;
