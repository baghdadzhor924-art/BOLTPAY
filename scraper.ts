import axios from "axios";
import stringSimilarity from "string-similarity";

const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY;
const AMAZON_API_KEY = import.meta.env.VITE_AMAZON_API_KEY;
const EBAY_API_KEY = import.meta.env.VITE_EBAY_API_KEY;

interface ProductResult {
  title?: string;
  price?: string;
  link?: string;
  image?: string;
  source?: string;
  error?: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0621-\u064A\s]/gi, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

async function fetchFromSerpApi(productName: string): Promise<ProductResult> {
  if (!SERP_API_KEY || SERP_API_KEY === 'your_actual_serp_key_here') {
    return { error: "SerpAPI key not configured." };
  }

  const query = encodeURIComponent(productName);
  const serpUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&hl=en&gl=us&api_key=${SERP_API_KEY}`;

  try {
    console.log(`🔍 Fetching from SerpAPI: ${productName}`);
    const response = await axios.get(serpUrl);

    // Check if response is valid JSON object
    if (typeof response.data !== "object" || response.data === null) {
      return { error: "Invalid API response. Check your API key or parameters." };
    }

    // Check for API errors
    if (response.data.error) {
      return { error: `SerpAPI Error: ${response.data.error}` };
    }

    if (!response.data.shopping_results || response.data.shopping_results.length === 0) {
      return { error: "No results found from SerpAPI." };
    }

    const normalizedTarget = normalizeText(productName);
    console.log(`🎯 Looking for matches for: "${normalizedTarget}"`);

    // Find best match using string similarity
    let bestMatch = null;
    let bestSimilarity = 0;

    for (const result of response.data.shopping_results) {
      const title = normalizeText(result.title || "");
      const similarity = stringSimilarity.compareTwoStrings(title, normalizedTarget);
      
      console.log(`📊 Similarity: ${similarity.toFixed(3)} for "${result.title}"`);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = result;
      }
    }

    // Accept matches with similarity > 0.8
    if (bestMatch && bestSimilarity > 0.8) {
      const price = bestMatch.extracted_price || bestMatch.price;
      
      console.log(`✅ Found match with ${(bestSimilarity * 100).toFixed(1)}% similarity`);
      
      return {
        title: bestMatch.title,
        price: price ? `${price} ${bestMatch.currency || ""}`.trim() : "Not available",
        link: bestMatch.link,
        image: bestMatch.thumbnail,
        source: bestMatch.source || "Google Shopping",
      };
    }

    return { error: `No matching product found in SerpAPI results. Best similarity: ${(bestSimilarity * 100).toFixed(1)}%` };

  } catch (error) {
    console.error("❌ Error fetching from SerpAPI:", error);
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return { error: "Invalid SerpAPI key. Please check your API key." };
      } else if (error.response?.status === 429) {
        return { error: "SerpAPI rate limit exceeded. Please try again later." };
      } else {
        return { error: `SerpAPI request failed: ${error.response?.status || 'Network error'}` };
      }
    }
    return { error: "Failed to fetch product data from SerpAPI." };
  }
}

async function fetchFromAmazonApi(productName: string): Promise<ProductResult> {
  if (!AMAZON_API_KEY || AMAZON_API_KEY === 'your_amazon_api_key_here') {
    return { error: "Amazon API key not configured." };
  }

  try {
    console.log(`🛒 Attempting Amazon API fallback for: ${productName}`);
    
    // Amazon Product Advertising API implementation would go here
    // This is a placeholder for the actual Amazon API integration
    // You would need to implement the Amazon Product Advertising API calls
    
    // For now, return an error indicating it's not implemented
    return { error: "Amazon API integration not fully implemented yet." };
    
  } catch (error) {
    console.error("❌ Error fetching from Amazon API:", error);
    return { error: "Failed to fetch product data from Amazon API." };
  }
}

async function fetchFromEbayApi(productName: string): Promise<ProductResult> {
  if (!EBAY_API_KEY || EBAY_API_KEY === 'your_ebay_api_key_here') {
    return { error: "eBay API key not configured." };
  }

  try {
    console.log(`🏪 Attempting eBay API fallback for: ${productName}`);
    
    // eBay Finding API implementation would go here
    // This is a placeholder for the actual eBay API integration
    
    // Basic eBay Finding API call structure:
    const ebayUrl = `https://svcs.ebay.com/services/search/FindingService/v1`;
    const params = {
      'OPERATION-NAME': 'findItemsByKeywords',
      'SERVICE-VERSION': '1.0.0',
      'SECURITY-APPNAME': EBAY_API_KEY,
      'RESPONSE-DATA-FORMAT': 'JSON',
      'REST-PAYLOAD': '',
      'keywords': productName,
      'paginationInput.entriesPerPage': '5'
    };

    // For now, return an error indicating it's not fully implemented
    return { error: "eBay API integration not fully implemented yet." };
    
  } catch (error) {
    console.error("❌ Error fetching from eBay API:", error);
    return { error: "Failed to fetch product data from eBay API." };
  }
}

export async function scrapeProductData(productName: string): Promise<ProductResult> {
  console.log(`🚀 Starting product search for: "${productName}"`);
  
  if (!productName || productName.trim().length === 0) {
    return { error: "Product name is required and cannot be empty." };
  }

  // Try SerpAPI first
  console.log(`📡 Step 1: Trying SerpAPI...`);
  let result = await fetchFromSerpApi(productName);
  
  if (!result.error) {
    console.log(`✅ SerpAPI success: Found "${result.title}"`);
    return result;
  }
  
  console.log(`⚠️ SerpAPI failed: ${result.error}`);

  // Fallback to Amazon API if SerpAPI fails or no match
  console.log(`📡 Step 2: Trying Amazon API fallback...`);
  result = await fetchFromAmazonApi(productName);
  if (!result.error) {
    console.log(`✅ Amazon API success: Found "${result.title}"`);
    return result;
  }
  
  console.log(`⚠️ Amazon API failed: ${result.error}`);

  // Fallback to eBay API
  console.log(`📡 Step 3: Trying eBay API fallback...`);
  result = await fetchFromEbayApi(productName);
  if (!result.error) {
    console.log(`✅ eBay API success: Found "${result.title}"`);
    return result;
  }
  
  console.log(`⚠️ eBay API failed: ${result.error}`);

  // If all APIs fail, return a comprehensive error
  console.log(`❌ All APIs failed for: "${productName}"`);
  return { 
    error: `Unable to find product data for "${productName}". All data sources failed. Please check your API keys and try again.` 
  };
}