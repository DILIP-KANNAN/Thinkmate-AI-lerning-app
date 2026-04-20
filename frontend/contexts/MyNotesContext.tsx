import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { API_URL, useAuthContext } from "./AuthContext";
import { useCommunitiesContext } from "./CommunitiesContext";

export interface Note {
  _id: string;
  title: string;
  topic: string;
  url?: string;
  subject?: string;
}

export type NotesRecord = Record<string, Note[]>;
export type ActiveCommunity = { _id: string, subject: string };

interface MyNotesContextType {
  subjects: string[];
  activeCommunities: ActiveCommunity[];
  notesBySubject: NotesRecord;
  loadPersonalNotes: () => void;
  loading: boolean;
}

const MyNotesContext = createContext<MyNotesContextType | undefined>(undefined);

export function MyNotesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const { communities } = useCommunitiesContext();
  const [subjects, setSubjects] = useState<string[]>(["All"]);
  const [activeCommunities, setActiveCommunities] = useState<ActiveCommunity[]>([]);
  const [notesBySubject, setNotesBySubject] = useState<NotesRecord>({});
  const [loading, setLoading] = useState(false);

  const loadPersonalNotes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/auth/notes`);
      const docs = res.data; 
      
      const newSubjects = new Set<string>(["All"]);
      const newNotesRecord: NotesRecord = {};
      const newActiveComms: ActiveCommunity[] = [];

      user.subjects.forEach((commId: string) => {
         const foundComm = communities.find(c => c._id === commId);
         if (foundComm && foundComm.subject) {
            newSubjects.add(foundComm.subject);
            newActiveComms.push({ _id: foundComm._id, subject: foundComm.subject });
            if (!newNotesRecord[foundComm.subject]) {
              newNotesRecord[foundComm.subject] = [];
            }
         }
      });

      docs.forEach((doc: any) => {
         const subjectName = doc.community?.subject || "Uncategorized";
         newSubjects.add(subjectName);
         
         if (doc.community && doc.community._id && !newActiveComms.find(c => c.subject === subjectName)) {
            newActiveComms.push({ _id: doc.community._id, subject: subjectName });
         }

         if (!newNotesRecord[subjectName]) {
           newNotesRecord[subjectName] = [];
         }
         
         newNotesRecord[subjectName].push({
           _id: doc._id,
           title: doc.title,
           topic: doc.topic,
           url: doc.url,
           subject: subjectName,
         });
      });

      setSubjects(Array.from(newSubjects));
      setActiveCommunities(newActiveComms);
      setNotesBySubject(newNotesRecord);
    } catch (error) {
      console.log('Failed to fetch personal notes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.isAuthenticated) {
      loadPersonalNotes();
    } else {
      setNotesBySubject({});
      setSubjects(["All"]);
    }
  }, [user]);

  return (
    <MyNotesContext.Provider value={{ subjects, activeCommunities, notesBySubject, loadPersonalNotes, loading }}>
      {children}
    </MyNotesContext.Provider>
  );
}

export function useMyNotesContext() {
  const context = useContext(MyNotesContext);
  if (context === undefined) {
    throw new Error("useMyNotesContext must be used within a MyNotesProvider");
  }
  return context;
}
