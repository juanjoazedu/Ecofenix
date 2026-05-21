// src/services/cloudinaryService.js
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Sube un solo archivo a Cloudinary usando fetch.
 * @param {File} file - Archivo a subir (desde input type="file")
 * @param {string} folder - Carpeta destino (ej: 'ecofenix/profiles', 'ecofenix/products')
 * @returns {Promise<string>} - URL segura de la imagen
 */
export const uploadFile = async (file, folder = 'ecofenix/general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Error al subir la imagen');
  }

  const data = await response.json();
  return data.secure_url;
};

/**
 * Sube múltiples archivos a Cloudinary en paralelo.
 * @param {File[]} files - Array de archivos
 * @param {string} folder - Carpeta destino (por defecto 'ecofenix/products')
 * @returns {Promise<string[]>} - Array de URLs seguras
 */
export const uploadFiles = async (files, folder = 'ecofenix/products') => {
  if (!files || files.length === 0) return [];
  const uploadPromises = files.map(file => uploadFile(file, folder));
  return await Promise.all(uploadPromises);
};

/**
 * (Opcional) Widget interactivo – se mantiene por compatibilidad,
 * pero no se usa en el nuevo flujo de subida diferida.
 */
export const uploadImages = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!window.cloudinary) {
      reject(new Error('Widget de Cloudinary no disponible. Revisa el script en index.html'));
      return;
    }

    const {
      folder = 'ecofenix/products',
      multiple = true,
      maxFiles = 5,
      cropping = false,
    } = options;

    let uploadedUrls = [];

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        folder: folder,
        multiple: multiple,
        maxFiles: maxFiles,
        cropping: cropping,
        sources: ['local', 'camera'],
        clientAllowedFormats: ['image', 'jpg', 'png', 'webp', 'jpeg'],
        maxFileSize: 5000000,
        showUploadMoreButton: true,
        showCompletedButton: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (result.event === 'success') {
          uploadedUrls.push(result.info.secure_url);
        }
        if (result.event === 'close') {
          widget.destroy();
          resolve(uploadedUrls);
        }
      }
    );

    widget.open();
  });
};