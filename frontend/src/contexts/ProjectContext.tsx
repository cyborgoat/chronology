import React from 'react';
import { useProjects as useProjectsHook } from '../hooks/useProjects';
import { ProjectContext } from './ProjectContextInstance';
import type { ProjectContextType } from './ProjectContextTypes';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const projectsData = useProjectsHook();

  const contextValue: ProjectContextType = {
    ...projectsData,
  };

  return (
    <ProjectContext.Provider value={contextValue}>
      {children}
    </ProjectContext.Provider>
  );
}
