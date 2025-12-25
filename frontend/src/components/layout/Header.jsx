// Header component
// TODO: Implement navigation header

function Header() {
  return (
    <header className="bg-white shadow">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold">HUEACC</div>
          <div className="space-x-4">
            {/* Navigation links */}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
