import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';
import { getUserData } from '../utils/storage';
import { getPetStageByStats } from '../utils/rewards';
import './AuthPages.css';

const LogoutPage = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [pet, setPet] = useState(initialAppState.pet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPetData() {
      if (!currentUser) return;

      const data = await getUserData(currentUser.uid);
      setPet(data?.pet || initialAppState.pet);
    }

    fetchPetData();
  }, [currentUser]);

  const petType = pet?.type || initialAppState.pet.type;
  const petStage = getPetStageByStats(pet);
  const petImage = `${process.env.PUBLIC_URL}/assets/pets/${petType}/${petStage}.png`;

  const handleLogout = async () => {
    setError('');
    setLoading(true);
      try {
        await logout();
        navigate('/login', { replace: true });
      } catch (error) {
        console.error("Failed to log out", error);
        // Nawet jeśli wylogowanie z bazy wyrzuci błąd, bezpiecznie przekierowujemy:
        navigate('/login', { replace: true });
      }
    };

  const handleStay = () => {
    navigate('/home');
  };

  return (
    <main className="center-page logout-page">
      <Link className="brand center-page__brand" to="/home">
        Focus Pet
      </Link>

      <section className="modal-card logout-card">
        <div className="logout-avatar" aria-hidden="true">
          <img
            className="logout-avatar__image"
            src={petImage}
            alt=""
          />
        </div>

        <h1>Before you go...</h1>
        <p>
          Your pet will be waiting for you.
          <br />
          Are you sure you want to log out?
        </p>

        {error && <div className="field__error">{error}</div>}

        <div className="button-stack logout-actions">
          <Button onClick={handleLogout} disabled={loading}>
            {loading ? 'Logging out...' : 'Log out'}
          </Button>
          <Button variant="secondary" onClick={handleStay} disabled={loading}>
            Stay with Focus Pet
          </Button>
        </div>
      </section>
    </main>
  );
};

export default LogoutPage;
