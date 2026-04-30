import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { ReactNode } from "react";

interface ImageViewerProps {
  src: string | undefined | null;
  alt?: string;
  children: ReactNode;
}

export function ImageViewer({ src, alt = "Image", children }: ImageViewerProps) {
  if (!src) {
    return <>{children}</>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="cursor-pointer transition-opacity hover:opacity-80">
          {children}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full p-2 bg-transparent border-none shadow-none flex justify-center items-center [&>button]:text-white">
        <DialogTitle className="sr-only">View Image</DialogTitle>
        <img 
          src={src} 
          alt={alt} 
          className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl" 
        />
      </DialogContent>
    </Dialog>
  );
}
