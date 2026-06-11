import { mockShopItems } from './mockShopItems';
import { mockTasks } from './mockTasks';

export const petChoices = [
  { id: 'dragon', label: 'Friendly Dragon', eggImage: '/assets/pets/dragon/egg.png' },
  { id: 'horse', label: 'Cute Horse', eggImage: '/assets/pets/horse/egg.png' },
  { id: 'fox', label: 'Lovely Fox', eggImage: '/assets/pets/fox/egg.png' },
  { id: 'cat', label: 'Magic Cat', eggImage: '/assets/pets/cat/egg.png' },
  { id: 'dog', label: 'Funny Dog', eggImage: '/assets/pets/dog/egg.png' },
];

export const initialAppState = {
  user: {
    id: 'user-1',
    name: 'MochiMaster',
    email: 'cosmic@focuspet.com',
    level: 12,
    title: 'Level 12 Guardian',
  },
  coins: 1250,
  pet: {
    id: 'pet-1',
    name: 'Kumo',
    type: 'cat',
    stage: 'adult',
    stageLabel: 'Adult Guardian',
    hp: 82,
    energy: 68,
    xp: 34,
    nextLevelXp: 100,
  },
  tasks: mockTasks,
  shopItems: mockShopItems,
  inventory: ['item-1'],
  currentSession: null,
  history: [],
};
