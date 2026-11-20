import React from 'react';
import { ProjectProvider, useProject } from './context/ProjectContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar/Navbar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EditorLayout } from './components/Editor/EditorLayout';
import { ProjectManager } from './components/Projects/ProjectManager';
import { DocumentationView } from './components/Documentation/DocumentationView';
import { SettingsView } from './components/Settings/SettingsView';
import { LoginPage } from './components/Auth/LoginPage';
import { SignupPage } from './components/Auth/SignupPage';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { ShortcutsModal } from './components/Modals/ShortcutsModal';
import { NewProjectModal } from './components/Modals/NewProjectModal';
import { ToastContainer } from './components/Toasts/ToastContainer';
import { ShieldAlert, ArrowLeft, LogIn } from 'lucide-react';

const ProtectedAdminView: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { setNavView } = useProject();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Verifying administrative credentials...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Required</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            The Admin Dashboard requires an authenticated administrator session. Please log in with an administrator account to continue.
          </p>
          <button
            onClick={() => setNavView('login')}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Go to Admin Login</span>
          </button>
        </div>
      </div>
    );
  }

  if (user?.role !== 'Admin') {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-950">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Forbidden</h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Your account (<strong className="text-slate-200">{user?.email}</strong>) possesses the <span className="text-cyan-400 font-semibold">User</span> role. Only accounts with the <span className="text-indigo-400 font-semibold">Admin</span> role can access this dashboard.
          </p>
          <button
            onClick={() => setNavView('editor')}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Code Editor</span>
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
};

const ProtectedUserView: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Restoring your session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

const MainView: React.FC = () => {
  const { navView } = useProject();

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {navView === 'home' && <Dashboard />}
      {navView === 'editor' && <EditorLayout />}
      {navView === 'projects' && <ProjectManager />}
      {navView === 'docs' && <DocumentationView />}
      {navView === 'settings' && <SettingsView />}
      {navView === 'login' && <LoginPage />}
      {navView === 'signup' && <SignupPage />}
      {navView === 'admin' && <ProtectedAdminView />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ProjectProvider>
        <div className="h-screen w-screen overflow-hidden flex flex-col bg-slate-950 text-slate-100 font-sans">
          <Navbar />
          <MainView />
          <ShortcutsModal />
          <NewProjectModal />
          <ToastContainer />
        </div>
      </ProjectProvider>
    </AuthProvider>
  );
};

export default App;
