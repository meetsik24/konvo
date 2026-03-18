import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/pages/Dashboard';
import { Conversations } from './components/pages/Conversations';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'conversations':
        return <Conversations />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop sidebar */}
      <Sidebar
        className="hidden md:flex"
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Mobile header + drawer nav */}
      <div className="flex-1 min-w-0 flex flex-col">
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Menu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">KONVO</div>
              <div className="text-xs text-gray-500">BRIQ WhatsApp</div>
            </div>
          </div>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open navigation">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <Sidebar
                className="h-full border-r-0"
                currentPage={currentPage}
                onNavigate={(page) => {
                  setCurrentPage(page);
                  setMobileNavOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex-1 min-h-0 overflow-auto">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}

export default App;
