const CsvProcessingWorker = require('../workers/CsvProcessingWorker');
const { joinTables, removeDuplicates } = require('../utils/JoinUtils');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/appConfig');

class CsvService {
  async processFiles(files, namefile, nameOutPut, typeJoin) {
    try {
        // Traiter les fichiers CSV en parallèle
        const results = await Promise.all(
            files.map((file, index) => new CsvProcessingWorker(file.path, `${namefile}-${index}`).process())
        );

        //fusionner
        const mergedData = results.flatMap(result => result.data);

        //supprimer les doublons
        const cleanedData = removeDuplicates(mergedData);

        const finalData = results.length > 1
            ? joinTables(results.map(result => result.data), typeJoin)
            : cleanedData;

        // Création du répertoire de sortie s'il n'existe pas
        const outputDir = path.join(__dirname, '../../', appConfig.outputDir);

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        //chemin du fichier CVS final
        const finalOutputPath = path.join(outputDir, `${nameOutPut}-${finalData.length > 1 ? 'joined-cleaned' : 'cleaned'}.csv`);

        //Création du fichier CSV
        const csvHeaders = Object.keys(finalData[0] || {}).join(';'); // Récupérer les en-têtes des colon
        const csvRows = finalData.map(row => Object.values(row).join(';')).join('\n'); // Convertir les données en lignes CSV
        const csvContent = `${csvHeaders}\n${csvRows}`; // Concaténer les en-têtes et les données

        // Écriture dans le fichier
        fs.writeFileSync(finalOutputPath, csvContent, 'utf-8');

        return {
            message: results.length > 1
            ? 'Les fichiers ont été fusionnés et nettoyés avec succès.'
            : 'Les fichiers ont été traités et nettoyés avec succès.',
            finalCsvPath: finalOutputPath,
            data: finalData,
        };

    } catch (error) {
      console.error('Erreur de traitement des fichiers CSV :', error);
      throw new Error('Erreur lors du traitement des fichiers CSV');
    }
  }
}

module.exports = CsvService;


