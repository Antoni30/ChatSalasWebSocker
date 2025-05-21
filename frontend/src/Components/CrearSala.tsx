import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../utils/socket";

interface SalaCreadaPayload {
  sala: string;         // corregí nombre de propiedad para que sea igual al parámetro URL
  pin: string;
}


interface ErrorPayload {
  mensaje: string;
}

const CrearSala: React.FC = () => {
  const [nombreSala, setNombreSala] = useState<string>("");
  const [limite, setLimite] = useState<number>(2);
  const [nombreUsuario, setNombreUsuario] = useState<string>("");
  const [mensaje, setMensaje] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    // Listener para sala creada - navegamos a la ruta chat con estado
    const onSalaCreada = (payload: SalaCreadaPayload) => {
      setMensaje("");
      navigate(`/chat/${payload.sala}`, {
        state: { pin: payload.pin, nombreUsuario },
        replace: true,
      });
    };

    // Listener para errores
    const onErrorCrear = (error: ErrorPayload) => {
      setMensaje(error.mensaje || "Error desconocido");
    };

    socket.on("salaCreada", onSalaCreada);
    socket.on("error", onErrorCrear);

    return () => {
      socket.off("salaCreada", onSalaCreada);
      socket.off("error", onErrorCrear);
    };
  }, [navigate, nombreUsuario]);


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

  const manejarIrUnirSala = () => {
    navigate("/unir");
  };

  const esError = mensaje.toLowerCase().includes("error");

  return (
    <div>
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          maxWidth: "300px",
          margin: "auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Crear Sala</h2>

        <input
          type="text"
          placeholder="Nombre de la sala"
          value={nombreSala}
          onChange={(e) => {
            setNombreSala(e.target.value);
            setMensaje("");
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
          type="number"
          min={1}
          placeholder="Límite de usuarios"
          value={limite}
          onChange={(e) => {
            setLimite(Number(e.target.value));
            setMensaje("");
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
            setMensaje("");
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
          onClick={manejarCrearSala}
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
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ca60df";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#000000";
          }}
        >
          Crear Sala
        </button>

        <button
          onClick={manejarIrUnirSala}
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
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#666666";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#444444";
          }}
        >
          Unir a Sala
        </button>

        {mensaje && (
          <p
            style={{
              marginTop: "15px",
              color: esError ? "#e57373" : "#81c784",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {mensaje}
          </p>
        )}
      </div>
    </div>
  );
};

export default CrearSala;
