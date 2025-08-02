import { createContext } from 'react';
import type { ProjectContextType } from './ProjectContextTypes';

export const ProjectContext = createContext<ProjectContextType | undefined>(undefined); 