import StatBar from './StatBar';
import { getPetStageByStats, getPetStageLabel } from '../utils/rewards';

function PetCard({ pet, compact = false, statGains = {} }) {
  if (!pet) {
    return null;
  }

  const petType = pet.type || 'cat';
  const petStage = getPetStageByStats(pet);
  const petImage = `${process.env.PUBLIC_URL}/assets/pets/${petType}/${petStage}.png`;

  return (
    <section className={`pet-card ${compact ? 'pet-card--compact' : ''}`.trim()}>
      <div className="pet-card__avatar" aria-hidden="true">
        <img className="pet-card__image" src={petImage} alt="" />
      </div>
      <h2>{pet.name}</h2>
      <p>{getPetStageLabel(pet)}</p>
      <div className="pet-card__stats">
        <StatBar gain={statGains.xp} label="XP" value={pet.xp} max={pet.nextLevelXp} tone="mint" />
        <StatBar gain={statGains.hp} label="HP" value={pet.hp} max={100} tone="danger" />
        <StatBar gain={statGains.energy} label="Energy" value={pet.energy} max={100} tone="warning" />
      </div>
    </section>
  );
}

export default PetCard;
