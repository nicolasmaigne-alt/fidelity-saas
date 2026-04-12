import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { Restaurant } from '@/types';

export const createRestaurant = async (userId: string, data: Omit<Restaurant, 'id' | 'createdAt'>) => {
  const restaurantRef = doc(db, 'restaurants', userId);
  const restaurant: Restaurant = {
    ...data,
    id: userId,
    createdAt: new Date(),
  };
  await setDoc(restaurantRef, restaurant);
  return restaurant;
};

export const getRestaurant = async (restaurantId: string): Promise<Restaurant | null> => {
  const restaurantRef = doc(db, 'restaurants', restaurantId);
  const restaurantSnap = await getDoc(restaurantRef);
  if (restaurantSnap.exists()) {
    return restaurantSnap.data() as Restaurant;
  }
  return null;
};

export const updateRestaurant = async (restaurantId: string, data: Partial<Restaurant>) => {
  const restaurantRef = doc(db, 'restaurants', restaurantId);
  await updateDoc(restaurantRef, data);
};