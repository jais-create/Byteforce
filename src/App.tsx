/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layout } from './components/Layout';
import { StockSenseProvider, useStockSense } from './context/StockSenseContext';
import { AlertsPage } from './pages/AlertsPage';
import { AssistantPage } from './pages/AssistantPage';
import { DashboardPage } from './pages/DashboardPage';
import { ForecastingPage } from './pages/ForecastingPage';
import { InventoryPage } from './pages/InventoryPage';
import { PurchaseOrdersPage } from './pages/PurchaseOrdersPage';
import { ReplenishmentPage } from './pages/ReplenishmentPage';
import { SettingsPage } from './pages/SettingsPage';
import { SuppliersPage } from './pages/SuppliersPage';

const PageRouter: React.FC = () => {
  const { activePage } = useStockSense();

  switch (activePage) {
    case 'dashboard':
      return <DashboardPage />;
    case 'inventory':
      return <InventoryPage />;
    case 'forecasting':
      return <ForecastingPage />;
    case 'replenishment':
      return <ReplenishmentPage />;
    case 'purchase-orders':
      return <PurchaseOrdersPage />;
    case 'suppliers':
      return <SuppliersPage />;
    case 'alerts':
      return <AlertsPage />;
    case 'assistant':
      return <AssistantPage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <DashboardPage />;
  }
};

export default function App() {
  return (
    <StockSenseProvider>
      <Layout>
        <PageRouter />
      </Layout>
    </StockSenseProvider>
  );
}
