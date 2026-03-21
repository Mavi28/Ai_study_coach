import pdfParse from 'pdf-parse';
import fs from 'fs';

// ⚡ MEMORY-OPTIMIZED: Smaller, fewer chunks
const splitTextIntoChunks = (text, chunkSize = 500, overlap = 50) => {
  const chunks = [];
  let startIndex = 0;
  let chunkCount = 0;
  const maxChunks = 100; // LIMIT to 100 chunks max
  
  while (startIndex < text.length && chunkCount < maxChunks) {
    const endIndex = Math.min(startIndex + chunkSize, text.length);
    const chunk = text.substring(startIndex, endIndex).trim();
    
    if (chunk.length > 30) {
      chunks.push({
        text: chunk,
      });
      chunkCount++;
    }
    
    startIndex = endIndex - overlap;
  }
  
  return chunks.length > 0 ? chunks : [{ text: text.substring(0, 1000) }];
};

// ⚡ FAST: Simple topic extraction
const extractTopics = (text) => {
  try {
    const words = text
      .toLowerCase()
      .match(/\b\w{6,}\b/g) || [];
    
    const freq = {};
    for (let i = 0; i < Math.min(words.length, 1000); i++) {
      const w = words[i];
      freq[w] = (freq[w] || 0) + 1;
    }
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([w]) => w);
  } catch (err) {
    return ['document'];
  }
};

// ⚡ Memory-optimized PDF extraction
export const extractTextFromPDF = async (filePath) => {
  try {
    console.log(`🚀 Extracting PDF: ${filePath}`);
    
    // Timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('PDF timeout')), 60000)
    );

    // Read file
    const fileBuffer = fs.readFileSync(filePath);
    console.log(`📄 Size: ${(fileBuffer.length / 1024 / 1024).toFixed(2)}MB`);
    
    // Parse PDF with timeout
    const pdfData = await Promise.race([
      pdfParse(fileBuffer),
      timeoutPromise
    ]);
    
    // LIMIT text to first 50KB to save memory
    const text = pdfData.text.substring(0, 50000);
    
    console.log(`✅ Extracted ${pdfData.numpages} pages, ${text.length} chars`);
    
    return {
      text,
      pages: pdfData.numpages,
    };
  } catch (error) {
    console.error('❌ PDF error:', error.message);
    throw error;
  }
};

// ⚡ Memory-optimized processing
export const processPDF = async (filePath) => {
  try {
    console.log(`⚡ Processing: ${filePath}`);
    const startTime = Date.now();
    
    const { text, pages } = await extractTextFromPDF(filePath);
    
    if (!text || text.trim().length === 0) {
      throw new Error('PDF is empty');
    }

    console.log('✂️ Creating chunks...');
    const chunks = splitTextIntoChunks(text, 500, 50);
    
    console.log('🏷️ Extracting topics...');
    const topics = extractTopics(text);
    
    const time = Date.now() - startTime;
    console.log(`✅ Done in ${time}ms: ${chunks.length} chunks`);
    
    return {
      fullText: text,
      chunks,
      totalPages: pages,
      totalChunks: chunks.length,
      topics: topics.length > 0 ? topics : ['document'],
    };
  } catch (error) {
    console.error('❌ Processing error:', error.message);
    throw error;
  }
};

export default {
  extractTextFromPDF,
  processPDF,
};