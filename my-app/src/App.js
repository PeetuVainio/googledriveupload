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
  // Luodaan tilamuuttuja hallitsemaan "Kopioi linkki" -napin tilaa
  const [copyButtonState, setCopyButtonState] = useState({});

  // Käsittelijäfunktio tiedoston lataamiseksi Google Driveen
  const handleFileUpload = async () => {
    // Haetaan tiedostot tiedostokentästä
    const files = fileInputRef.current.files;

    // Tarkistetaan, onko valittuna tiedostoa
    if (files.length !== 1) {
      alert("Lisää tiedosto!"); // Näytetään ilmoitus, jos valittuna ei ole tiedostoa
      return;
    }

    // Estetään "Lähetä Tiedosto" -painikkeen painaminen latauksen aikana
    setDisableButton(true);

    // Luodaan FormData-objekti tiedoston lähettämistä varten
    const formData = new FormData();
    formData.append('files', files[0]);

    try {
      setLoading(true); // Asetetaan lataustila päälle

      setSuccessMessage(null);
      setDriveLinks([]);

      // Lähetetään POST-pyyntö tiedoston lataamiseksi palvelimelle
      const response = await fetch("http://localhost:5000/upload", {
        method: 'POST',
        body: formData
      });

      // Käsitellään palvelimen vastaus JSON-muodossa
      const data = await response.json();
      console.log("Tiedosto lähetetty onnistuneesti");
      console.log("Palvelimen vastaus:", data.files);

      // Haetaan Google Drive -linkit palvelimen vastauksesta
      const links = data.files.map(file => file.webViewLink);
      setDriveLinks(links);

      // Asetetaan onnistumisviesti sen mukaan, montako tiedostoa lähetettiin
      if (files.length === 1) {
        setSuccessMessage(`Tiedosto "${data.files[0].name}" lähetetty Google Driveen`);
      }

      // Tyhjennetään tiedostokenttä
      fileInputRef.current.value = "";

    } catch (error) {
      console.error("Virhe:", error);
    } finally {
      setLoading(false); // Asetetaan lataustila pois päältä
      // Sallitaan "Lähetä Tiedosto" -painikkeen painaminen uudelleen
      setDisableButton(false);
    }
  };

  // Käsittelijäfunktio linkin kopioimiseksi leikepöydälle
  const copyToClipboard = (link, index) => {
    navigator.clipboard.writeText(link);
    // Asetetaan napin tila muuttuneeksi
    setCopyButtonState({ ...copyButtonState, [index]: true });
    // Palautetaan napin alkuperäinen tila 3 sekunnin kuluttua
    setTimeout(() => {
      setCopyButtonState({ ...copyButtonState, [index]: false });
    }, 3000);
  };

  return (
    <div className="App">
      <h1>Lähetä Tiedosto Google Driveen</h1>
      
      {/* Tiedostokenttä */}
      <input className="selectfilesbox" type="file" ref={fileInputRef} />
      
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
              <li key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer">{link}</a>
                <button 
                  className="kopioilinkkibutton"
                  onClick={() => copyToClipboard(link, index)}
                  disabled={copyButtonState[index]} // Estetään nappia, jos se on jo kopioitu
                >
                  {copyButtonState[index] ? 'Linkki kopioitu!' : 'Kopioi linkki'}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
