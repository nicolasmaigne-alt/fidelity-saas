export interface Restaurant {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  logo?: string;
  colors: {
    primary: string;
    secondary: string;
  };
  proximityRadius: number;
  createdAt: Date;
  plan: 'free' | 'starter' | 'pro';
}

export interface LoyaltyProgram {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  requiredPurchases: number;
  rewardType: 'product' | 'discount' | 'custom';
  rewardValue: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
}

export interface LoyaltyCard {
  id: string;
  customerId: string;
  restaurantId: string;
  programId: string;
  purchaseCount: number;
  lastPurchaseDate?: Date;
  isRewardClaimed: boolean;
  qrCode: string;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  loyaltyCardId: string;
  restaurantId: string;
  customerId: string;
  productName: string;
  purchasedAt: Date;
  scannedBy: string;
}