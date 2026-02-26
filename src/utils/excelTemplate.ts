// src/utils/excelTemplate.ts
import * as XLSX from 'xlsx';

/**
 * Télécharge un template Excel pour l'import des factures
 */
export const downloadInvoiceTemplate = () => {
  // Créer les données d'exemple pour le template
  const exampleData = [
    {
      'Numéro': 'INV-001',
      'Client': 'Client exemple',
      'Email': 'client@exemple.com',
      'Téléphone': '+243 XXX XXX XXX',
      'Date': new Date().toISOString().split('T')[0],
      'Statut': 'payée',
      'Méthode de paiement': 'espèces',
      'Sous-total': 1000,
      'TVA': 200,
      'Remise': 0,
      'Total': 1200,
      'Notes': 'Facture exemple',
    }
  ];

  // Créer les données d'exemple pour les articles
  const exampleItems = [
    {
      'Numéro de facture': 'INV-001',
      'Produit': 'Produit exemple',
      'Quantité': 2,
      'Prix unitaire': 500,
      'Total': 1000,
    }
  ];

  // Créer le classeur Excel
  const wb = XLSX.utils.book_new();

  // Créer la feuille des factures
  const wsInvoices = XLSX.utils.json_to_sheet(exampleData);
  
  // Définir la largeur des colonnes pour la feuille des factures
  wsInvoices['!cols'] = [
    { wch: 15 }, // Numéro
    { wch: 25 }, // Client
    { wch: 30 }, // Email
    { wch: 15 }, // Téléphone
    { wch: 12 }, // Date
    { wch: 10 }, // Statut
    { wch: 20 }, // Méthode de paiement
    { wch: 12 }, // Sous-total
    { wch: 10 }, // TVA
    { wch: 10 }, // Remise
    { wch: 12 }, // Total
    { wch: 30 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, wsInvoices, 'Factures');

  // Créer la feuille des articles
  const wsItems = XLSX.utils.json_to_sheet(exampleItems);
  
  // Définir la largeur des colonnes pour la feuille des articles
  wsItems['!cols'] = [
    { wch: 15 }, // Numéro de facture
    { wch: 30 }, // Produit
    { wch: 10 }, // Quantité
    { wch: 15 }, // Prix unitaire
    { wch: 15 }, // Total
  ];

  XLSX.utils.book_append_sheet(wb, wsItems, 'Articles');

  // Télécharger le fichier
  XLSX.writeFile(wb, 'template_import_factures.xlsx');
};

/**
 * Télécharge un template Excel pour l'import des clients
 */
export const downloadCustomerTemplate = () => {
  const exampleData = [
    {
      'Nom': 'Client exemple',
      'Email': 'client@exemple.com',
      'Téléphone': '+243 XXX XXX XXX',
      'Adresse': '123 Avenue Exemple',
      'Ville': 'Kinshasa',
      'Type': 'particulier',
      'N° TVA': '',
      'VIP': 'Non',
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exampleData);
  
  ws['!cols'] = [
    { wch: 25 }, // Nom
    { wch: 30 }, // Email
    { wch: 15 }, // Téléphone
    { wch: 30 }, // Adresse
    { wch: 15 }, // Ville
    { wch: 15 }, // Type
    { wch: 15 }, // N° TVA
    { wch: 10 }, // VIP
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Clients');
  XLSX.writeFile(wb, 'template_import_clients.xlsx');
};

/**
 * Télécharge un template Excel pour l'import des produits
 */
export const downloadProductTemplate = () => {
  const exampleData = [
    {
      'Nom': 'Produit exemple',
      'Code-barres': '123456789',
      'Description': 'Description du produit',
      'Catégorie': 'Catégorie exemple',
      'Prix de vente': 1500,
      "Prix d'achat": 1000,
      'Stock actuel': 50,
      'Seuil minimum': 10,
      'Unité': 'pièce',
      'Suivi du stock': 'Oui',
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exampleData);
  
  ws['!cols'] = [
    { wch: 25 }, // Nom
    { wch: 15 }, // Code-barres
    { wch: 30 }, // Description
    { wch: 20 }, // Catégorie
    { wch: 15 }, // Prix de vente
    { wch: 15 }, // Prix d'achat
    { wch: 12 }, // Stock actuel
    { wch: 12 }, // Seuil minimum
    { wch: 10 }, // Unité
    { wch: 12 }, // Suivi du stock
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Produits');
  XLSX.writeFile(wb, 'template_import_produits.xlsx');
};

/**
 * ✅ NOUVELLE FONCTION: Télécharge un template Excel pour l'import des catégories
 */
export const downloadCategoryTemplate = () => {
  const exampleData = [
    {
      'Nom': 'Catégorie exemple',
      'Description': 'Description de la catégorie',
      'Couleur': '#3B82F6',
    },
    {
      'Nom': 'Boissons',
      'Description': 'Toutes les boissons',
      'Couleur': '#10B981',
    },
    {
      'Nom': 'Alimentaire',
      'Description': 'Produits alimentaires',
      'Couleur': '#F59E0B',
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exampleData);
  
  // Définir la largeur des colonnes
  ws['!cols'] = [
    { wch: 25 }, // Nom
    { wch: 40 }, // Description
    { wch: 15 }, // Couleur
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Catégories');
  XLSX.writeFile(wb, 'template_import_categories.xlsx');
};

/**
 * ✅ NOUVELLE FONCTION: Télécharge un template Excel pour l'import des dépenses
 */
export const downloadExpenseTemplate = () => {
  const exampleData = [
    {
      'Titre': 'Achat de fournitures',
      'Montant': 50000,
      'Catégorie': 'Fournitures',
      'Date': new Date().toISOString().split('T')[0],
      'Mode de paiement': 'espèces',
      'Description': 'Description de la dépense',
      'Notes': 'Notes optionnelles',
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(exampleData);
  
  ws['!cols'] = [
    { wch: 30 }, // Titre
    { wch: 15 }, // Montant
    { wch: 20 }, // Catégorie
    { wch: 12 }, // Date
    { wch: 15 }, // Mode de paiement
    { wch: 40 }, // Description
    { wch: 30 }, // Notes
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Dépenses');
  XLSX.writeFile(wb, 'template_import_depenses.xlsx');
};

// Export par défaut de toutes les fonctions
export default {
  downloadInvoiceTemplate,
  downloadCustomerTemplate,
  downloadProductTemplate,
  downloadCategoryTemplate,
  downloadExpenseTemplate,
};