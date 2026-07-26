"use client";

/**
 * Sube un archivo directo a Cloudinary desde el navegador usando una firma
 * emitida por /api/cloudinary/sign. El binario nunca pasa por nuestro
 * servidor; a la DB solo le llega la URL resultante.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder = "properties",
): Promise<{ url: string; publicId: string }> {
  const signResponse = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!signResponse.ok) {
    throw new Error("No se pudo firmar la subida a Cloudinary");
  }

  const { timestamp, signature, apiKey, cloudName } = await signResponse.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!uploadResponse.ok) {
    throw new Error("No se pudo subir la imagen a Cloudinary");
  }

  const uploaded = await uploadResponse.json();
  return { url: uploaded.secure_url as string, publicId: uploaded.public_id as string };
}
