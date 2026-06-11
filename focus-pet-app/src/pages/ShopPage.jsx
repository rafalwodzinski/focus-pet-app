import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import Button from '../components/Button';
import Header from '../components/Header';
import PetCard from '../components/PetCard';
import ShopItemCard from '../components/ShopItemCard';
import { getUserData, saveUserData } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import { initialAppState } from '../data/initialState';

const filters = ['All', 'Food', 'Accessories'];
const maxPetStat = 100;
const petStatLabels = {
  energy: 'Energy',
  hp: 'HP',
};

function applyItemEffect(pet, effect) {
  if (!effect) {
    return pet;
  }

  return {
    ...pet,
    [effect.stat]: Math.min((pet[effect.stat] || 0) + effect.value, maxPetStat),
  };
}

function ShopPage() {
  const { currentUser } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [appState, setAppState] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [lastStatGain, setLastStatGain] = useState({});

  useEffect(() => {
    async function fetchData() {
      if (!currentUser) return;
      const data = await getUserData(currentUser.uid);
      setAppState(data || initialAppState);
    }
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (!Object.keys(lastStatGain).length) {
      return undefined;
    }

    const hideGainTimer = setTimeout(() => {
      setLastStatGain({});
    }, 1000);

    return () => clearTimeout(hideGainTimer);
  }, [lastStatGain]);

  if (!appState) {
    return (
      <main className="app-shell">
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>
          <div className="loading-spinner"></div>
        </div>
      </main>
    );
  }

  const { coins, pet, shopItems, user } = appState;

  const visibleItems = shopItems.filter((item) => {
    if (activeFilter === 'All') return true;
    return item.category === activeFilter.toLowerCase();
  });

  function handleBuyItem(itemId) {
    const selectedItem = appState.shopItems.find((item) => item.id === itemId);

    if (!selectedItem) {
      setPurchaseMessage('Item not found.');
      setLastStatGain({});
      return;
    }

    if (selectedItem.owned) {
      setPurchaseMessage(`${selectedItem.name} is already in your inventory.`);
      setLastStatGain({});
      return;
    }

    if (appState.coins < selectedItem.price) {
      setPurchaseMessage(`Not enough coins to buy ${selectedItem.name}.`);
      setLastStatGain({});
      return;
    }

    const nextState = {
      ...appState,
      coins: appState.coins - selectedItem.price,
      inventory: appState.inventory.includes(itemId)
        ? appState.inventory
        : [...appState.inventory, itemId],
      pet: applyItemEffect(appState.pet, selectedItem.effect),
      shopItems: appState.shopItems.map((item) =>
        item.id === itemId ? { ...item, owned: true } : item
      ),
    };

    saveUserData(currentUser.uid, nextState);
    setAppState(nextState);

    if (selectedItem.effect) {
      setLastStatGain({ [selectedItem.effect.stat]: selectedItem.effect.value });
      setPurchaseMessage(
        `${selectedItem.name} purchased successfully. ${petStatLabels[selectedItem.effect.stat]} +${selectedItem.effect.value}.`
      );
      return;
    }

    setLastStatGain({});
    setPurchaseMessage(`${selectedItem.name} purchased successfully.`);
  }

  return (
    <main className="app-shell">
      <Header coins={coins} userLevel={user.title} userName={user.name} />
      <section className="page-content page-content--two-columns">
        <div>
          <h1>Pet Shop</h1>
          <div className="segmented-control">
            {filters.map((filter) => (
              <button
                className={activeFilter === filter ? 'is-active' : ''}
                key={filter}
                onClick={() => setActiveFilter(filter)}
                type="button"
              >
                {filter}
              </button>
            ))}
          </div>

          {purchaseMessage ? <p className="shop-feedback">{purchaseMessage}</p> : null}

          <div className="shop-grid">
            {visibleItems.map((item) => (
              <ShopItemCard item={item} key={item.id} onBuy={handleBuyItem} />
            ))}
          </div>
        </div>

        <aside>
          <PetCard compact pet={pet} statGains={lastStatGain} />
          
          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {pet.hp <= 0 ? (
              <Link state={{ isRegeneration: true }} to="/session">
                <Button style={{ background: 'var(--danger)', color: '#fff' }}>Regeneration (30m)</Button>
              </Link>
            ) : (
              <Link to="/session">
                <Button>Start Session</Button>
              </Link>
            )}
          </div>
        </aside>
      </section>

      <BottomNav />
    </main>
  );
}

export default ShopPage;
