import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function SuccessAlert({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <Alert className="mb-4" onClick={onClose}>
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
} 