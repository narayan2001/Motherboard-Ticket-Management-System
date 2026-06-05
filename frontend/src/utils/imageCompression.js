/**
 * Compress image file to reduce size and memory usage
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.8,
    maxSizeMB = 1
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          // Calculate new dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }
          
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }
              
              // Check if compressed size is acceptable
              const compressedSizeMB = blob.size / (1024 * 1024);
              
              // If still too large, try with lower quality
              if (compressedSizeMB > maxSizeMB && quality > 0.5) {
                // Recursively compress with lower quality
                const lowerQuality = Math.max(0.5, quality - 0.1);
                canvas.toBlob(
                  (retryBlob) => {
                    const compressedFile = new File(
                      [retryBlob], 
                      file.name.replace(/\.\w+$/, '.jpg'),
                      { type: 'image/jpeg' }
                    );
                    resolve(compressedFile);
                  },
                  'image/jpeg',
                  lowerQuality
                );
              } else {
                // Create new file from blob
                const compressedFile = new File(
                  [blob], 
                  file.name.replace(/\.\w+$/, '.jpg'),
                  { type: 'image/jpeg' }
                );
                resolve(compressedFile);
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target.result;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Compress multiple images
 * @param {FileList|Array} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<Array>} - Array of compressed files
 */
export const compressImages = async (files, options = {}) => {
  const fileArray = Array.from(files);
  const compressedFiles = [];
  
  for (const file of fileArray) {
    try {
      const compressed = await compressImage(file, options);
      compressedFiles.push(compressed);
    } catch (error) {
      console.error('Error compressing image:', file.name, error);
      // If compression fails, use original file
      compressedFiles.push(file);
    }
  }
  
  return compressedFiles;
};
