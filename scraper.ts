export async function scrapeProductWithBrowseAI(url: string) {
  const response = await fetch('https://api.browse.ai/v2/scraper', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_BROWSE_AI_API_KEY}`
    },
    body: JSON.stringify({ url })
  });
  if (!response.ok) throw new Error('فشل في استخراج بيانات المنتج');
  return await response.json();
}