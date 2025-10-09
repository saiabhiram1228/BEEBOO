
import { config } from 'dotenv';
config({ path: '.env.local' });
config();

import '@/ai/flows/cart-item-recommendations.ts';
