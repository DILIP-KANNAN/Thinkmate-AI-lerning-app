import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { useAuthContext, API_URL } from "./AuthContext";

export interface Institution {
  _id: string;
  name: string;
  description: string;
  logo: string;
}

export interface Community {
  _id: string;
  name: string;
  subject: string;
  institution?: Institution;
  membersCount: number;
  isPrivate: boolean;
  isVerified: boolean;
  trending: boolean;
}

interface CommunitiesContextType {
  subjects: string[];
  communities: Community[];
  institutions: Institution[];
  setCommunities: React.Dispatch<React.SetStateAction<Community[]>>;
  enrollInCommunity: (communityId: string) => Promise<void>;
  loading: boolean;
}

const CommunitiesContext = createContext<CommunitiesContextType | undefined>(undefined);

export function CommunitiesProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, refreshUser } = useAuthContext();

  useEffect(() => {
    if (user?.isAuthenticated) {
      loadData();
    } else {
      setCommunities([]);
      setInstitutions([]);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [commRes, instRes] = await Promise.all([
        axios.get(`${API_URL}/communities`),
        axios.get(`${API_URL}/communities/institutions`)
      ]);
      setCommunities(commRes.data);
      setInstitutions(instRes.data);

      const uniqueSubjects = ["All", ...new Set(commRes.data.map((c: any) => c.subject))];
      setSubjects(uniqueSubjects as string[]);
    } catch (err) {
      console.log("Failed to load communities", err);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCommunity = async (communityId: string) => {
    try {
      await axios.post(`${API_URL}/communities/enroll`, { communityId });
      // Mutate the user natively so they immediately drop out of the Suggested array natively!
      if (refreshUser) await refreshUser();
      await loadData();
    } catch (err) {
      console.log("Failed to enroll", err);
    }
  };

  return (
    <CommunitiesContext.Provider value={{ subjects, communities, institutions, setCommunities, enrollInCommunity, loading }}>
      {children}
    </CommunitiesContext.Provider>
  );
}

export function useCommunitiesContext() {
  const context = useContext(CommunitiesContext);
  if (context === undefined) {
    throw new Error("useCommunitiesContext must be used within a CommunitiesProvider");
  }
  return context;
}
