// Código correcto para la función toDirectDriveUrl
// Reemplaza esta función en FormEmpresa.js

function toDirectDriveUrl(url) {
  if (!url) return url;
  // Expresión regular corregida para capturar solo el ID del archivo
  const match = url.match(/https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view/);
  if (match) {
    // match[1] ahora contiene solo el ID limpio, sin el '/view'
    return `https://drive.google.com/uc?export=view&id=${match[1]}`;
  }
  console.log('URL de imagen procesada:', url);
  return url;
}
