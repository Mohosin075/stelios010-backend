export type ISubscriptionFilterRequest = {
  plan?: string;
  status?: string;
  pioneerId?: string;
  searchTerm?: string;
};

export interface ISubscriptionStats {
  activeSubscriptions: number;
  monthlyPlans: number;
  annualPlans: number;
  monthlyRevenue: string;
  annualRevenue: string;
}
