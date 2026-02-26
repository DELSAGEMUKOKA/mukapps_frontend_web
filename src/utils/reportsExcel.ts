import * as XLSX from 'xlsx';

interface CellStyle {
  font?: { bold?: boolean; color?: string; size?: number };
  fill?: { fgColor: string };
  alignment?: { horizontal?: string; vertical?: string };
  border?: any;
}

export class ReportsExcelExporter {
  private workbook: XLSX.WorkBook;

  constructor() {
    this.workbook = XLSX.utils.book_new();
  }

  addExecutiveSummary(data: {
    dateRange: { startDate: string; endDate: string };
    salesData: any;
    profitData: any;
    inventoryData: any;
    customersData: any;
    expensesData: any;
  }) {
    const summaryData = [
      ['EXECUTIVE SUMMARY', ''],
      ['Report Period', `${data.dateRange.startDate} to ${data.dateRange.endDate}`],
      ['Generated On', new Date().toLocaleString('fr-FR')],
      ['', ''],
      ['FINANCIAL METRICS', ''],
      ['Total Revenue', data.salesData?.totalRevenue || 0],
      ['Total Profit', data.profitData?.totalProfit || 0],
      ['Profit Margin %', data.profitData?.margin || 0],
      ['Total Expenses', data.expensesData?.totalExpenses || 0],
      ['Net Income', (data.profitData?.totalProfit || 0) - (data.expensesData?.totalExpenses || 0)],
      ['', ''],
      ['SALES METRICS', ''],
      ['Total Orders', data.salesData?.totalOrders || 0],
      ['Products Sold', data.salesData?.totalProductsSold || 0],
      ['Average Order Value', data.salesData?.averageOrderValue || 0],
      ['Conversion Rate %', data.salesData?.conversionRate || 0],
      ['Revenue Growth %', data.salesData?.growth || 0],
      ['', ''],
      ['CUSTOMER METRICS', ''],
      ['Total Customers', data.customersData?.totalCustomers || 0],
      ['New Customers', data.customersData?.newCustomers || 0],
      ['VIP Customers', data.customersData?.vipCustomers?.length || 0],
      ['Customer Retention %', data.customersData?.retentionRate || 0],
      ['', ''],
      ['INVENTORY METRICS', ''],
      ['Total Stock Units', data.inventoryData?.totalStock || 0],
      ['Total Stock Value', data.inventoryData?.stockValue || 0],
      ['Low Stock Items', data.inventoryData?.lowStock?.length || 0],
      ['Stock Turnover Rate', data.inventoryData?.turnoverRate || 0],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 25 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Executive Summary');
  }

  addRevenueTrend(data: any[]) {
    if (!data || data.length === 0) return;

    const trendData = data.map(item => ({
      'Date': item.date,
      'Revenue': item.revenue,
      'Orders': item.orders || 0,
      'Average Order': item.revenue / (item.orders || 1),
    }));

    const totals = {
      'Date': 'TOTAL',
      'Revenue': data.reduce((sum, item) => sum + item.revenue, 0),
      'Orders': data.reduce((sum, item) => sum + (item.orders || 0), 0),
      'Average Order': 0,
    };
    totals['Average Order'] = totals.Revenue / (totals.Orders || 1);

    trendData.push(totals);

    const worksheet = XLSX.utils.json_to_sheet(trendData);
    worksheet['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Revenue Trend');
  }

  addTopProducts(data: any[]) {
    if (!data || data.length === 0) return;

    const productsData = data.map((product, index) => ({
      'Rank': index + 1,
      'Product Name': product.productName,
      'Units Sold': product.totalSold,
      'Total Revenue': product.totalRevenue,
      'Average Price': product.totalRevenue / product.totalSold,
      'Revenue Share %': 0,
    }));

    const totalRevenue = productsData.reduce((sum, item) => sum + item['Total Revenue'], 0);
    productsData.forEach(item => {
      item['Revenue Share %'] = ((item['Total Revenue'] / totalRevenue) * 100).toFixed(2);
    });

    const worksheet = XLSX.utils.json_to_sheet(productsData);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Top Products');
  }

  addSalesByCategory(data: any[]) {
    if (!data || data.length === 0) return;

    const totalValue = data.reduce((sum, item) => sum + item.value, 0);

    const categoryData = data.map(item => ({
      'Category': item.name,
      'Sales Amount': item.value,
      'Percentage': ((item.value / totalValue) * 100).toFixed(2) + '%',
    }));

    categoryData.push({
      'Category': 'TOTAL',
      'Sales Amount': totalValue,
      'Percentage': '100%',
    });

    const worksheet = XLSX.utils.json_to_sheet(categoryData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 18 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Sales by Category');
  }

  addExpensesByCategory(data: any[]) {
    if (!data || data.length === 0) return;

    const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

    const expensesData = data.map(item => ({
      'Category': item.category,
      'Amount': item.amount,
      'Percentage': ((item.amount / totalAmount) * 100).toFixed(2) + '%',
      'Count': item.count || 0,
      'Average': item.count > 0 ? (item.amount / item.count).toFixed(2) : 0,
    }));

    expensesData.push({
      'Category': 'TOTAL',
      'Amount': totalAmount,
      'Percentage': '100%',
      'Count': expensesData.reduce((sum, item) => sum + (item.Count || 0), 0),
      'Average': '-',
    });

    const worksheet = XLSX.utils.json_to_sheet(expensesData);
    worksheet['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Expenses by Category');
  }

  addLowStockItems(data: any[]) {
    if (!data || data.length === 0) return;

    const lowStockData = data.map(item => ({
      'Product Name': item.productName,
      'Current Stock': item.stock,
      'Min Stock Level': item.minStockLevel || 10,
      'Shortage': (item.minStockLevel || 10) - item.stock,
      'Status': item.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK',
      'Reorder Priority': item.stock === 0 ? 'URGENT' : item.stock < 5 ? 'HIGH' : 'MEDIUM',
    }));

    const worksheet = XLSX.utils.json_to_sheet(lowStockData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 15 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Low Stock Alert');
  }

  addVIPCustomers(data: any[]) {
    if (!data || data.length === 0) return;

    const totalSpent = data.reduce((sum, item) => sum + item.totalSpent, 0);

    const vipData = data.map((customer, index) => ({
      'Rank': index + 1,
      'Customer Name': customer.name,
      'Total Spent': customer.totalSpent,
      'Orders Count': customer.ordersCount || 0,
      'Average Order': customer.ordersCount > 0 ? (customer.totalSpent / customer.ordersCount).toFixed(2) : 0,
      'Revenue Share %': ((customer.totalSpent / totalSpent) * 100).toFixed(2),
      'Customer Type': customer.is_vip ? 'VIP' : 'Regular',
    }));

    const worksheet = XLSX.utils.json_to_sheet(vipData);
    worksheet['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 15 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'VIP Customers');
  }

  addProfitAnalysis(data: {
    profitData: any;
    salesData: any;
    expensesData: any;
  }) {
    const analysisData = [
      ['PROFIT & LOSS ANALYSIS', ''],
      ['', ''],
      ['REVENUE', ''],
      ['Gross Sales', data.salesData?.totalRevenue || 0],
      ['Returns & Refunds', data.salesData?.returns || 0],
      ['Net Sales', (data.salesData?.totalRevenue || 0) - (data.salesData?.returns || 0)],
      ['', ''],
      ['COST OF GOODS SOLD', ''],
      ['Cost of Products Sold', data.profitData?.costOfGoodsSold || 0],
      ['', ''],
      ['GROSS PROFIT', ''],
      ['Gross Profit', data.profitData?.totalProfit || 0],
      ['Gross Profit Margin %', data.profitData?.margin || 0],
      ['', ''],
      ['OPERATING EXPENSES', ''],
      ['Total Expenses', data.expensesData?.totalExpenses || 0],
      ['', ''],
      ['NET INCOME', ''],
      ['Net Profit/Loss', (data.profitData?.totalProfit || 0) - (data.expensesData?.totalExpenses || 0)],
      ['Net Margin %', data.salesData?.totalRevenue > 0
        ? (((data.profitData?.totalProfit || 0) - (data.expensesData?.totalExpenses || 0)) / data.salesData.totalRevenue * 100).toFixed(2)
        : 0],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(analysisData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Profit Analysis');
  }

  addInventoryValuation(data: any) {
    if (!data) return;

    const valuationData = [
      ['INVENTORY VALUATION REPORT', ''],
      ['', ''],
      ['Total Stock Units', data.totalStock || 0],
      ['Total Stock Value', data.stockValue || 0],
      ['Average Unit Value', data.totalStock > 0 ? (data.stockValue / data.totalStock).toFixed(2) : 0],
      ['', ''],
      ['STOCK STATUS', ''],
      ['In Stock Items', data.inStock || 0],
      ['Low Stock Items', data.lowStock?.length || 0],
      ['Out of Stock Items', data.outOfStock || 0],
      ['', ''],
      ['STOCK HEALTH', ''],
      ['Stock Coverage Days', data.coverageDays || 0],
      ['Turnover Rate', data.turnoverRate || 0],
      ['Dead Stock Items', data.deadStock || 0],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(valuationData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'Inventory Valuation');
  }

  addPerformanceMetrics(data: {
    salesData: any;
    profitData: any;
    customersData: any;
  }) {
    const metricsData = [
      ['KEY PERFORMANCE INDICATORS', ''],
      ['', ''],
      ['SALES KPIs', ''],
      ['Total Revenue', data.salesData?.totalRevenue || 0],
      ['Revenue Growth %', data.salesData?.growth || 0],
      ['Average Order Value', data.salesData?.averageOrderValue || 0],
      ['Orders per Day', data.salesData?.ordersPerDay || 0],
      ['Conversion Rate %', data.salesData?.conversionRate || 0],
      ['', ''],
      ['PROFITABILITY KPIs', ''],
      ['Gross Profit', data.profitData?.totalProfit || 0],
      ['Gross Margin %', data.profitData?.margin || 0],
      ['Return on Investment %', data.profitData?.roi || 0],
      ['', ''],
      ['CUSTOMER KPIs', ''],
      ['Total Customers', data.customersData?.totalCustomers || 0],
      ['New Customers', data.customersData?.newCustomers || 0],
      ['Customer Retention %', data.customersData?.retentionRate || 0],
      ['Customer Lifetime Value', data.customersData?.lifetimeValue || 0],
      ['Average Customer Value', data.customersData?.averageValue || 0],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(metricsData);
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }];

    XLSX.utils.book_append_sheet(this.workbook, worksheet, 'KPIs');
  }

  download(filename: string) {
    XLSX.writeFile(this.workbook, filename);
  }
}

export function exportComprehensiveReport(reportData: {
  dateRange: { startDate: string; endDate: string };
  salesData: any;
  profitData: any;
  inventoryData: any;
  customersData: any;
  expensesData: any;
  topProducts: any[];
  revenueTrend: any[];
}) {
  const exporter = new ReportsExcelExporter();

  exporter.addExecutiveSummary(reportData);
  exporter.addRevenueTrend(reportData.revenueTrend);
  exporter.addTopProducts(reportData.topProducts);
  exporter.addSalesByCategory(reportData.salesData?.categorySales || []);
  exporter.addExpensesByCategory(reportData.expensesData?.categoryBreakdown || []);
  exporter.addLowStockItems(reportData.inventoryData?.lowStock || []);
  exporter.addVIPCustomers(reportData.customersData?.vipCustomers || []);
  exporter.addProfitAnalysis({
    profitData: reportData.profitData,
    salesData: reportData.salesData,
    expensesData: reportData.expensesData,
  });
  exporter.addInventoryValuation(reportData.inventoryData);
  exporter.addPerformanceMetrics({
    salesData: reportData.salesData,
    profitData: reportData.profitData,
    customersData: reportData.customersData,
  });

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const filename = `comprehensive_business_report_${reportData.dateRange.startDate}_to_${reportData.dateRange.endDate}_${timestamp}.xlsx`;

  exporter.download(filename);
}

export function exportDetailedSalesReport(salesData: any[], dateRange: { startDate: string; endDate: string }) {
  if (!salesData || salesData.length === 0) {
    alert('No sales data available to export');
    return;
  }

  const workbook = XLSX.utils.book_new();

  const detailedSales = salesData.map((sale: any) => ({
    'Invoice Number': sale.invoice_number,
    'Date': new Date(sale.sale_date).toLocaleDateString('fr-FR'),
    'Customer': sale.customer_name || 'Walk-in',
    'Payment Method': sale.payment_method,
    'Payment Status': sale.payment_status,
    'Subtotal': sale.subtotal,
    'Tax': sale.tax_amount,
    'Discount': sale.discount_amount,
    'Total Amount': sale.total_amount,
    'Profit': sale.total_profit,
    'Margin %': sale.subtotal > 0 ? ((sale.total_profit / sale.subtotal) * 100).toFixed(2) : 0,
    'Cashier': sale.cashier_name,
  }));

  const worksheet = XLSX.utils.json_to_sheet(detailedSales);
  worksheet['!cols'] = [
    { wch: 18 }, { wch: 12 }, { wch: 25 }, { wch: 15 },
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 20 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed Sales');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `detailed_sales_report_${dateRange.startDate}_to_${dateRange.endDate}_${timestamp}.xlsx`);
}

export function exportDetailedExpensesReport(expensesData: any[], dateRange: { startDate: string; endDate: string }) {
  if (!expensesData || expensesData.length === 0) {
    alert('No expenses data available to export');
    return;
  }

  const workbook = XLSX.utils.book_new();

  const detailedExpenses = expensesData.map((expense: any) => ({
    'Date': new Date(expense.expense_date).toLocaleDateString('fr-FR'),
    'Category': expense.category_name,
    'Description': expense.description,
    'Amount': expense.amount,
    'Status': expense.status,
    'Created By': expense.created_by_name,
    'Approved By': expense.approved_by_name || 'Pending',
    'Approved Date': expense.approved_at ? new Date(expense.approved_at).toLocaleDateString('fr-FR') : '-',
  }));

  const worksheet = XLSX.utils.json_to_sheet(detailedExpenses);
  worksheet['!cols'] = [
    { wch: 12 }, { wch: 20 }, { wch: 35 }, { wch: 12 },
    { wch: 12 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Detailed Expenses');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `detailed_expenses_report_${dateRange.startDate}_to_${dateRange.endDate}_${timestamp}.xlsx`);
}

export function exportInventoryReport(inventoryData: any[]) {
  if (!inventoryData || inventoryData.length === 0) {
    alert('No inventory data available to export');
    return;
  }

  const workbook = XLSX.utils.book_new();

  const inventory = inventoryData.map((item: any) => ({
    'Product Name': item.name,
    'Category': item.category_name,
    'Barcode': item.barcode || '-',
    'Current Stock': item.stock_quantity,
    'Min Stock Level': item.min_stock_level,
    'Stock Status': item.stock_quantity === 0 ? 'OUT OF STOCK'
      : item.stock_quantity <= item.min_stock_level ? 'LOW STOCK' : 'IN STOCK',
    'Purchase Price': item.purchase_price,
    'Selling Price': item.selling_price,
    'Stock Value': item.stock_quantity * item.purchase_price,
    'Potential Revenue': item.stock_quantity * item.selling_price,
    'Potential Profit': item.stock_quantity * (item.selling_price - item.purchase_price),
  }));

  const worksheet = XLSX.utils.json_to_sheet(inventory);
  worksheet['!cols'] = [
    { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 18 }, { wch: 18 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory Report');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `inventory_report_${timestamp}.xlsx`);
}

export function exportCustomersReport(customersData: any[]) {
  if (!customersData || customersData.length === 0) {
    alert('No customers data available to export');
    return;
  }

  const workbook = XLSX.utils.book_new();

  const customers = customersData.map((customer: any) => ({
    'Customer Name': customer.name,
    'Email': customer.email || '-',
    'Phone': customer.phone || '-',
    'Type': customer.type,
    'VIP Status': customer.is_vip ? 'Yes' : 'No',
    'Total Spent': customer.total_spent || 0,
    'Orders Count': customer.orders_count || 0,
    'Average Order': customer.orders_count > 0 ? (customer.total_spent / customer.orders_count).toFixed(2) : 0,
    'Last Purchase': customer.last_purchase_date ? new Date(customer.last_purchase_date).toLocaleDateString('fr-FR') : '-',
    'Member Since': new Date(customer.created_at).toLocaleDateString('fr-FR'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(customers);
  worksheet['!cols'] = [
    { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 12 },
    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 15 }, { wch: 15 },
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers Report');

  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  XLSX.writeFile(workbook, `customers_report_${timestamp}.xlsx`);
}
