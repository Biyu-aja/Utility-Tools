/**
 * Folder: src/constants/
 * Description: Stores constants, router configurations, menu routes, and static route mappings.
 * This file: router.tsx (Defines routes and application navigation structure).
 */

import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout from '../components/ui/layout'
import { AppRoutes } from './listed'
import { DashboardPage } from '../pages/Dashboard'
import { ImageConverterPage } from '../pages/ImageConverter'
import { PhotoToPDFPage } from '../pages/PhotoToPDF'
import { SplitPDFPage } from '../pages/SplitPDF'
import { FakeChatPage } from '../pages/FakeChat'
import { MockupGeneratorPage } from '../pages/MockupGenerator'
import { SettingsPage } from '../pages/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to={`/${AppRoutes.Dashboard}`} replace />,
      },
      {
        path: AppRoutes.Dashboard,
        element: <DashboardPage />,
      },
      {
        path: AppRoutes.MockupGenerator,
        element: <MockupGeneratorPage />,
      },
      {
        path: AppRoutes.FakeChat,
        element: <FakeChatPage />,
      },
      {
        path: AppRoutes.ImageConverter,
        element: <ImageConverterPage />,
      },
      {
        path: AppRoutes.Settings,
        element: <SettingsPage />,
      },
      {
        path: AppRoutes.PhotoToPDF,
        element: <PhotoToPDFPage />,
      },
      {
        path: AppRoutes.SplitPDF,
        element: <SplitPDFPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
