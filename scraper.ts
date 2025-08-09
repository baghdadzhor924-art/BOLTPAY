import axios from "axios";

const SERP_API_KEY = import.meta.env.VITE_SERP_API_KEY;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\u0621-\u064A\s]/gi, "") // Remove special characters
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

export async function scrapeProductData(productName: string) {
  try {
    const query = encodeURIComponent(productName);
    const serpUrl = https://serpapi.com/search.json?engine=google_shopping&q=${query}&hl=en&gl=us&api_key=${SERP_API_KEY};

    const response = await axios.get(serpUrl);

    if (!response.data.shopping_results || response.data.shopping_results.length === 0) {
      return { error: "No results found." };
    }

    const normalizedTarget = normalizeText(productName);
    let matchedProduct = null;

    for (const result of response.data.shopping_results) {
      const title = normalizeText(result.title || "");
      const price = result.extracted_price || null;

      // Check for high similarity
      if (title.includes(normalizedTarget) || normalizedTarget.includes(title)) {
        matchedProduct = {
          title: result.title,
          price: price ? ${price} ${result.currency || ""} : "Not available",
          link: result.link,
          image: result.thumbnail,
          source: result.source || "Unknown",
        };
        break;
      }
    }

    if (!matchedProduct) {
      return { error: "No matching product found." };
    }

    return matchedProduct;

  } catch (error) {
    console.error("Error fetching product data:", error);
    return { error: "Failed to fetch product data." };
  }
}