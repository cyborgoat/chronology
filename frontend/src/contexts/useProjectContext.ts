import { useContext } from 'react';
import { ProjectContext } from './ProjectContextInstance';
import type { ProjectContextType } from './ProjectContextTypes';

export function useProjects(): ProjectContextType {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
} 