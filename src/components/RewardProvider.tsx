import React, { useState, useEffect } from 'react';
import RewardDialog from '@/components/ui/reward-dialog';
import { rewardDialogState, closeRewardDialog } from '@/utils/rewardUtils';

// Define the shape of the reward dialog state
interface RewardDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'tasks' | 'journal' | 'goal' | 'day';
}

interface RewardProviderProps {
  children: React.ReactNode;
}

export const RewardProvider: React.FC<RewardProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [rewardType, setRewardType] = useState<'tasks' | 'journal' | 'goal' | 'day'>('tasks');

  // Listen for reward dialog state changes
  useEffect(() => {
    const handleRewardDialogUpdate = (event: CustomEvent<RewardDialogState>) => {
      const { isOpen, title, message, type } = event.detail;
      setIsOpen(isOpen);
      setTitle(title);
      setMessage(message);
      setRewardType(type);
    };

    // TypeScript requires type assertion for CustomEvent
    window.addEventListener('reward-dialog-update', handleRewardDialogUpdate as EventListener);

    return () => {
      window.removeEventListener('reward-dialog-update', handleRewardDialogUpdate as EventListener);
    };
  }, []);

  const handleClose = () => {
    closeRewardDialog();
  };

  return (
    <>
      {children}
      <RewardDialog
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        message={message}
        type={rewardType}
      />
    </>
  );
};

export default RewardProvider; 