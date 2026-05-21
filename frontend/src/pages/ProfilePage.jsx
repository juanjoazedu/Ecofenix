// src/pages/LoginPage.jsx
import { useState, useEffect } from "react";
import { itemService } from "../services/itemService";
import ItemCard from "../components/Items/ItemCard";
import styles from "../styles/ProfilePage.module.css";

const ProfilePage = () => {
  // Mock de usuario autenticado (reemplazar con contexto real)
  const mockUser = {
    id: 1,
    nombre: "María",
    apellido: "García",
    email: "maria@example.com",
    username: "mariag",
    fechaNacimiento: "1990-05-15",
    direccion: "Calle Principal 123, Ciudad",
    imagen: null,
  };

  const [userData, setUserData] = useState(mockUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...mockUser });
  const [previewImage, setPreviewImage] = useState(null);
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeTab, setActiveTab] = useState("perfil"); // perfil | articulos | seguridad

  // Cargar artículos del usuario (simulado)
  useEffect(() => {
    const fetchUserItems = async () => {
      try {
        // Aquí deberías pasar el userId real, ej: itemService.getItemsByUser(mockUser.id)
        // Como no existe ese endpoint, usamos getAllItems y filtramos por userId mock
        const all = await itemService.getAllItems();
        const userItems = all.filter(
          (item) => item.userId === mockUser.id || item.sellerId === mockUser.id
        );
        setItems(userItems);
      } catch (error) {
        console.error("Error cargando tus artículos:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchUserItems();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "imagen") {
      const file = files[0];
      if (file) {
        setForm({ ...form, imagen: file });
        setPreviewImage(URL.createObjectURL(file));
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // Aquí iría la llamada al backend para actualizar
    setUserData({ ...form, imagen: previewImage || form.imagen });
    setEditMode(false);
    alert("Perfil actualizado (simulado)");
  };

  const handleCancelEdit = () => {
    setForm({ ...userData });
    setPreviewImage(null);
    setEditMode(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("¿Eliminar este artículo?")) {
      try {
        // await itemService.deleteItem(itemId);
        setItems(items.filter((item) => item.id !== itemId));
        alert("Artículo eliminado (simulado)");
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleToggleSold = async (itemId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "SOLD" : "ACTIVE";
    try {
      // await itemService.updateItemStatus(itemId, newStatus);
      setItems(
        items.map((item) =>
          item.id === itemId ? { ...item, status: newStatus } : item
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Mi Cuenta</h1>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "perfil" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            Perfil
          </button>
          <button
            className={`${styles.tab} ${activeTab === "articulos" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("articulos")}
          >
            Mis Artículos ({items.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "seguridad" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("seguridad")}
          >
            Seguridad
          </button>
        </div>

        {/* Contenido de pestañas */}
        <div className={styles.tabContent}>
          {/* PERFIL */}
          {activeTab === "perfil" && (
            <div className={styles.card}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  {previewImage || userData.imagen ? (
                    <img
                      src={previewImage || userData.imagen}
                      alt="Perfil"
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {userData.nombre?.charAt(0)}
                      {userData.apellido?.charAt(0)}
                    </div>
                  )}
                </div>
                {!editMode && (
                  <div className={styles.userName}>
                    {userData.nombre} {userData.apellido}
                  </div>
                )}
              </div>

              {!editMode ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Usuario</span>
                    <span>{userData.username}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span>{userData.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha nacimiento</span>
                    <span>{userData.fechaNacimiento}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Dirección</span>
                    <span>{userData.direccion}</span>
                  </div>
                  <button
                    className={styles.editBtn}
                    onClick={() => setEditMode(true)}
                  >
                    Editar perfil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Nombre</label>
                      <input
                        type="text"
                        name="nombre"
                        value={form.nombre}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label>Apellido</label>
                      <input
                        type="text"
                        name="apellido"
                        value={form.apellido}
                        onChange={handleInputChange}
                        className={styles.input}
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Nombre de usuario</label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleInputChange}
                      className={styles.input}
                      required
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Fecha de nacimiento</label>
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={form.fechaNacimiento}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      value={form.direccion}
                      onChange={handleInputChange}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.field}>
                    <label>Foto de perfil</label>
                    <input
                      type="file"
                      name="imagen"
                      accept="image/*"
                      onChange={handleInputChange}
                      className={styles.fileInput}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn}>
                      Guardar cambios
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className={styles.cancelBtn}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MIS ARTÍCULOS */}
          {activeTab === "articulos" && (
            <div className={styles.card}>
              {loadingItems ? (
                <p className={styles.loadingText}>Cargando artículos...</p>
              ) : items.length > 0 ? (
                <div className={styles.itemsGrid}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.itemCardWrapper}>
                      <ItemCard item={item} />
                      <div className={styles.itemActions}>
                        <button
                          className={styles.actionBtn}
                          onClick={() =>
                            handleToggleSold(item.id, item.status)
                          }
                        >
                          {item.status === "ACTIVE"
                            ? "Marcar como vendido"
                            : "Reactivar"}
                        </button>
                        <button
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>Aún no has publicado ningún artículo.</p>
                  <a href="/publicar" className={styles.publishLink}>
                    Publicar mi primer artículo
                  </a>
                </div>
              )}
            </div>
          )}

          {/* SEGURIDAD */}
          {activeTab === "seguridad" && (
            <div className={styles.card}>
              <h2 className={styles.sectionTitle}>Cambiar contraseña</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert("Contraseña actualizada (simulado)");
                }}
                className={styles.form}
              >
                <div className={styles.field}>
                  <label>Contraseña actual</label>
                  <input
                    type="password"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    className={styles.input}
                    required
                  />
                </div>
                <button type="submit" className={styles.saveBtn}>
                  Actualizar contraseña
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;