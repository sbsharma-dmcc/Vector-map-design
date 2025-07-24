
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface CompleteVoyageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (comments: string) => void;
  routeName: string;
}

const CompleteVoyageDialog: React.FC<CompleteVoyageDialogProps> = ({
  isOpen,
  onClose,
  onComplete,
  routeName
}) => {
  const [comments, setComments] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const handleComplete = async () => {
    setIsCompleting(true);
    
    try {
      // Simulate completion process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onComplete(comments);
      
      toast({
        title: "Voyage Completed",
        description: `${routeName} has been successfully completed.`
      });
      
      setComments('');
      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete voyage. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = () => {
    setComments('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Voyage</DialogTitle>
          <DialogDescription>
            You are about to complete the voyage for <strong>{routeName}</strong>. 
            Please provide any final comments or observations.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Textarea
            placeholder="Enter completion comments (optional)..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="min-h-[100px]"
            disabled={isCompleting}
          />
        </div>
        
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isCompleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={isCompleting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isCompleting ? 'Completing...' : 'Complete Voyage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CompleteVoyageDialog;
