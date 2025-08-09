import { ProcessedMedia, ImageAnalysis, APIResponse } from '../types';

export class MediaProcessingService {
  private removeBgApiKey: string;
  private cloudinaryUrl: string;

  constructor() {
    this.removeBgApiKey = import.meta.env.VITE_REMOVE_BG_API_KEY || '';
    this.cloudinaryUrl = import.meta.env.VITE_CLOUDINARY_URL || '';
  }

  async processMedia(imageUrls: string[], analyses: ImageAnalysis[]): Promise<APIResponse<ProcessedMedia[]>> {
    try {
      console.log(`🖼️ Processing ${imageUrls.length} media files...`);
      
      const processingPromises = imageUrls.map((url, index) => 
        this.processImage(url, analyses[index])
      );
      
      const results = await Promise.allSettled(processingPromises);
      const processedMedia: ProcessedMedia[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success) {
          processedMedia.push(result.value.data!);
        } else {
          const error = result.status === 'rejected' ? result.reason : result.value.error;
          errors.push(`Image ${index + 1}: ${error}`);
          
          // Add fallback processed media
          processedMedia.push(this.createFallbackMedia(imageUrls[index], analyses[index]));
        }
      });

      return {
        success: true,
        data: processedMedia,
        usage: {
          requests: imageUrls.length,
          tokens: processedMedia.length * 25
        }
      };

    } catch (error) {
      console.error('❌ Media processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: imageUrls.map((url, index) => this.createFallbackMedia(url, analyses[index]))
      };
    }
  }

  private async processImage(imageUrl: string, analysis: ImageAnalysis): Promise<APIResponse<ProcessedMedia>> {
    try {
      const processedMedia: ProcessedMedia = {
        original: imageUrl,
        processed: imageUrl,
        cloudinaryUrl: imageUrl,
        optimized: imageUrl,
        analysis
      };

      // Step 1: Remove background if API is available and image is suitable
      if (this.shouldRemoveBackground(analysis)) {
        const backgroundRemovedUrl = await this.removeBackground(imageUrl);
        if (backgroundRemovedUrl) {
          processedMedia.backgroundRemoved = backgroundRemovedUrl;
          processedMedia.processed = backgroundRemovedUrl;
        }
      }

      // Step 2: Upload to Cloudinary and optimize
      const cloudinaryUrl = await this.uploadToCloudinary(processedMedia.processed);
      if (cloudinaryUrl) {
        processedMedia.cloudinaryUrl = cloudinaryUrl;
        processedMedia.optimized = this.generateOptimizedUrl(cloudinaryUrl);
      }

      return {
        success: true,
        data: processedMedia
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Processing failed',
        data: this.createFallbackMedia(imageUrl, analysis)
      };
    }
  }

  private shouldRemoveBackground(analysis: ImageAnalysis): boolean {
    // Remove background for product images with high confidence
    if (!analysis.isProductImage || analysis.confidence < 0.7) {
      return false;
    }

    // Check if image likely has a background that should be removed
    const productLabels = ['product', 'object', 'item', 'device', 'tool'];
    const hasProductLabels = analysis.labels.some(label => 
      productLabels.some(productLabel => 
        label.toLowerCase().includes(productLabel)
      )
    );

    return hasProductLabels;
  }

  private async removeBackground(imageUrl: string): Promise<string | null> {
    if (!this.removeBgApiKey || this.removeBgApiKey === 'your_actual_remove_bg_key_here') {
      console.log('⚠️ Remove.bg API key not configured, skipping background removal');
      return null;
    }

    try {
      const response = await fetch('https://api.remove.bg/v1.0/removebg', {
        method: 'POST',
        headers: {
          'X-Api-Key': this.removeBgApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: imageUrl,
          size: 'auto',
          format: 'png',
          type: 'product'
        })
      });

      if (!response.ok) {
        throw new Error(`Remove.bg API error: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const dataUrl = `data:image/png;base64,${base64}`;
      
      console.log('✅ Background removed successfully');
      return dataUrl;

    } catch (error) {
      console.warn('⚠️ Background removal failed:', error);
      return null;
    }
  }

  private async uploadToCloudinary(imageUrl: string): Promise<string | null> {
    if (!this.cloudinaryUrl || this.cloudinaryUrl === 'your_cloudinary_url_here') {
      console.log('⚠️ Cloudinary URL not configured, using original URL');
      return null;
    }

    try {
      // Extract Cloudinary credentials from URL
      const cloudinaryConfig = this.parseCloudinaryUrl(this.cloudinaryUrl);
      if (!cloudinaryConfig) {
        throw new Error('Invalid Cloudinary URL format');
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`;
      
      const formData = new FormData();
      formData.append('file', imageUrl);
      formData.append('upload_preset', 'landing_pages'); // You'll need to create this preset
      formData.append('folder', 'landing-pages');
      formData.append('quality', 'auto');
      formData.append('fetch_format', 'auto');

      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Cloudinary upload error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Image uploaded to Cloudinary');
      return data.secure_url;

    } catch (error) {
      console.warn('⚠️ Cloudinary upload failed:', error);
      return null;
    }
  }

  private parseCloudinaryUrl(url: string): { cloudName: string; apiKey: string; apiSecret: string } | null {
    try {
      // Expected format: cloudinary://api_key:api_secret@cloud_name
      const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      if (!match) return null;

      return {
        apiKey: match[1],
        apiSecret: match[2],
        cloudName: match[3]
      };
    } catch {
      return null;
    }
  }

  private generateOptimizedUrl(cloudinaryUrl: string): string {
    // Add Cloudinary transformations for optimization
    const transformations = [
      'f_auto', // Auto format
      'q_auto', // Auto quality
      'w_800', // Max width 800px
      'h_600', // Max height 600px
      'c_fit', // Fit within bounds
      'dpr_auto' // Auto DPR
    ].join(',');

    // Insert transformations into Cloudinary URL
    return cloudinaryUrl.replace('/upload/', `/upload/${transformations}/`);
  }

  private createFallbackMedia(imageUrl: string, analysis: ImageAnalysis): ProcessedMedia {
    // Create optimized URL for common image services
    let optimizedUrl = imageUrl;
    
    if (imageUrl.includes('pexels.com')) {
      optimizedUrl = imageUrl.includes('?') 
        ? `${imageUrl}&auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`
        : `${imageUrl}?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;
    } else if (imageUrl.includes('unsplash.com')) {
      optimizedUrl = imageUrl.includes('?')
        ? `${imageUrl}&auto=format&fit=crop&w=800&h=600&q=80`
        : `${imageUrl}?auto=format&fit=crop&w=800&h=600&q=80`;
    }

    return {
      original: imageUrl,
      processed: imageUrl,
      cloudinaryUrl: imageUrl,
      optimized: optimizedUrl,
      analysis
    };
  }

  async generateProductVideos(processedMedia: ProcessedMedia[]): Promise<string[]> {
    // This would integrate with video generation services
    // For now, return empty array
    console.log('📹 Video generation not implemented yet');
    return [];
  }

  async generateProductGifs(processedMedia: ProcessedMedia[]): Promise<string[]> {
    // This would create animated GIFs from product images
    // For now, return empty array
    console.log('🎬 GIF generation not implemented yet');
    return [];
  }
}