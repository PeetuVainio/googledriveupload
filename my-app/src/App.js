import './App.css';
import React, { useRef, useState } from 'react';

function App() {
  // Luodaan viittaus tiedostokenttään
  const fileInputRef = useRef(null);
  // Luodaan tilamuuttuja lataustilan seuraamiseksi
  const [loading, setLoading] = useState(false);
  // Luodaan tilamuuttuja onnistumisviestin seuraamiseksi
  const [successMessage, setSuccessMessage] = useState(null);
  // Luodaan tilamuuttuja Google Drive -linkkien seuraamiseksi
  const [driveLinks, setDriveLinks] = useState([]);
  // Luodaan tilamuuttuja estämään "Lähetä Tiedosto" -painikkeen painaminen latauksen aikana
  const [disableButton, setDisableButton] = useState(false);

  // Käsittelijäfunktio tiedoston lataamiseksi Google Driveen
  const handleFileUpload = async () => {
    // Haetaan tiedostot tiedostokentästä
    const files = fileInputRef.current.files;

    // Tarkistetaan, onko valittuna vain yksi tiedosto
    if (files.length !== 1) {
      alert("Lähetä vain yksi tiedosto kerrallaan!"); // Näytetään ilmoitus, jos valittuna on useampi tiedosto
      return;
    }

    // Estetään "Lähetä Tiedosto" -painikkeen painaminen latauksen aikana
    setDisableButton(true);

    // Luodaan FormData-objekti tiedoston lähettämistä varten
    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      setLoading(true); // Asetetaan lataustila päälle

      // Lähetetään POST-pyyntö tiedoston lataamiseksi palvelimelle
      const response = await fetch("http://localhost:5000/upload", {
        method: 'POST',
        body: formData
      });

      // Käsitellään palvelimen vastaus JSON-muodossa
      const data = await response.json();
      console.log("Palvelimen vastaus:", data.files);

      // Haetaan Google Drive -linkit palvelimen vastauksesta
      const links = data.files.map(file => file.webViewLink);
      setDriveLinks(links);

      // Asetetaan onnistumisviesti sen mukaan, montako tiedostoa lähetettiin
      if (files.length === 1) {
        setSuccessMessage(`Tiedosto '${data.files[0].name}' lähetetty Google Driveen`);
      }

      // Tyhjennetään tiedostokenttä
      fileInputRef.current.value = "";

      // Piilotetaan onnistumisviesti ja Google Drive -linkit 10 sekunnin kuluttua
      /*
      setTimeout(() => {
        setSuccessMessage(null);
        setDriveLinks([]);
      }, 10000);
      */
    } catch (error) {
      console.error("Virhe:", error);
    } finally {
      setLoading(false); // Asetetaan lataustila pois päältä
      // Sallitaan "Lähetä Tiedosto" -painikkeen painaminen uudelleen
      setDisableButton(false);
    }
  };

  // Palautetaan JSX-rakenne
  return (
    <div className="App">
      <h1>Lähetä Tiedosto Google Driveen</h1>
      
      {/* Tiedostokenttä */}
      <input className="selectfilesbox" type="file" ref={fileInputRef} /><br/><br/>
      
      {/* Lataa tiedosto -painike */}
      <button 
        className={`uploadsubmitbutton ${loading ? 'loading' : ''}`}
        onClick={handleFileUpload}
        disabled={disableButton} // Estetään painike, kun lataus on käynnissä
      >
        {loading ? 'Lähetetään Tiedostoa...' : 'Lähetä Tiedosto'}
      </button>

      {/* Näytä latausikoni, jos lataus on käynnissä */}
      {loading && (
        <div className="loadingcircle-container">
          <div className="loadingcircle"></div>
        </div>
      )}

      {/* Näytä onnistumisviesti, jos se on käytettävissä */}
      {successMessage}

      {/* Näytä Google Drive -linkit */}
      {driveLinks.length > 0 && (
        <div>
          <p>Google Drive linkki:</p>
          <ul>
            {/* Luo lista Google Drive -linkeistä */}
            {driveLinks.map((link, index) => (
              <li key={index}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
