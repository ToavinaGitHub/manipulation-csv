const CsvService = require('../services/CsvService');
const { joinTables } = require('../utils/JoinUtils');

// Contrôleur pour gérer l'upload et le traitement des fichiers CSV
class CsvController {
  async handleCsvUpload(req, res) {
    const { namefile, nameOutPut, typeJoin } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: 'Aucun fichier CSV fourni.' });
    }

    try {
      const service = new CsvService();
      
      const result = await service.processFiles(files, namefile, nameOutPut, typeJoin);
      
      res.status(200).json({
        message: result.message,
        finalCsvPath: result.finalCsvPath,
        data: result.data,
      });
      
    } catch (error) {
      console.error('Erreur lors du traitement des fichiers CSV :', error);
      res.status(500).json({ message: 'Erreur de traitement', error: error.message });
    }
  }
}

module.exports = new CsvController();
