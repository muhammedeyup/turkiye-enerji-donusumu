import React from 'react';
import {
  Atom,
  BrainCircuit,
  Briefcase,
  Code,
  Code2,
  Cpu,
  Database,
  GitBranch,
  GraduationCap,
  HardDrive,
  Layers,
  Layout,
  Palette,
  Sparkles,
  Terminal,
  Trophy,
  Zap,
  type LucideIcon,
  type LucideProps,
} from 'lucide-react';

interface DynamicIconProps extends LucideProps {
  name: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, ...props }) => {
  const iconMap: Record<string, LucideIcon> = {
    Atom, BrainCircuit, Briefcase, Code, Code2, Cpu, Database, GitBranch,
    GraduationCap, HardDrive, Layers, Layout, Palette, Sparkles, Terminal,
    Trophy, Zap,
  };
  const IconComponent = iconMap[name] || Code;
  return <IconComponent {...props} />;
};
