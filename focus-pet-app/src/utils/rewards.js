export const PET_ADULT_XP_THRESHOLD = 100;

const petTypeLabels = {
  dragon: 'Friendly Dragon',
  horse: 'Cute Horse',
  fox: 'Lovely Fox',
  cat: 'Magic Cat',
  dog: 'Funny Dog',
};

function getPetTypeLabel(pet) {
  if (pet?.typeLabel) {
    return pet.typeLabel;
  }

  if (pet?.stageLabel) {
    return pet.stageLabel.replace(/^(Baby|Adult|Hibernating)\s+/, '');
  }

  return petTypeLabels[pet?.type] || 'Focus Pet';
}

export function getPetStageByStats(pet) {
  if (!pet) {
    return 'baby';
  }

  if ((pet.hp ?? 0) <= 0) {
    return 'hibernation';
  }

  if (pet.stage === 'adult' || (pet.xp ?? 0) >= (pet.nextLevelXp ?? PET_ADULT_XP_THRESHOLD)) {
    return 'adult';
  }

  return 'baby';
}

export function getPetStageLabel(pet) {
  const stage = getPetStageByStats(pet);
  const petLabel = getPetTypeLabel(pet);

  if (stage === 'hibernation') {
    return `Hibernating ${petLabel}`;
  }

  if (stage === 'adult') {
    return `Adult ${petLabel}`;
  }

  return `Baby ${petLabel}`;
}

export function applyPetEvolution(pet) {
  const stage = getPetStageByStats(pet);
  const evolvedPet = {
    ...pet,
    stage,
  };

  return {
    ...evolvedPet,
    stageLabel: getPetStageLabel(evolvedPet),
  };
}

export function calculateSessionRewards(durationSeconds) {
  const minutes = durationSeconds / 60;
  const hasFocusTime = durationSeconds > 0;

  return {
    coins: hasFocusTime ? Math.max(Math.round(minutes * 2), 1) : 0,
    xp: hasFocusTime ? Math.max(Math.floor(minutes / 5), 1) : 0,
    hp: hasFocusTime ? Math.max(Math.round(minutes * 0.6), 1) : 0,
  };
}

export function calculateTaskReward(task) {
  const priorityMultiplier = {
    low: 1,
    medium: 1.5,
    high: 2,
  };

  return {
    coins: Math.round(25 * (priorityMultiplier[task.priority] || 1)),
    xp: Math.round(10 * (priorityMultiplier[task.priority] || 1)),
  };
}

export function applyPetDamage(pet, damage) {
  return applyPetEvolution({
    ...pet,
    hp: Math.max((pet.hp ?? 0) - damage, 0),
  });
}
