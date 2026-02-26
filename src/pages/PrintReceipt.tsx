import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, X } from 'lucide-react';

export const PrintReceipt: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { saleData } = location.state || {};
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!saleData) {
      // Si pas de données, rediriger vers POS
      navigate('/pos');
      return;
    }

    // Impression automatique après chargement
    const timer = setTimeout(() => {
      handlePrint();
    }, 500);

    return () => clearTimeout(timer);
  }, [saleData, navigate]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const printWindow = window.open('', '_blank');
      
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Ticket de caisse</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  width: 80mm;
                  margin: 0 auto;
                  padding: 5px;
                }
                .header {
                  text-align: center;
                  margin-bottom: 10px;
                  border-bottom: 1px dashed #000;
                  padding-bottom: 5px;
                }
                .company-name {
                  font-size: 14px;
                  font-weight: bold;
                }
                .address {
                  font-size: 10px;
                }
                .phone {
                  font-size: 10px;
                }
                .email {
                  font-size: 10px;
                }
                .invoice-info {
                  margin: 10px 0;
                  font-size: 11px;
                }
                .items {
                  width: 100%;
                  border-collapse: collapse;
                  margin: 10px 0;
                }
                .items th {
                  text-align: left;
                  font-size: 11px;
                  border-bottom: 1px solid #000;
                }
                .items td {
                  font-size: 11px;
                  padding: 2px 0;
                }
                .items .price {
                  text-align: right;
                }
                .totals {
                  margin: 10px 0;
                  border-top: 1px dashed #000;
                  padding-top: 5px;
                }
                .total-line {
                  display: flex;
                  justify-content: space-between;
                  font-size: 12px;
                  margin: 2px 0;
                }
                .grand-total {
                  font-weight: bold;
                  font-size: 14px;
                  margin-top: 5px;
                }
                .payment-info {
                  margin: 10px 0;
                  border-top: 1px dashed #000;
                  padding-top: 5px;
                }
                .footer {
                  text-align: center;
                  margin-top: 15px;
                  border-top: 1px dashed #000;
                  padding-top: 5px;
                  font-size: 10px;
                }
                .no-print {
                  display: none;
                }
                @media print {
                  .no-print {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              ${printContent}
              <script>
                window.onload = function() { 
                  window.print(); 
                  setTimeout(() => { window.close(); }, 500);
                }
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    }
  };

  // ✅ Fonction pour retourner au POS
  const handleBackToPOS = () => {
    navigate('/pos');
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!saleData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-[80mm] mx-auto bg-white shadow-lg rounded-lg p-4">
        {/* Boutons de contrôle - ne seront pas imprimés */}
        <div className="no-print flex justify-between mb-4">
          <button
            onClick={handleBackToPOS}  // ✅ Redirige vers /pos
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Retour au POS
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer
          </button>
        </div>

        {/* Ticket de caisse - Format 80mm */}
        <div ref={printRef} className="receipt">
          <div className="header">
            <div className="company-name">{saleData.companyInfo?.name || 'Votre Entreprise'}</div>
            <div className="address">{saleData.companyInfo?.address || 'Adresse'}</div>
            <div className="phone">Tél: {saleData.companyInfo?.phone || 'Téléphone'}</div>
            <div className="email">{saleData.companyInfo?.email || 'Email'}</div>
          </div>

          <div className="invoice-info">
            <div>N° FACTURE: {saleData.invoiceNumber || saleData.id?.substring(0, 8).toUpperCase()}</div>
            <div>DATE: {formatDate(saleData.date)}</div>
            <div>CAISSIER: {saleData.user?.name || 'N/A'}</div>
            {saleData.customerName && (
              <div>CLIENT: {saleData.customerName}</div>
            )}
          </div>

          <table className="items">
            <thead>
              <tr>
                <th>Article</th>
                <th>Qté</th>
                <th className="price">Prix</th>
                <th className="price">Total</th>
              </tr>
            </thead>
            <tbody>
              {saleData.items?.map((item: any, index: number) => (
                <tr key={index}>
                  <td>{item.product.name.substring(0, 20)}</td>
                  <td>{item.quantity}</td>
                  <td className="price">{formatPrice(item.product.price)}</td>
                  <td className="price">{formatPrice(item.product.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="totals">
            <div className="total-line">
              <span>SOUS-TOTAL:</span>
              <span>{formatPrice(saleData.subtotal || 0)}</span>
            </div>
            <div className="total-line">
              <span>TVA (20%):</span>
              <span>{formatPrice(saleData.tax || 0)}</span>
            </div>
            <div className="total-line grand-total">
              <span>TOTAL:</span>
              <span>{formatPrice(saleData.total || 0)}</span>
            </div>
          </div>

          <div className="payment-info">
            <div className="total-line">
              <span>MODE DE PAIEMENT:</span>
              <span>{saleData.paymentMethod === 'cash' ? 'ESPÈCES' : 'CARTE'}</span>
            </div>
            {saleData.paymentMethod === 'cash' && (
              <>
                <div className="total-line">
                  <span>MONTANT REÇU:</span>
                  <span>{formatPrice(saleData.amountPaid || 0)}</span>
                </div>
                <div className="total-line">
                  <span>MONNAIE RENDUE:</span>
                  <span>{formatPrice(saleData.change || 0)}</span>
                </div>
              </>
            )}
          </div>

          {saleData.notes && (
            <div className="notes">
              <div>Notes: {saleData.notes}</div>
            </div>
          )}

          <div className="footer">
            <div>Merci de votre confiance !</div>
            <div>À bientôt</div>
          </div>
        </div>
      </div>
    </div>
  );
};