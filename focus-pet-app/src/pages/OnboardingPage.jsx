import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { petChoices, initialAppState } from '../data/initialState';
import { useAuth } from '../context/AuthContext';
import { saveUserData } from '../utils/storage';

function OnboardingPage() {
  const [selectedPet, setSelectedPet] = useState(petChoices[2].id);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  async function handleStart(event) {
    event.preventDefault();
    if (!petName.trim() || !currentUser) return;
    
    setLoading(true);
    const chosenPetData = petChoices.find(p => p.id === selectedPet);
    
    const startingState = {
      ...initialAppState,
      pet: {
        ...initialAppState.pet,
        type: selectedPet,
        name: petName,
        stage: 'baby',
        stageLabel: `Baby ${chosenPetData.label}`
      }
    };
    
    await saveUserData(currentUser.uid, startingState);
    setLoading(false);
    navigate('/home');
  }

  return (
    <main className="onboarding-page">
      <a className="brand" href="/login">
        Focus Pet
      </a>
      <form className="onboarding-card" onSubmit={handleStart}>
        <h1>Welcome to Focus Pet</h1>
        <p>Your digital productivity companion</p>

        <Input 
          id="petName" 
          label="Pet name" 
          placeholder="Give your pet a name" 
          value={petName}
          onChange={(e) => setPetName(e.target.value)}
          required
        />

        <div className="pet-choice-grid" role="list">
          {petChoices.map((pet) => (
            <button
              className={`pet-choice ${selectedPet === pet.id ? 'pet-choice--active' : ''}`}
              key={pet.id}
              onClick={() => setSelectedPet(pet.id)}
              type="button"
            >
              <img
                className="pet-choice__image"
                src={`${process.env.PUBLIC_URL}${pet.eggImage}`}
                alt=""
                aria-hidden="true"
              />
              <span>{pet.label}</span>
            </button>
          ))}
        </div>

        <Button type="submit" disabled={loading}>
          {loading ? 'Starting...' : 'Start'}
        </Button>
      </form>
    </main>
  );
}

export default OnboardingPage;
