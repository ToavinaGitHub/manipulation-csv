const CsvProcessingWorker = require('../workers/CsvProcessingWorker');
const { joinTables, removeDuplicates } = require('../utils/JoinUtils');
const path = require('path');
const fs = require('fs');
const appConfig = require('../config/appConfig');

// Fonction pour traiter les fichiers
async function processFiles(files, namefile, nameOutPut, typeJoin) {
  try {
    // Validation des données d'entrée
    if (!Array.isArray(namefile) || namefile.length !== files.length) {
      throw new Error(
        'Le nombre de fichiers ne correspond pas au nombre de noms fournis.'
      );
    }

    const fileNameMapping = files.map((file, index) => ({
      filePath: file.path,
      name: namefile[index],
    }));

    const results = await Promise.all(
      fileNameMapping.map(({ filePath, name }) =>
        new CsvProcessingWorker(filePath, name).process()
      )
    );

    const mergedData = results.flatMap((result) => result.data);
    const cleanedData = removeDuplicates(mergedData);

    const finalData =
      results.length > 1
        ? joinTables(results.map((result) => result.data), typeJoin)
        : cleanedData;

    const outputDir = path.join(__dirname, '../../', appConfig.outputDir);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const finalOutputPath = path.join(
      outputDir,
      `${nameOutPut}-${finalData.length > 1 ? 'joined-cleaned' : 'cleaned'}.csv`
    );

    const csvHeaders = Object.keys(finalData[0] || {}).join(';');
    const csvRows = finalData
      .map((row) => Object.values(row).join(';'))
      .join('\n');
    const csvContent = `${csvHeaders}\n${csvRows}`;

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

// Fonction pour supprimer un fichier
async function deleteFile(directory, fileName) {
  const filePath = path.join(directory, fileName);

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      reject(new Error('Le fichier n\'existe pas.'));
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        reject(new Error('Erreur lors de la suppression du fichier.'));
      } else {
        resolve('Fichier supprimé avec succès.');
      }
    });
  });
}

// Exporter les fonctions indépendantes
module.exports = {
  processFiles,
  deleteFile,
};
