// src/pages/ProfilePage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import userService from "../services/user/userService";
import { itemService } from "../services/itemService";
import { uploadFiles } from "../services/cloudinaryService";
import ItemCard from "../components/Items/ItemCard";
import styles from "../styles/ProfilePage.module.css";

const ProfilePage = () => {
  const { user, refreshUser, logout } = useAuth(); // ← añadí logout
  const navigate = useNavigate();

  // Si no hay sesión, redirigir
  useEffect(() => {
    if (!user) navigate("/ingresar");
  }, [user, navigate]);

  // Datos completos del perfil (obtenidos del endpoint)
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Modo edición
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "",
    lastName: "",
    email: "",
    username: "",
    dateOfBirth: "",
    addresses: [""],
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Artículos del usuario
  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Tabs
  const [activeTab, setActiveTab] = useState("perfil");

  // Cargar perfil completo desde el backend
  useEffect(() => {
    if (!user?.id) return;
    const fetchProfile = async () => {
      try {
        const data = await userService.getUserById(user.id);
        setProfile(data);
        setForm({
          name: data.name || "",
          lastName: data.lastName || "",
          email: data.email || "",
          username: data.username || "",
          dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split("T")[0] : "",
          addresses: data.addresses?.map(a => a.address) || [""],
          image: null,
        });
        setPreviewImage(null);
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user?.id]);

  // Cargar artículos del usuario (solo si tiene rol SELLER)
  useEffect(() => {
    if (!user?.id || !user.roles?.includes("SELLER")) {
      setLoadingItems(false);
      return;
    }
    const fetchItems = async () => {
      try {
        const data = await itemService.getItemsBySeller(user.id);
        setItems(data);
      } catch (error) {
        console.error("Error al cargar artículos:", error);
      } finally {
        setLoadingItems(false);
      }
    };
    fetchItems();
  }, [user?.id, user?.roles]);

  // Manejar campos del formulario
  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      if (file) {
        setForm(prev => ({ ...prev, image: file }));
        setPreviewImage(URL.createObjectURL(file));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Agregar campo de dirección
  const handleAddAddress = () => {
    setForm(prev => ({ ...prev, addresses: [...prev.addresses, ""] }));
  };

  // Cambiar dirección específica
  const handleAddressChange = (index, value) => {
    const updated = [...form.addresses];
    updated[index] = value;
    setForm(prev => ({ ...prev, addresses: updated }));
  };

  // Eliminar dirección
  const handleRemoveAddress = (index) => {
    const updated = form.addresses.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, addresses: updated }));
  };

  // Guardar perfil
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = profile.image || "";
      if (form.image instanceof File) {
        const urls = await uploadFiles([form.image], "ecofenix/profiles");
        if (urls.length > 0) imageUrl = urls[0];
      }
      const payload = {
        name: form.name,
        lastName: form.lastName,
        dateOfBirth: form.dateOfBirth ? `${form.dateOfBirth}T00:00:00` : null,
        image: imageUrl,
        email: form.email,
        username: form.username,
        password: null,
        addresses: form.addresses
          .filter(a => a.trim() !== "")
          .map(a => ({ address: a })),
        roleIds: profile.roles?.map(r => r.id) || [],
      };
      await userService.updateUser(user.id, payload);

      alert("Perfil actualizado correctamente. Por seguridad, deberás iniciar sesión de nuevo.");
      await logout();
      navigate("/ingresar", { replace: true });
    } catch (error) {
      console.error(error);
      alert("Error al actualizar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Cancelar edición
  const handleCancelEdit = () => {
    setForm({
      name: profile?.name || "",
      lastName: profile?.lastName || "",
      email: profile?.email || "",
      username: profile?.username || "",
      dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "",
      addresses: profile?.addresses?.map(a => a.address) || [""],
      image: null,
    });
    setPreviewImage(null);
    setEditMode(false);
  };

  // Cambiar contraseña (ahora fuerza logout)
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmPassword");

    if (newPassword !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    if (!currentPassword) {
      alert("Debes ingresar tu contraseña actual");
      return;
    }

    try {
      await userService.updateUser(user.id, {
        ...profile,
        password: newPassword,
        currentPassword: currentPassword,
        roleIds: profile.roles?.map(r => r.id) || [],
        addresses: profile.addresses?.map(a => ({ address: a.address })) || [],
      });
      alert("Contraseña actualizada. Serás redirigido al inicio de sesión.");
      await logout(); // ← fuerza el cierre de sesión
      navigate("/ingresar", { replace: true });
    } catch (error) {
      alert("Error al cambiar contraseña: " + error.message);
    }
  };

  // Asignarse rol SELLER
  const handleBecomeSeller = async () => {
    try {
      await userService.assignRoleToUser(user.id, "SELLER");
      await refreshUser();
      alert("Ahora eres vendedor. Ya puedes publicar artículos.");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // Eliminar artículo
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("¿Eliminar este artículo?")) return;
    try {
      await itemService.deleteItem(itemId);
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      alert("Error al eliminar: " + error.message);
    }
  };

  // Editar artículo
  const handleEditItem = (itemId) => {
    navigate(`/articulos/editar/${itemId}`);
  };

  if (!user) return null;

  if (loadingProfile) return <div className={styles.container}><p>Cargando perfil...</p></div>;

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Mi Cuenta</h1>

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
            Mis Artículos {items.length > 0 ? `(${items.length})` : ""}
          </button>
          <button
            className={`${styles.tab} ${activeTab === "seguridad" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("seguridad")}
          >
            Seguridad
          </button>
        </div>

        <div className={styles.tabContent}>
          {/* PERFIL */}
          {activeTab === "perfil" && (
            <div className={styles.card}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  {previewImage || profile.image ? (
                    <img
                      src={previewImage || profile.image}
                      alt="Perfil"
                      className={styles.avatar}
                    />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {profile.name?.charAt(0)}{profile.lastName?.charAt(0)}
                    </div>
                  )}
                </div>
                {!editMode && (
                  <div className={styles.userName}>
                    {profile.name} {profile.lastName}
                  </div>
                )}
              </div>

              {!editMode ? (
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Usuario</span>
                    <span>{profile.username}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Email</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha nacimiento</span>
                    <span>{profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : "—"}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Direcciones</span>
                    <div>
                      {profile.addresses?.map((a, i) => (
                        <div key={i}>{a.address}</div>
                      ))}
                    </div>
                  </div>
                  <div className={styles.rolesSection}>
                    <span className={styles.infoLabel}>Roles</span>
                    <div className={styles.roles}>
                      {profile.roles?.map((role, index) => (
                        <span key={role.id}>
                          <span className={styles.roleBadge}>{role.title}</span>
                          {index < profile.roles.length - 1 && (
                            <span className={styles.roleSeparator}>, </span>
                          )}
                        </span>
                      ))}
                      {!profile.roles?.some(r => r.title === "SELLER") && (
                        <button onClick={handleBecomeSeller} className={styles.becomeSellerBtn}>
                          Convertirme en vendedor
                        </button>
                      )}
                    </div>
                  </div>
                  <button className={styles.editBtn} onClick={() => setEditMode(true)}>
                    Editar perfil
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveProfile} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label>Nombre</label>
                      <input type="text" name="name" value={form.name} onChange={handleInputChange} className={styles.input} required />
                    </div>
                    <div className={styles.field}>
                      <label>Apellido</label>
                      <input type="text" name="lastName" value={form.lastName} onChange={handleInputChange} className={styles.input} required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleInputChange} className={styles.input} required />
                  </div>
                  <div className={styles.field}>
                    <label>Nombre de usuario</label>
                    <input type="text" name="username" value={form.username} onChange={handleInputChange} className={styles.input} required />
                  </div>
                  <div className={styles.field}>
                    <label>Fecha de nacimiento</label>
                    <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleInputChange} className={styles.input} />
                  </div>
                  <div className={styles.field}>
                    <label>Direcciones</label>
                    {form.addresses.map((addr, idx) => (
                      <div key={idx} className={styles.addressRow}>
                        <input
                          type="text"
                          value={addr}
                          onChange={(e) => handleAddressChange(idx, e.target.value)}
                          className={styles.input}
                          placeholder="Calle, ciudad..."
                        />
                        {form.addresses.length > 1 && (
                          <button type="button" onClick={() => handleRemoveAddress(idx)} className={styles.removeAddressBtn}>✕</button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={handleAddAddress} className={styles.addAddressBtn}>
                      + Agregar otra dirección
                    </button>
                  </div>
                  <div className={styles.field}>
                    <label>Foto de perfil</label>
                    <input type="file" name="image" accept="image/*" onChange={handleInputChange} className={styles.fileInput} />
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn} disabled={saving}>
                      {saving ? "Guardando..." : "Guardar cambios"}
                    </button>
                    <button type="button" onClick={handleCancelEdit} className={styles.cancelBtn}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* MIS ARTÍCULOS */}
          {activeTab === "articulos" && (
            <div className={styles.card}>
              {!user.roles?.includes("SELLER") ? (
                <div className={styles.emptyState}>
                  <p>No tienes el rol de vendedor.</p>
                  <button onClick={handleBecomeSeller} className={styles.becomeSellerBtn}>
                    Convertirme en vendedor
                  </button>
                </div>
              ) : loadingItems ? (
                <p className={styles.loadingText}>Cargando artículos...</p>
              ) : items.length > 0 ? (
                <div className={styles.itemsGrid}>
                  {items.map((item) => (
                    <div key={item.id} className={styles.itemCardWrapper}>
                      {/* Oculta el botón Solicitar para el dueño */}
                      <ItemCard item={item} showRequestButton={false} />
                      <div className={styles.itemActions}>
                        <button
                          className={`${styles.actionBtn} ${styles.editBtn}`}
                          onClick={() => handleEditItem(item.id)}
                        >
                          Editar
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
              <form onSubmit={handleChangePassword} className={styles.form}>
                <div className={styles.field}>
                  <label>Contraseña actual</label>
                  <input type="password" name="currentPassword" className={styles.input} required />
                </div>
                <div className={styles.field}>
                  <label>Nueva contraseña</label>
                  <input type="password" name="newPassword" className={styles.input} required />
                </div>
                <div className={styles.field}>
                  <label>Confirmar nueva contraseña</label>
                  <input type="password" name="confirmPassword" className={styles.input} required />
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