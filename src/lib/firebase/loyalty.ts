import { collection, doc, setDoc, getDocs, updateDoc, query, where, increment, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { LoyaltyCard, LoyaltyProgram, Purchase } from '@/types';
import { nanoid } from 'nanoid';

export const createLoyaltyProgram = async (restaurantId: string, data: Omit<LoyaltyProgram, 'id' | 'createdAt'>) => {
  const programId = nanoid();
  const programRef = doc(db, 'loyaltyPrograms', programId);
  const program: LoyaltyProgram = {
    ...data,
    id: programId,
    restaurantId,
    createdAt: new Date(),
  };
  await setDoc(programRef, program);
  return program;
};

export const getLoyaltyProgram = async (restaurantId: string): Promise<LoyaltyProgram | null> => {
  const q = query(
    collection(db, 'loyaltyPrograms'),
    where('restaurantId', '==', restaurantId),
    where('isActive', '==', true)
  );
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data() as LoyaltyProgram;
  }
  return null;
};

export const createLoyaltyCard = async (customerId: string, restaurantId: string, programId: string): Promise<LoyaltyCard> => {
  const cardId = nanoid();
  const qrCode = `LOYALTY-${restaurantId}-${cardId}`;
  const card: LoyaltyCard = {
    id: cardId,
    customerId,
    restaurantId,
    programId,
    purchaseCount: 0,
    isRewardClaimed: false,
    qrCode,
    createdAt: new Date(),
  };
  const cardRef = doc(db, 'loyaltyCards', cardId);
  await setDoc(cardRef, card);
  return card;
};

export const scanQRCode = async (qrCode: string, scannedBy: string, productName: string) => {
  const q = query(collection(db, 'loyaltyCards'), where('qrCode', '==', qrCode));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    throw new Error('Carte non trouvée');
  }
  const cardDoc = querySnapshot.docs[0];
  const card = cardDoc.data() as LoyaltyCard;
  const purchaseId = nanoid();
  const purchase: Purchase = {
    id: purchaseId,
    loyaltyCardId: card.id,
    restaurantId: card.restaurantId,
    customerId: card.customerId,
    productName,
    purchasedAt: new Date(),
    scannedBy,
  };
  await setDoc(doc(db, 'purchases', purchaseId), purchase);
  const cardRef = doc(db, 'loyaltyCards', card.id);
  await updateDoc(cardRef, {
    purchaseCount: increment(1),
    lastPurchaseDate: serverTimestamp(),
  });
  return {
    ...card,
    purchaseCount: card.purchaseCount + 1,
  };
};