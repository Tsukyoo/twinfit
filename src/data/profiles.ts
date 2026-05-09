import type { Profile } from '../types';

export const profiles: Profile[] = [
  {
    id: 'teoman',
    name: 'Teoman',
    age: 17,
    heightCm: 183,
    initialWeightKg: 81,
    goalWeightKg: 76,
    goal: 'Recomposition corporelle',
    color: '#34c759',
    nutritionTargets: {
      calories: 2500,
      proteinG: 160,
      carbsG: 290,
      fatG: 75,
      waterMl: 3000,
    },
    trainingDays: ['monday', 'wednesday', 'friday', 'saturday'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'denizhan',
    name: 'Denizhan',
    age: 18,
    heightCm: 180,
    initialWeightKg: 62,
    goalWeightKg: 72,
    goal: 'Prise de masse propre esthétique',
    color: '#ff3b30',
    nutritionTargets: {
      calories: 2800,
      proteinG: 140,
      carbsG: 400,
      fatG: 70,
      waterMl: 3000,
    },
    trainingDays: ['monday', 'wednesday', 'friday', 'saturday'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getProfileById(id: string): Profile | undefined {
  return profiles.find((p) => p.id === id);
}

export function getAllProfiles(): Profile[] {
  return profiles;
}
