
// Models
export const MODEL_NANO_BANANA = 'gemini-2.5-flash-image'; // "Nano Banana"
export const MODEL_NANO_BANANA_PRO = 'gemini-3-pro-image-preview'; // "Nano Banana Pro"
export const MODEL_FLASH_EDIT = 'gemini-2.5-flash-image'; // For text-based editing

// Prompts
export const PROMPT_BASE_VTO = `
TASK:
Take the customer’s full-body photo (IMAGE_A) and replace their clothing with the garment shown in the catalog image (IMAGE_B).

REQUIREMENTS:
1. Preserve the customer’s face, hair, skin tone, hands, body shape, and natural proportions exactly as in IMAGE_A.
2. Apply the garment from IMAGE_B onto the customer’s body with correct alignment, pose matching, shoulder position, sleeve position, drape, and fabric flow.
3. Keep the garment’s original color, embroidery, shine, texture, and design exactly as in IMAGE_B.
4. Blend lighting and shadows so the outfit looks naturally worn by the customer without distortion or artifacts.
5. Maintain realism: no changes to the customer’s identity, background, or body except replacing clothing.
6. Output a photorealistic final image where the customer appears to be wearing the exact garment from IMAGE_B.
`;

export const PROMPT_QA_CHECK = `
Analyze the generated image for anatomical correctness, fabric realism, and mask adherence. 
Return a confidence score between 0.0 and 1.0 based on how realistic the try-on looks.
`;

export const CATALOG_FOLDERS = ['All', 'Suits', 'Casual', 'Streetwear', 'Formal', 'Dresses'];

// App Config
export const APP_NAME = "TailorPreview";
export const CURRENCY = "$";
