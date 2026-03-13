"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authApi, projectsApi } from "@/lib/api";

type User = { id: string; name: string; email: string; publicId?: string };

type Project = {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  role: string;
};

type AppContextType = {
  user: User | null;
  token: string | null;
  projects: Project[];
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Fetch projects when logged in
  const refreshProjects = useCallback(async () => {
    if (!token) return;
    try {
      const res = await projectsApi.getMyProjects();
      const list = Array.isArray(res.data) ? res.data : [];
      setProjects(list);
      if (list.length > 0 && !selectedProjectId) {
        setSelectedProjectId(list[0].id);
      }
    } catch {
      // token might be expired
    }
  }, [token, selectedProjectId]);

  useEffect(() => {
    if (token) refreshProjects();
  }, [token, refreshProjects]);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const { token: t, user: u } = res.data;
    localStorage.setItem("token", t);
    localStorage.setItem("user", JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    await authApi.signup(name, email, password);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setProjects([]);
    setSelectedProjectId(null);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        projects,
        selectedProjectId,
        setSelectedProjectId,
        login,
        signup,
        logout,
        refreshProjects,
        loading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }
  return context;
}
