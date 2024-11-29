const CsvProcessingWorker = require('../workers/CsvProcessingWorker');
const { joinTables, removeDuplicates } = require('../utils/JoinUtils');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/appConfig');

class CsvService {
  async processFiles(files, namefile, nameOutPut, typeJoin) {
    try {
      // Validation des données d'entrée
      if (!Array.isArray(namefile) || namefile.length !== files.length) {
        throw new Error(
          'Le nombre de fichiers ne correspond pas au nombre de noms fournis.'
        );
      }

      // Associer chaque fichier avec son nom
      const fileNameMapping = files.map((file, index) => ({
        filePath: file.path,
        name: namefile[index],
      }));

      // Traiter chaque fichier avec le nom associé
      const results = await Promise.all(
        fileNameMapping.map(({ filePath, name }) =>
          new CsvProcessingWorker(filePath, name).process()
        )
      );

      // Fusionner les données des fichiers
      const mergedData = results.flatMap((result) => result.data);

      // Supprimer les doublons
      const cleanedData = removeDuplicates(mergedData);

      // Effectuer un type de jointure si plusieurs fichiers sont fournis
      const finalData =
        results.length > 1
          ? joinTables(results.map((result) => result.data), typeJoin)
          : cleanedData;

      // Créer le répertoire de sortie s'il n'existe pas
      const outputDir = path.join(__dirname, '../../', appConfig.outputDir);

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Générer le chemin du fichier de sortie
      const finalOutputPath = path.join(
        outputDir,
        `${nameOutPut}-${finalData.length > 1 ? 'joined-cleaned' : 'cleaned'}.csv`
      );

      // Créer le contenu CSV
      const csvHeaders = Object.keys(finalData[0] || {}).join(';'); // En-têtes des colonnes
      const csvRows = finalData
        .map((row) => Object.values(row).join(';'))
        .join('\n'); // Lignes CSV
      const csvContent = `${csvHeaders}\n${csvRows}`;

      // Écrire dans le fichier CSV final
      fs.writeFileSync(finalOutputPath, csvContent, 'utf-8');

      return {
        message:
          results.length > 1
            ? 'Les fichiers ont été fusionnés et nettoyés avec succès.'
            : 'Le fichier a été traité et nettoyé avec succès.',
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
