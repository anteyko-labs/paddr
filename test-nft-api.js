// Простой тест для проверки NFT API
const testTokenId = "1";

console.log("Testing NFT metadata API...");

// Тестируем API
fetch(`http://localhost:3000/api/nft-metadata/${testTokenId}`)
  .then(response => response.json())
  .then(data => {
    console.log("✅ API Response:");
    console.log(JSON.stringify(data, null, 2));
    
    if (data.image && data.image.includes('video530750461626132318')) {
      console.log("✅ Video URL is correct!");
    } else {
      console.log("❌ Video URL is incorrect!");
    }
  })
  .catch(error => {
    console.error("❌ API Error:", error);
  });
