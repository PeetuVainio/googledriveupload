const express = require('express');
const { google } = require('googleapis');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Määritellään multer-tiedostojen tallennuspaikka ja nimeäminen
const storage = multer.diskStorage({
  // destination: 'uploads',  // Tallennuskansio
  filename: function (req, file, callback) {
    const extension = file.originalname.split(".").pop();  // Haetaan tiedoston tiedostopääte
    callback(null, `${file.fieldname}-${Date.now()}.${extension}`);  // Luodaan tiedostonimi lisäämällä aikaleima
  }
});

// Luodaan multer-tiedoston latausobjekti käyttäen määriteltyä tallennuspaikkaa
const upload = multer({ storage: storage });

app.use(cors());

app.get('/', (req, res) => {
  res.send('Toimii');  // Palautetaan vastaus "Toimii" selaimelle
});

// Määritellään käsittelijä '/upload' reitille (POST-pyyntö)
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    // Luodaan Google Auth -objekti käyttäen API-avaintiedostoa ja Drive-oikeuksia
    const auth = new google.auth.GoogleAuth({
      keyFile: "key.json",  // API-avaintiedosto
      scopes: ["https://www.googleapis.com/auth/drive"]  // Oikeudet Google Driveen
    });

    // Luodaan Drive-objekti, joka käyttää autentikointia
    const drive = google.drive({
      version: 'v3',
      auth
    });

    // Alustetaan tyhjä taulukko tallennetuille tiedostoille
    const uploadedFiles = [];

    // Käydään läpi jokainen lähetetty tiedosto ja tallennetaan se Google Driveen
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      // Luodaan uusi tiedosto Google Drivessa
      const response = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
          parents: ['1SaGqdyp_7Hu1h9MkNJJ3MQxXjPZDI7cJ']  // Tämä on Google Driven kohdekansion ID
        },
        media: {
          body: fs.createReadStream(file.path)
        }
      });

      // Muodostetaan Google Drive -linkki tiedoston ID:n avulla
      const fileID = response.data.id;
      const webViewLink = `https://drive.google.com/file/d/${fileID}/view`;

      // Lisätään tiedoston tiedot taulukkoon
      const uploadedFile = { ...response.data, webViewLink };
      uploadedFiles.push(uploadedFile);
    }

    // Lähetetään vastaus selaimelle JSON-muodossa
    res.json({ files: uploadedFiles });

  } catch (error) {
    // Näytetään virhe konsolissa ja lähetetään virheilmoitus selaimelle
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Sovellus kuuntelee porttia 5000
app.listen(5000, () => {
  console.log("App is listening on port 5000");
});
