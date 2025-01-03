import { 
  collection,
  doc,
  getDocs, 
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Role } from '@/types';

const COLLECTION = 'roles';

export async function getRoles(): Promise<Role[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Role[];
}

export async function createRole(roleData: Omit<Role, 'id'>): Promise<Role> {
  const roleRef = doc(collection(db, COLLECTION));
  const role: Role = {
    id: roleRef.id,
    ...roleData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(roleRef, role);
  return role;
}

export async function updateRole(id: string, roleData: Partial<Role>): Promise<void> {
  const roleRef = doc(db, COLLECTION, id);
  await updateDoc(roleRef, {
    ...roleData,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRole(id: string): Promise<void> {
  const roleRef = doc(db, COLLECTION, id);
  await deleteDoc(roleRef);
}