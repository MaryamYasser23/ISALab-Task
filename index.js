require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HUBSPOT_TOKEN = process.env.HUBSPOT_API_KEY;
const CUSTOM_OBJECT_NAME = process.env.CUSTOM_OBJECT_NAME || '2-194504732';

// Middlewares
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Helper: HubSpot API base
const HUBSPOT_BASE = 'https://api.hubapi.com';

// ROUTE: Homepage - عرض كل الـ records
app.get('/', async (req, res) => {
  try {
    // GET objects
    const url = `${HUBSPOT_BASE}/crm/v3/objects/${CUSTOM_OBJECT_NAME}?limit=100&properties=name,description`;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
      },
    });

    const items = response.data.results || [];
    res.render('homepage', { title: 'Custom Objects Table', items });
  } catch (error) {
    console.error('Error fetching objects:', error.response ? error.response.data : error.message);
    res.render('homepage', { title: 'Custom Objects Table', items: [], error: 'Failed to fetch data from HubSpot. Check console.' });
  }
});

// ROUTE: GET form page
app.get('/update-cobj', (req, res) => {
  res.render('updates', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// ROUTE: POST form submit - create a new CRM record
app.post('/update-cobj', async (req, res) => {
  const { name, description } = req.body;

  try {
    const url = `${HUBSPOT_BASE}/crm/v3/objects/${CUSTOM_OBJECT_NAME}`;
    await axios.post(
      url,
      { properties: { name, description } },
      { headers: { Authorization: `Bearer ${HUBSPOT_TOKEN}`, 'Content-Type': 'application/json' } }
    );

    return res.redirect('/');
  } catch (error) {
    console.error('Error creating object:', error.response ? error.response.data : error.message);
    return res.status(500).send('Error creating record. Check server console for details.');
  }
});

app.get('/schemas', async (req, res) => {
  try {
    const response = await hubspotClient.crm.schemas.coreApi.getAll();
    res.json(response.results);
  } catch (err) {
    console.error('Error fetching schemas:', err.response?.body || err);
    res.status(500).json({ error: err.message });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
