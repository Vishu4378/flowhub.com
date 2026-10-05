import { createBrowserRouter, Navigate } from 'react-router';
import { GuestOnly, RequireAuth } from './auth/guards';
import { AppLayout } from './layouts/AppLayout';
import { HomeRedirect } from './pages/HomeRedirect';
import { LoginPage } from './pages/LoginPage';
import { MembersPage } from './pages/MembersPage';
import { NewOrganizationPage } from './pages/NewOrganizationPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { RegisterPage } from './pages/RegisterPage';
import { SettingsPage } from './pages/SettingsPage';

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      { index: true, element: <HomeRedirect /> },
      { path: '/organizations/new', element: <NewOrganizationPage /> },
      {
        path: '/orgs/:orgId',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="projects" replace /> },
          { path: 'projects', element: <ProjectsPage /> },
          { path: 'projects/:projectId', element: <ProjectDetailPage /> },
          { path: 'members', element: <MembersPage /> },
          { path: 'settings', element: <SettingsPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
