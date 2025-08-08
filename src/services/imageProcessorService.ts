export async function processImages(images: string[]): Promise<string[]> {
  try {
    const removeApiKey = import.meta.env.VITE_REMOVE_BG_API_KEY;
    
    if (removeApiKey && removeApiKey !== 'your_actual_remove_bg_key_here') {
      return await processWithRemoveBg(images, removeApiKey);
    }
    
    // Return optimized versions of original images
    return optimizeImages(images);
    
  } catch (error) {
    console.warn('⚠️ Image processing failed, using original images:', error);
    return optimizeImages(images);
  }
}

async function processWithRemoveBg(images: string[], apiKey: string): Promise<string[]> {
  const processedImages = await Promise.all(
    images.slice(0, 3).map(async (imageUrl) => { // Limit to 3 images to save API calls
      try {
        const response = await fetch('https://api.remove.bg/v1.0/removebg', {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_url: imageUrl,
            size: 'auto',
            format: 'png'
          })
        });

        if (!response.ok) {
          throw new Error(`Remove.bg API error: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
        return `data:image/png;base64,${base64}`;
        
      } catch (error) {
        console.warn('Failed to process image:', imageUrl, error);
        return addImageOptimization(imageUrl);
      }
    })
  );

  return processedImages;
}

function optimizeImages(images: string[]): string[] {
  return images.map(imageUrl => addImageOptimization(imageUrl));
}

function addImageOptimization(imageUrl: string): string {
  // Add optimization parameters for common image services
  if (imageUrl.includes('pexels.com')) {
    return imageUrl.includes('?') 
      ? `${imageUrl}&auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`
      : `${imageUrl}?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
  }
  
  if (imageUrl.includes('unsplash.com')) {
    return imageUrl.includes('?')
      ? `${imageUrl}&auto=format&fit=crop&w=800&h=600&q=80`
      : `${imageUrl}?auto=format&fit=crop&w=800&h=600&q=80`;
  }
  
  // For other images, return as-is
  return imageUrl;
}