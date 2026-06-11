import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Header({ coins = 0, userLevel = 'Level 12 Guardian' }) {
  const { currentUser } = useAuth();
  
  // Pobieramy imię z konta Google. Jeśli z jakiegoś powodu jest puste,
  // lub to rejestracja bez nazwy, wyświetlamy "Konto Testowe".
  const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Konto Testowe';
  return (
    <header className="app-header">
      <Link className="brand" to="/home">
        Focus Pet
      </Link>

      <div className="balance" aria-label="User balance">
        <span>Balance:</span>
        <strong>{coins.toLocaleString('en-US')} Coins</strong>
      </div>

      <div className="app-header__profile">
        <Link className="logout-link" to="/logout">
          Log out
        </Link>
        <div>
          <strong>{displayName}</strong>
          <span>{userLevel}</span>
        </div>
      </div>
    </header>
  );
}

export default Header;
