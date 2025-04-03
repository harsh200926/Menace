import {
  Activity,
  Component,
  HomeIcon,
  Mail,
  Package,
  ScrollText,
  SunMoon,
  Calendar,
  BookOpen,
  FileText,
  Target,
  BarChart2,
  Settings,
  History,
  Repeat,
  Image,
  Quote,
  CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Dock, DockIcon, DockItem, DockLabel } from '@/components/ui/dock/component';

type DockPosition = 'bottom' | 'left' | 'top' | 'right';

type AppleStyleDockProps = {
  position?: DockPosition;
};

export function AppleStyleDock({ position = 'bottom' }: AppleStyleDockProps) {
  const navigate = useNavigate();

  const data = [
    {
      title: 'Dashboard',
      icon: <HomeIcon className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/',
    },
    {
      title: 'Calendar',
      icon: <Calendar className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/calendar',
    },
    {
      title: 'Journal',
      icon: <BookOpen className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/journal',
    },
    {
      title: 'Notes',
      icon: <FileText className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/notes',
    },
    {
      title: 'Tasks',
      icon: <CheckCircle2 className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/todos',
    },
    {
      title: 'Goals',
      icon: <Target className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/goals',
    },
    {
      title: 'Habits',
      icon: <Repeat className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/habits',
    },
    {
      title: 'Motivation',
      icon: <Quote className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/motivation',
    },
    {
      title: 'Memories',
      icon: <Image className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/memories',
    },
    {
      title: 'Analytics',
      icon: <BarChart2 className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/analytics',
    },
    {
      title: 'History',
      icon: <History className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/history',
    },
    {
      title: 'Settings',
      icon: <Settings className='h-full w-full text-neutral-600 dark:text-neutral-300' />,
      href: '/settings',
    },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
  };

  // Set different positioning classes based on the position prop
  const positionClasses = {
    bottom: 'fixed bottom-2 left-1/2 -translate-x-1/2 z-50',
    top: 'fixed top-2 left-1/2 -translate-x-1/2 z-50',
    left: 'fixed left-2 top-1/2 -translate-y-1/2 z-50 flex-col h-screen',
    right: 'fixed right-2 top-1/2 -translate-y-1/2 z-50 flex-col',
  };

  const dockClasses = {
    bottom: 'items-end pb-3',
    top: 'items-start pt-3',
    left: 'items-start pl-3 flex-col h-auto max-h-screen py-4 overflow-y-auto',
    right: 'items-end pr-3 flex-col',
  };

  return (
    <div className={positionClasses[position]}>
      <Dock className={dockClasses[position]}>
        {data.map((item, idx) => (
          <DockItem
            key={idx}
            className='aspect-square rounded-full bg-transparent backdrop-blur-sm cursor-pointer mb-2'
            onClick={() => handleNavigation(item.href)}
          >
            <DockLabel>{item.title}</DockLabel>
            <DockIcon>{item.icon}</DockIcon>
          </DockItem>
        ))}
      </Dock>
    </div>
  );
}
