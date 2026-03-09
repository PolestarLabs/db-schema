import type { Currency, PrimeTier, PrimeInfo, Profilecard } from '../../types/generics';

/** Front-facing user type returned by DB.Users.get() and DB.users.get(). */
export interface User {
  id: string;
  name: string;
  tag: string;
  avatar: string | null;
  personalHandle?: string;
  currency: { [K in Currency]: number };
  progression: {
    level: number;
    exp: number;
  };
  profile: Profilecard;
  prime: PrimeInfo | null;
  blacklisted: string | null;
  switches: Record<string, any>;
  counters: Record<string, any>;
  eventData: Record<string, any>;
  meta: {
    createdAt: Date;
    lastLogin: Date | null;
    lastUpdated: Date;
  };

  // Instance methods (only available on full documents via getFull)
  addCurrency(currency: Currency, amount?: number): Promise<any>;
  addXP(amount?: number): Promise<any>;
  incrementAttr(attr: string, amount?: number): Promise<any>;
}
