import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { uploadFile } from "@/lib/firebase";
import { ImageViewer } from "@/components/ui/image-viewer";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileImageUploadProps {
  currentImageUrl?: string;
  userName?: string;
  isEditing?: boolean;
}

export function ProfileImageUpload({ 
  currentImageUrl, 
  userName = "User",
  isEditing = false
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, updateUser, updateProfile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const getInitials = () => {
    if (!userName) return "U";
    return userName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('error') || "Error",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t('error') || "Error",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const path = `profile_images/${user?.uid}_${Date.now()}`;
      const downloadUrl = await uploadFile(file, path);
      
      // Update the user document with the new image
      await updateUser({ user_image: downloadUrl });
      
      // Additionally update profile document as a fallback / to keep them synced
      await updateProfile({ avatar_url: downloadUrl });
      
      await refreshProfile();
      
      toast({
        title: t('success') || "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: t('error') || "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset the file input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const avatarContent = (
    <div className={`relative inline-block ${isEditing ? 'cursor-pointer' : ''}`} onClick={handleAvatarClick}>
      <Avatar className="h-24 w-24 mb-4 ring-2 ring-transparent transition-all hover:ring-primary/50">
        <AvatarImage src={currentImageUrl} alt={userName} className="object-cover" />
        <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
      </Avatar>
      
      {isUploading && (
        <div className="absolute inset-0 mb-4 bg-background/50 rounded-full flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {isEditing && !isUploading && (
        <div className="absolute bottom-4 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md border-2 border-background transform translate-x-1/4 translate-y-1/4">
          <Camera className="h-4 w-4" />
        </div>
      )}

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );

  // If we are not editing, wrap the avatar in an ImageViewer so it zooms on click
  if (!isEditing && currentImageUrl) {
    return (
      <ImageViewer src={currentImageUrl} alt={userName}>
        {avatarContent}
      </ImageViewer>
    );
  }

  // If editing, clicking should trigger file input, NOT open the viewer.
  return avatarContent;
}
