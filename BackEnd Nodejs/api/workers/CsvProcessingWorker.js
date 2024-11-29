const fs = require('fs');
const fastcsv = require('fast-csv');
const path = require('path');

class CsvProcessingWorker {
  constructor(filePath, namefile) {
    this.filePath = filePath;
    this.namefile = namefile;
  }

  // Fonction pour supprimer les doublons
  removeDuplicates(data) {
    const seen = new Set();
    return data.filter(item => {
      const serializedItem = JSON.stringify(item); // Sérialiser pour comparaison
      if (seen.has(serializedItem)) {
        return false; // Ignorer les doublons
      }
      seen.add(serializedItem);
      return true;
    });
  }

  process() {
    return new Promise((resolve, reject) => {
      const data = [];
      const outputDir = path.join(__dirname, '../../', 'output');  // Dossier où sauvegarder le fichier CSV généré

      // Créer le dossier de sortie si il n'existe pas
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });  // Crée le répertoire et les sous-répertoires nécessaires
      }

      // Créer un flux de lecture pour analyser le CSV
      fs.createReadStream(this.filePath)
        // Enlever les caractères BOM (Byte Order Mark) invisibles au début du fichier
        .pipe(new require('stream').Transform({
          transform(chunk, encoding, callback) {
            this.push(chunk.toString().replace(/^\uFEFF/, '')); // Enlever le BOM
            callback();
          }
        }))
        .pipe(fastcsv.parse({
          headers: true,
          skipEmpty: true,
          delimiter: ';', // Délimiteur ici, ajustez à ',' selon votre format
        }))
        .on('data', (row) => {
          data.push(row);  // Ajouter chaque ligne traitée dans 'data'
        })
        .on('end', () => {
          // Supprimer les doublons des résultats
          const cleanedData = this.removeDuplicates(data);

          // Générer le chemin du fichier CSV nettoyé
          const finalOutputPath = path.join(outputDir, `${this.namefile}-cleaned.csv`);
          const writeStream = fs.createWriteStream(finalOutputPath);
          const csvStream = fastcsv.format({ headers: true });

          // Écrire les données nettoyées dans le fichier CSV
          csvStream.pipe(writeStream)
            .on('finish', () => {
              resolve({
                data: cleanedData,
                csvPath: finalOutputPath,
              });
            })
            .on('error', (err) => reject(err));

          cleanedData.forEach(row => csvStream.write(row));
          csvStream.end();
        })
        .on('error', (err) => reject(err)); // Gestion des erreurs
    });
  }
}

module.exports = CsvProcessingWorker;
