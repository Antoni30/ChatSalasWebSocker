import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

interface UnidoASalaPayload {
  sala: string;
  nombreUsuario: string;
  pin?: string; // Opcional
}

interface ErrorPayloadU {
  mensaje: string;
}

const UnirSala: React.FC = () => {
  const [nombreSala, setNombreSala] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [pin, setPin] = useState("");
  const [mensajeU, setMensajeU] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const onUnidoASala = (payload: UnidoASalaPayload) => {
      setMensajeU("");
      // Navegar a la ruta chat con params y estado
      navigate(`/chat/${payload.sala}`, {
        state: { pin: payload.pin, nombreUsuario: payload.nombreUsuario },
        replace: true,
      });
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
  }, [navigate]);


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

  const manejarCrearSala = () => {
    navigate("/crear");
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
      }}
    >
      <div
        style={{
          padding: "10px",
          borderRadius: "12px",
          maxWidth: "300px",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
          Unirse a Sala
        </h2>

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
            backgroundColor: "#000000",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#ca60df";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#000000";
          }}
        >
          Unirse a Sala
        </button>

        <button
          onClick={manejarCrearSala}
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#444444",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            margin: "1rem 0 0 0",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#666666";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "#444444";
          }}
        >
          Crear Sala
        </button>

        {mensajeU && (
          <p
            style={{
              marginTop: "15px",
              color: mensajeU.toLowerCase().includes("error")
                ? "#e57373"
                : "#81c784",
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
};

export default UnirSala;
