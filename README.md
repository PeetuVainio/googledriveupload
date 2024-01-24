# GoogleDriveUpload
- Tällä koodilla voit lähettää tiedostoja nettisivulta Google Driveen. Tiedostot menevät koodissa määriteltyyn kansioon Google Drivessä. Tarvitset myös Google Cloud projektin, johon sinun sinun täytyy lisätä Service Account Email. Tiedostot lähetetään Google Driveen Service Accountin Emailin kautta. Lisää muokkaaja oikeudet Service Accountin Emailille kansioon, jonne haluat tiedostojen latautuvan.
- Lisäksi tarvitset Credentials.json filen tekemällä API Keyn Service Account Emailiin Google Cloudissa. Kun olet tehnyt tämän, .json päätteinen tiedosto pitäisi latautua koneellesi. Nimeä tämä tiedosto key.json nimellä. Liitä key.json backend kansioon.
- Lisää vielä lopuksi Google Drive kansiosi ID upload.js fileen.
  ```
      const response = await drive.files.create({
        requestBody: {
          name: file.originalname,
          mimeType: file.mimetype,
          parents: ['Lisää tähän kansion ID']  // Tämä on Google Driven kohdekansion ID
        },
        media: {
          body: fs.createReadStream(file.path)
        }
      });
  ```

## kaikki terminal komennot järjestyksessä

- npx create-react-app my-app
- cd my-app
- cd backend
- npm init -y
- npm i express cors multer googleapis
- node upload.js
- npm start
