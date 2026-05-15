import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { itemService } from "../services/itemService";
import { categoryService } from "../services/categoryService";
import styles from "../styles/PublishItemPage.module.css";

const PublishItemPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    stock: 1,
    imageUrls: [],
    shippingCost: 0,
    type: "FOR_SALE",
    status: "ACTIVE",
    categoryIds: [],
    sellerId: Number(import.meta.env.VITE_DEFAULT_SELLER_ID) || 1
  });
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCat, setSelectedMainCat] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");
  const [imageInput, setImageInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar categorías principales
  useEffect(() => {
    categoryService.getMainCategories().then(setMainCategories);
  }, []);

  // Cuando cambia la categoría principal, cargar subcategorías
  useEffect(() => {
    if (selectedMainCat) {
      categoryService
        .getSubCategories(selectedMainCat)
        .then((subs) => {
          setSubCategories(subs);
          // Si no hay subcategorías, asignar la categoría principal inmediatamente
          if (!subs || subs.length === 0) {
            setFormData((prev) => ({ ...prev, categoryIds: [Number(selectedMainCat)] }));
            setSelectedSubCat("");
          } else {
            // Si hay subcategorías, limpiar selección anterior y categoryIds
            setFormData((prev) => ({ ...prev, categoryIds: [] }));
            setSelectedSubCat("");
          }
        })
        .catch(() => {
          setSubCategories([]);
          setFormData((prev) => ({ ...prev, categoryIds: [Number(selectedMainCat)] }));
          setSelectedSubCat("");
        });
    } else {
      setSubCategories([]);
      setFormData((prev) => ({ ...prev, categoryIds: [] }));
      setSelectedSubCat("");
    }
  }, [selectedMainCat]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addImageUrl = () => {
    if (imageInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, imageInput.trim()],
      }));
      setImageInput("");
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.imageUrls.length === 0) {
      alert("Agrega al menos una URL de imagen");
      return;
    }
    if (formData.categoryIds.length === 0) {
      // Mensaje más específico
      if (subCategories.length > 0 && !selectedSubCat) {
        alert("Debes seleccionar una subcategoría para esta categoría principal.");
      } else {
        alert("Selecciona una categoría para el artículo.");
      }
      return;
    }
    setLoading(true);
    try {
      await itemService.createItem(formData);
      alert("Artículo publicado con éxito");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error al publicar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMainCatChange = (catId) => {
    setSelectedMainCat(catId);
    // No se asigna categoryIds aquí, lo hará el useEffect
  };

  const handleSubCatChange = (subId) => {
    setSelectedSubCat(subId);
    setFormData((prev) => ({ ...prev, categoryIds: [subId] }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Publicar un artículo</h1>
        <p className={styles.sub}>Comparte lo que ya no usas. Puedes donar o vender a bajo costo.</p>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Título */}
        <div className={styles.field}>
          <label className={styles.label}>Título *</label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} className={styles.input} required />
        </div>

        {/* Descripción */}
        <div className={styles.field}>
          <label className={styles.label}>Descripción *</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className={styles.textarea} required />
        </div>

        {/* Tipo y precio */}
        <div className={styles.field}>
          <label className={styles.label}>Tipo *</label>
          <select name="type" value={formData.type} onChange={handleChange} className={styles.select}>
            <option value="FOR_SALE">Venta solidaria</option>
            <option value="DONATION">Donación gratuita</option>
          </select>
        </div>
        {formData.type === "FOR_SALE" && (
          <div className={styles.field}>
            <label className={styles.label}>Precio (COP) *</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} className={styles.input} min="0" step="1000" required />
          </div>
        )}

        {/* Categorías */}
        <div className={styles.field}>
          <label className={styles.label}>Categoría *</label>
          <select
            className={styles.select}
            value={selectedMainCat}
            onChange={(e) => handleMainCatChange(Number(e.target.value))}
          >
            <option value="">-- Selecciona categoría principal --</option>
            {mainCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {subCategories.length > 0 && (
            <>
              <select
                className={styles.select}
                value={selectedSubCat}
                onChange={(e) => handleSubCatChange(Number(e.target.value))}
                style={{ marginTop: "8px" }}
              >
                <option value="">-- Elige una subcategoría (obligatoria) --</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
              <p className={styles.hint} style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>
                * Esta categoría tiene subcategorías, debes elegir una.
              </p>
            </>
          )}
          {subCategories.length === 0 && selectedMainCat && (
            <p className={styles.hint} style={{ fontSize: "0.7rem", color: "var(--green-700)", marginTop: "4px" }}>
              ✓ Categoría seleccionada correctamente.
            </p>
          )}
        </div>

        {/* Imágenes - Sección mejorada */}
        <div className={styles.field}>
          <label className={styles.label}>Imágenes del artículo (URLs externas)</label>
          <div className={styles.imagesSection}>
            <div className={styles.addImageRow}>
              <input
                type="text"
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImageUrl())}
                placeholder="https://ejemplo.com/imagen.jpg"
                className={styles.addInput}
              />
              <button
                type="button"
                onClick={addImageUrl}
                className={styles.addBtn}
              >
                <span>+</span> Agregar
              </button>
            </div>

            {formData.imageUrls.length > 0 ? (
              <div className={styles.imageGrid}>
                {formData.imageUrls.map((url, idx) => (
                  <div key={idx} className={styles.imagePreview}>
                    <img src={url} alt={`Vista previa ${idx + 1}`} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className={styles.removeBtn}
                      title="Eliminar imagen"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyImages}>
                <span className={styles.emptyImagesIcon}>📸</span>
                <span>No hay imágenes agregadas aún</span>
              </div>
            )}
          </div>
        </div>

        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? "Publicando..." : "Publicar artículo"}
        </button>
      </form>
    </div>
  );
};

export default PublishItemPage;