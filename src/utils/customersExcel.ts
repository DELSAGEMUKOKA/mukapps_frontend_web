import * as XLSX from 'xlsx';
import { Customer } from '../lib/api/customers.service';

export const exportCustomersToExcel = (customers: Customer[]) => {
  const data = customers.map((customer) => ({
    'Nom': customer.name,
    'Email': customer.email || '',
    'Téléphone': customer.phone || '',
    'Adresse': customer.address || '',
    'Ville': customer.city || '',
    'Type': customer.type === 'business' ? 'Entreprise' : 'Particulier',
    'SIRET/TVA': customer.taxId || '',
    'Statut': customer.isVip ? 'VIP' : 'Standard',
    'Date de création': new Date(customer.created_at).toLocaleDateString('fr-FR'),
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  const colWidths = [
    { wch: 30 },
    { wch: 30 },
    { wch: 15 },
    { wch: 40 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
    { wch: 15 },
  ];
  ws['!cols'] = colWidths;

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `clients_${date}.xlsx`);
};

export const getCustomerImportTemplate = () => {
  const templateData = [
    {
      'Nom': 'Jean Dupont',
      'Email': 'jean.dupont@example.com',
      'Téléphone': '0612345678',
      'Adresse': '123 Rue de la Paix',
      'Ville': 'Paris',
      'Type': 'Particulier',
      'SIRET/TVA': '',
      'VIP': 'Non',
    },
    {
      'Nom': 'Entreprise ABC',
      'Email': 'contact@abc.com',
      'Téléphone': '0123456789',
      'Adresse': '456 Avenue des Champs',
      'Ville': 'Lyon',
      'Type': 'Entreprise',
      'SIRET/TVA': '12345678901234',
      'VIP': 'Oui',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template');

  const colWidths = [
    { wch: 30 },
    { wch: 30 },
    { wch: 15 },
    { wch: 40 },
    { wch: 20 },
    { wch: 15 },
    { wch: 20 },
    { wch: 10 },
  ];
  ws['!cols'] = colWidths;

  XLSX.writeFile(wb, 'template_import_clients.xlsx');
};

export const parseCustomersFromExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const customers = jsonData.map((row: any) => ({
          name: row['Nom'] || '',
          email: row['Email'] || '',
          phone: row['Téléphone'] || '',
          address: row['Adresse'] || '',
          city: row['Ville'] || '',
          type: row['Type']?.toLowerCase() === 'entreprise' ? 'business' : 'individual',
          taxId: row['SIRET/TVA'] || '',
          isVip: row['VIP']?.toLowerCase() === 'oui' || row['VIP']?.toLowerCase() === 'yes',
        }));

        resolve(customers);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
    reader.readAsBinaryString(file);
  });
};
