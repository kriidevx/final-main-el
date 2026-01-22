"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, AlertTriangle, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EmergencyButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCalling, setIsCalling] = useState(false);

  const handleEmergencyCall = () => {
    setIsCalling(true);
    // Simulate emergency call
    setTimeout(() => {
      setIsCalling(false);
      setIsDialogOpen(false);
    }, 3000);
  };

  return (
    <>
      <Button
        variant="destructive"
        size="lg"
        onClick={() => setIsDialogOpen(true)}
        className="relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          <span>Emergency</span>
        </div>
      </Button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              Emergency Services
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to contact emergency services? This will connect you to local emergency assistance.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900 dark:text-red-100">Emergency Contact</p>
                  <p className="text-sm text-red-700 dark:text-red-300">Local emergency services will be contacted</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="w-full"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleEmergencyCall}
                disabled={isCalling}
                className="w-full"
              >
                {isCalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
