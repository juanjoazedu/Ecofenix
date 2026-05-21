// src/pages/PublishItemPage.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { itemService } from "../services/itemService";
import { categoryService } from "../services/categoryService";
import { uploadFiles } from "../services/cloudinaryService";
import styles from "../styles/PublishItemPage.module.css";

const PublishItemPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirigir si no está autenticado o no tiene rol de vendedor
  useEffect(() => {
    if (!user) {
      navigate("/ingresar");
    } else if (!user.roles.includes("SELLER")) {
      alert("Necesitas activar el rol de vendedor en tu perfil para publicar.");
      navigate("/perfil");
    }
  }, [user, navigate]);

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
    sellerId: user?.id || null,
  });
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCat, setSelectedMainCat] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // Liberar URLs al desmontar
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Cargar categorías principales
  useEffect(() => {
    categoryService.getMainCategories().then(setMainCategories);
  }, []);

  // Subcategorías al cambiar categoría principal
  useEffect(() => {
    if (selectedMainCat) {
      categoryService
        .getSubCategories(selectedMainCat)
        .then((subs) => {
          setSubCategories(subs);
          if (!subs || subs.length === 0) {
            setFormData((prev) => ({ ...prev, categoryIds: [Number(selectedMainCat)] }));
            setSelectedSubCat("");
          } else {
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

  // Seleccionar archivos (acumula hasta 5)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 5) {
      alert(`Máximo 5 imágenes. Ya tienes ${selectedFiles.length} seleccionada(s).`);
      return;
    }
    const newFiles = [...selectedFiles, ...files];
    setSelectedFiles(newFiles);
    // Regenerar todas las previsualizaciones (para mantener orden)
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
    // Limpiar input para poder seguir agregando
    e.target.value = '';
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  const removeImage = (index) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previewUrls];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Selecciona al menos una imagen para el artículo");
      return;
    }
    if (formData.categoryIds.length === 0) {
      if (subCategories.length > 0 && !selectedSubCat) {
        alert("Debes seleccionar una subcategoría para esta categoría principal.");
      } else {
        alert("Selecciona una categoría para el artículo.");
      }
      return;
    }
    setLoading(true);
    try {
      const uploadedUrls = await uploadFiles(selectedFiles, "ecofenix/products");
      if (uploadedUrls.length === 0) throw new Error("No se pudo subir ninguna imagen");
      const finalItemData = { ...formData, imageUrls: uploadedUrls };
      await itemService.createItem(finalItemData);
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
              <p className={styles.hint}>* Esta categoría tiene subcategorías, debes elegir una.</p>
            </>
          )}
          {subCategories.length === 0 && selectedMainCat && (
            <p className={styles.hint}>✓ Categoría seleccionada correctamente.</p>
          )}
        </div>

        {/* Imágenes: fila horizontal con scroll, imágenes pequeñas */}
        <div className={styles.field}>
          <label className={styles.label}>Imágenes del artículo *</label>
          <div className={styles.imagesSection}>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ display: "none" }}
            />
            <button
              type="button"
              onClick={handleUploadButtonClick}
              className={styles.uploadBtn}
              disabled={loading}
            >
              📸 Subir imágenes desde dispositivo
            </button>

            {previewUrls.length > 0 ? (
              <div className={styles.imageScrollContainer}>
                <div className={styles.imageRow}>
                  {previewUrls.map((url, idx) => (
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
              </div>
            ) : (
              <div className={styles.emptyImages}>
                <span className={styles.emptyImagesIcon}>📸</span>
                <span>No hay imágenes. Presiona el botón para seleccionar.</span>
              </div>
            )}
            <p className={styles.hint}>Puedes subir hasta 5 imágenes (JPG, PNG, WebP).</p>
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