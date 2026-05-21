// src/pages/LoginPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { uploadFile } from "../services/cloudinaryService";
import styles from "../styles/LoginPage.module.css";

const LoginPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Login
  const [loginData, setLoginData] = useState({
    userOrEmail: "",
    password: "",
  });

  // Register 
  const [registerData, setRegisterData] = useState({
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    imagenFile: null,       
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    direccion: "",
  });

  // Previsualización local
  const [previewImage, setPreviewImage] = useState(null);

  const handleLoginChange = (e) =>
    setLoginData({ ...loginData, [e.target.name]: e.target.value });

  const handleRegisterChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files[0];
      if (file) {
        setRegisterData((prev) => ({ ...prev, imagenFile: file }));
        // Previsualización local (sin subir)
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);
      } else {
        setRegisterData((prev) => ({ ...prev, imagenFile: null }));
        if (previewImage) URL.revokeObjectURL(previewImage);
        setPreviewImage(null);
      }
    } else {
      setRegisterData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(loginData.userOrEmail, loginData.password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (registerData.password !== registerData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    let profileImageUrl = "";

    try {
      // Subir la foto de perfil solo si el usuario seleccionó un archivo
      if (registerData.imagenFile) {
        setUploadingImage(true);
        profileImageUrl = await uploadFile(registerData.imagenFile, "ecofenix/profiles");
        setUploadingImage(false);
      }

      // Construir payload con la URL obtenida (vacío si no hay imagen)
      const payload = {
        name: registerData.nombre,
        lastName: registerData.apellido,
        dateOfBirth: `${registerData.fechaNacimiento}T00:00:00`,
        image: profileImageUrl,
        email: registerData.email,
        username: registerData.username,
        password: registerData.password,
        addresses: [{ address: registerData.direccion }],
        roleIds: [2], // CUSTOMER
      };

      await register(payload);
      navigate("/");
    } catch (err) {
      setError(err.message || "Error al registrarse");
      if (uploadingImage) setUploadingImage(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Hero simple */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {isLogin ? "Accede a tu comunidad" : "Únete a Segunda Vida"}
          </h1>
          <p className={styles.heroSub}>
            {isLogin
              ? "Entra y sigue compartiendo solidaridad."
              : "Crea tu cuenta y empieza a donar o encontrar lo que necesitas."}
          </p>
        </div>
      </section>

      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.toggleWrapper}>
            <button
              className={`${styles.toggleBtn} ${isLogin ? styles.activeToggle : ""}`}
              onClick={() => { setIsLogin(true); setError(""); }}
            >
              Iniciar sesión
            </button>
            <button
              className={`${styles.toggleBtn} ${!isLogin ? styles.activeToggle : ""}`}
              onClick={() => { setIsLogin(false); setError(""); }}
            >
              Registrarse
            </button>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Usuario o correo electrónico</label>
                <input
                  type="text"
                  name="userOrEmail"
                  className={styles.input}
                  value={loginData.userOrEmail}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Contraseña</label>
                <input
                  type="password"
                  name="password"
                  className={styles.input}
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className={styles.form}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Nombre</label>
                  <input
                    type="text"
                    name="nombre"
                    className={styles.input}
                    value={registerData.nombre}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Apellido</label>
                  <input
                    type="text"
                    name="apellido"
                    className={styles.input}
                    value={registerData.apellido}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Fecha de nacimiento</label>
                <input
                  type="date"
                  name="fechaNacimiento"
                  className={styles.input}
                  value={registerData.fechaNacimiento}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Imagen de perfil</label>
                <input
                  type="file"
                  name="imagen"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleRegisterChange}
                  disabled={uploadingImage}
                />
                {previewImage && !uploadingImage && (
                  <div className={styles.imagePreview}>
                    <img src={previewImage} alt="Vista previa" className={styles.previewImg} />
                  </div>
                )}
                {uploadingImage && <p className={styles.uploadHint}>Subiendo imagen...</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Correo electrónico</label>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nombre de usuario</label>
                <input
                  type="text"
                  name="username"
                  className={styles.input}
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Contraseña</label>
                  <input
                    type="password"
                    name="password"
                    className={styles.input}
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Confirmar contraseña</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className={styles.input}
                    value={registerData.confirmPassword}
                    onChange={handleRegisterChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Dirección</label>
                <input
                  type="text"
                  name="direccion"
                  className={styles.input}
                  value={registerData.direccion}
                  onChange={handleRegisterChange}
                  required
                />
              </div>

              <button
                type="submit"
                className={styles.submitBtn}
                disabled={loading || uploadingImage}
              >
                {loading
                  ? "Creando cuenta..."
                  : uploadingImage
                  ? "Subiendo foto..."
                  : "Crear cuenta"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;