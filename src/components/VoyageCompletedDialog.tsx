
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, X } from 'lucide-react';

interface VoyageCompletedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routeName: string;
}

const VoyageCompletedDialog: React.FC<VoyageCompletedDialogProps> = ({
  isOpen,
  onClose,
  routeName
}) => {
  const navigate = useNavigate();

  const handleOkClick = () => {
    onClose();
    navigate('/routes');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border-2 border-dashed border-blue-300 bg-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader className="flex flex-col items-center space-y-4 pt-6">
          <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          
          <DialogTitle className="text-2xl font-bold text-gray-800 text-center">
            Voyage Completed
          </DialogTitle>
          
          <p className="text-gray-500 text-center">
            {routeName} has been successfully completed
          </p>
        </DialogHeader>
        
        <div className="pt-6 pb-4">
          <Button 
            onClick={handleOkClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 text-lg"
          >
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VoyageCompletedDialog;
