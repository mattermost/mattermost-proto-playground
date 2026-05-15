/**
 * DPC PersonaContext — current persona selection for the prototype.
 *
 * Per intake Q4, each prototype carries its own scenario picker with five
 * personas (channel-admin / end-user tenured / end-user newer / guest /
 * system-admin). Context lives at the PrototypeShell layer so any nested
 * component can read the current persona via usePersona().
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { PERSONAS, type Persona, type PersonaInfo } from './fixtures';

interface PersonaContextValue {
  persona: Persona;
  personaInfo: PersonaInfo;
  setPersona: (p: Persona) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export interface PersonaProviderProps {
  initialPersona?: Persona;
  children: ReactNode;
}

export function PersonaProvider({
  initialPersona = 'channel-admin',
  children,
}: PersonaProviderProps) {
  const [persona, setPersonaState] = useState<Persona>(initialPersona);

  const setPersona = useCallback((next: Persona) => {
    setPersonaState(next);
  }, []);

  const value = useMemo<PersonaContextValue>(
    () => ({
      persona,
      personaInfo: PERSONAS[persona],
      setPersona,
    }),
    [persona, setPersona],
  );

  return (
    <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>
  );
}

export function usePersona(): PersonaContextValue {
  const ctx = useContext(PersonaContext);
  if (!ctx) {
    throw new Error('usePersona must be used within a PersonaProvider');
  }
  return ctx;
}
