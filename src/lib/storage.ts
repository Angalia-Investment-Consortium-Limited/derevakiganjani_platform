import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};

export const getFileUrl = async (path: string) => {
    const storageRef = ref(storage, path);
    return getDownloadURL(storageRef);
};
