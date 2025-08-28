const axios = require('axios');
const Cookies = require('js-cookie');

// Simular um token válido (você precisará obter um token real)
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGFmMGQ0NTIxMWRhNGU2YjZkNjE4MmUiLCJpYXQiOjE3NTY0MTIxNzMsImV4cCI6MTc1NjQ5ODU3M30.example'; // Token de exemplo

async function testAPI() {
  try {
    console.log('Testando API /api/appointments...');
    
    const response = await axios.get('http://localhost:5000/api/appointments?page=1&limit=10', {
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('Erro na requisição:', error.response?.status);
    console.error('Mensagem:', error.response?.data);
    console.error('Headers:', error.response?.headers);
  }
}

testAPI();