import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { itemService } from "../services/itemService";
import { categoryService } from "../services/categoryService";
import { uploadFiles } from "../services/cloudinaryService";
import styles from "../styles/PublishItemPage.module.css";

const EditItemPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirigir si no está autenticado o no tiene rol SELLER
  useEffect(() => {
    if (!user) {
      navigate("/ingresar");
    } else if (!user.roles.includes("SELLER")) {
      alert("Necesitas el rol de vendedor para editar artículos.");
      navigate("/perfil");
    }
  }, [user, navigate]);

  // Estados del formulario
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    stock: 1,
    shippingCost: 0,
    type: "FOR_SALE",
    status: "ACTIVE",
    categoryIds: [],
    sellerId: null,
  });

  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCat, setSelectedMainCat] = useState("");
  const [selectedSubCat, setSelectedSubCat] = useState("");
  const [isMainCatOpen, setIsMainCatOpen] = useState(false);
  const [isSubCatOpen, setIsSubCatOpen] = useState(false);
  const mainCatRef = useRef(null);
  const subCatRef = useRef(null);
  const skipSubCatEffect = useRef(false);

  // Imágenes
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);

  // Estados de carga
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Liberar URLs de preview al desmontar
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  // Cargar artículo y categorías principales
  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        const [item, mainCats] = await Promise.all([
          itemService.getItemById(id),
          categoryService.getMainCategories(),
        ]);
        setMainCategories(mainCats || []);

        // Formulario con datos del artículo
        setFormData({
          title: item.title || "",
          description: item.description || "",
          price: item.price || 0,
          stock: item.stock || 1,
          shippingCost: item.shippingCost || 0,
          type: item.type || "FOR_SALE",
          status: item.status || "ACTIVE",
          categoryIds: item.categoryIds || [],
          sellerId: item.sellerId || user.id,
        });

        // Extraer URLs de imágenes existentes
        const imageUrls = (item.images || []).map(img => img.url);
        setExistingImageUrls(imageUrls);

        // Determinar selección de categoría a partir de categoryIds[0]
        const firstCatId = item.categoryIds?.[0];
        if (firstCatId) {
          const isMain = mainCats?.some(cat => cat.id === firstCatId);
          if (isMain) {
            setSelectedMainCat(firstCatId);
            setSelectedSubCat("");
          } else {
            // Buscar en subcategorías de todas las principales
            let found = false;
            for (const mainCat of mainCats || []) {
              try {
                const subs = await categoryService.getSubCategories(mainCat.id);
                const match = subs.find(sub => sub.id === firstCatId);
                if (match) {
                  skipSubCatEffect.current = true;
                  setSubCategories(subs);
                  setSelectedMainCat(mainCat.id);
                  setSelectedSubCat(firstCatId);
                  found = true;
                  break;
                }
              } catch {
                // ignorar errores de subcategorías
              }
            }
            if (!found) {
              setSelectedMainCat("");
              setSelectedSubCat("");
              setFormData(prev => ({ ...prev, categoryIds: [] }));
            }
          }
        } else {
          setSelectedMainCat("");
          setSelectedSubCat("");
        }
      } catch (err) {
        setError("No se pudo cargar el artículo. " + (err.message || ""));
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [id, user?.id]);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mainCatRef.current && !mainCatRef.current.contains(e.target))
        setIsMainCatOpen(false);
      if (subCatRef.current && !subCatRef.current.contains(e.target))
        setIsSubCatOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cargar subcategorías al cambiar categoría principal
  useEffect(() => {
    if (skipSubCatEffect.current) {
      skipSubCatEffect.current = false;
      return;
    }
    if (selectedMainCat) {
      categoryService
        .getSubCategories(selectedMainCat)
        .then(subs => {
          setSubCategories(subs || []);
          if (!subs || subs.length === 0) {
            setFormData(prev => ({ ...prev, categoryIds: [Number(selectedMainCat)] }));
            setSelectedSubCat("");
          } else {
            setFormData(prev => ({ ...prev, categoryIds: [] }));
            setSelectedSubCat("");
          }
        })
        .catch(() => {
          setSubCategories([]);
          setFormData(prev => ({ ...prev, categoryIds: [Number(selectedMainCat)] }));
          setSelectedSubCat("");
        });
    } else {
      setSubCategories([]);
      setFormData(prev => ({ ...prev, categoryIds: [] }));
      setSelectedSubCat("");
    }
  }, [selectedMainCat]);

  // Handlers de campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejo de imágenes nuevas
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const total = newFiles.length + files.length;
    if (total > 5) {
      alert(`Máximo 5 imágenes en total. Ya tienes ${newFiles.length} nueva(s).`);
      return;
    }
    const updatedNewFiles = [...newFiles, ...files];
    setNewFiles(updatedNewFiles);
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls(updatedNewFiles.map(file => URL.createObjectURL(file)));
    e.target.value = "";
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    const updatedFiles = [...newFiles];
    const updatedPreviews = [...previewUrls];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedFiles.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setNewFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleUploadButtonClick = () => {
    fileInputRef.current.click();
  };

  // Categorías
  const handleMainCatChange = (catId) => {
    setSelectedMainCat(catId);
  };

  const handleSubCatChange = (subId) => {
    setSelectedSubCat(subId);
    setFormData(prev => ({ ...prev, categoryIds: [subId] }));
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingImageUrls.length === 0 && newFiles.length === 0) {
      alert("El artículo debe tener al menos una imagen.");
      return;
    }
    if (formData.categoryIds.length === 0) {
      if (subCategories.length > 0 && !selectedSubCat) {
        alert("Debes seleccionar una subcategoría.");
      } else {
        alert("Selecciona una categoría.");
      }
      return;
    }

    setSaving(true);
    setError("");
    try {
      let uploadedUrls = [];
      if (newFiles.length > 0) {
        uploadedUrls = await uploadFiles(newFiles, "ecofenix/products");
        if (uploadedUrls.length === 0) throw new Error("No se pudo subir las nuevas imágenes");
      }
      const finalImageUrls = [...existingImageUrls, ...uploadedUrls];

      const finalItemData = {
        ...formData,
        imageUrls: finalImageUrls,
      };

      await itemService.updateItem(id, finalItemData);
      alert("Artículo actualizado correctamente.");
      navigate("/perfil");
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  // Protección contra renderizado sin usuario
  if (!user) return null;

  if (loadingData) {
    return (
      <div className={styles.container}>
        <p>Cargando artículo...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>{error}</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Editar artículo</h1>
        <p className={styles.sub}>Modifica los detalles de tu publicación</p>
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

        {/* Stock y costo de envío */}
        <div className={styles.field}>
          <label className={styles.label}>Stock</label>
          <input type="number" name="stock" value={formData.stock} onChange={handleChange} className={styles.input} min="1" />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Costo de envío (COP)</label>
          <input type="number" name="shippingCost" value={formData.shippingCost} onChange={handleChange} className={styles.input} min="0" step="1000" />
        </div>

        {/* Categorías */}
        <div className={styles.field}>
          <label className={styles.label}>Categoría *</label>

          {/* Categoría principal */}
          <div className={styles.customSelect} ref={mainCatRef}>
            <button
              className={`${styles.customSelectTrigger} ${isMainCatOpen ? styles.customSelectTriggerOpen : ""}`}
              onClick={() => setIsMainCatOpen((o) => !o)}
              type="button"
            >
              <span className={styles.customSelectValue}>
                {selectedMainCat
                  ? mainCategories.find((c) => c.id === selectedMainCat)?.name
                  : "-- Selecciona categoría principal --"}
              </span>
              <span className={`${styles.chevron} ${isMainCatOpen ? styles.chevronOpen : ""}`}>▾</span>
            </button>
            {isMainCatOpen && (
              <div className={styles.customSelectDropdown}>
                <button
                  className={`${styles.dropdownItem} ${!selectedMainCat ? styles.dropdownItemSelected : ""}`}
                  onClick={() => { handleMainCatChange(""); setIsMainCatOpen(false); }}
                  type="button"
                >
                  -- Selecciona categoría principal --
                </button>
                {mainCategories.map((cat) => (
                  <button
                    key={cat.id}
                    className={`${styles.dropdownItem} ${selectedMainCat === cat.id ? styles.dropdownItemSelected : ""}`}
                    onClick={() => { handleMainCatChange(cat.id); setIsMainCatOpen(false); setIsSubCatOpen(false); }}
                    type="button"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Subcategoría */}
          {subCategories.length > 0 && (
            <>
              <div className={styles.customSelect} ref={subCatRef} style={{ marginTop: "8px" }}>
                <button
                  className={`${styles.customSelectTrigger} ${isSubCatOpen ? styles.customSelectTriggerOpen : ""}`}
                  onClick={() => setIsSubCatOpen((o) => !o)}
                  type="button"
                >
                  <span className={styles.customSelectValue}>
                    {selectedSubCat
                      ? subCategories.find((s) => s.id === selectedSubCat)?.name
                      : "-- Elige una subcategoría (obligatoria) --"}
                  </span>
                  <span className={`${styles.chevron} ${isSubCatOpen ? styles.chevronOpen : ""}`}>▾</span>
                </button>
                {isSubCatOpen && (
                  <div className={styles.customSelectDropdown}>
                    <button
                      className={`${styles.dropdownItem} ${!selectedSubCat ? styles.dropdownItemSelected : ""}`}
                      onClick={() => { handleSubCatChange(""); setIsSubCatOpen(false); }}
                      type="button"
                    >
                      -- Elige una subcategoría (obligatoria) --
                    </button>
                    {subCategories.map((sub) => (
                      <button
                        key={sub.id}
                        className={`${styles.dropdownItem} ${selectedSubCat === sub.id ? styles.dropdownItemSelected : ""}`}
                        onClick={() => { handleSubCatChange(sub.id); setIsSubCatOpen(false); }}
                        type="button"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <p className={styles.hint}>* Esta categoría tiene subcategorías, debes elegir una.</p>
            </>
          )}
          {subCategories.length === 0 && selectedMainCat && (
            <p className={styles.hint}>✓ Categoría seleccionada correctamente.</p>
          )}
        </div>

        {/* Imágenes */}
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
              disabled={saving}
            >
              📸 Subir más imágenes
            </button>

            {(existingImageUrls.length > 0 || previewUrls.length > 0) ? (
              <div className={styles.imageScrollContainer}>
                <div className={styles.imageRow}>
                  {/* Imágenes existentes */}
                  {existingImageUrls.map((url, idx) => (
                    <div key={`existing-${idx}`} className={styles.imagePreview}>
                      <img src={url} alt={`Imagen ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(idx)}
                        className={styles.removeBtn}
                        title="Eliminar imagen"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {/* Previews de nuevas imágenes */}
                  {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className={styles.imagePreview}>
                      <img src={url} alt={`Nueva vista previa ${idx + 1}`} />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewImage(idx)}
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
                <span>No hay imágenes. Agrega al menos una.</span>
              </div>
            )}
            <p className={styles.hint}>Puedes tener hasta 5 imágenes en total (JPG, PNG, WebP).</p>
          </div>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.submitBtn} disabled={saving}>
          {saving ? "Guardando cambios..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
};

export default EditItemPage;