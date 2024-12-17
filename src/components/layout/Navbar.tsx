import { Bell, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { MobileNav } from './MobileNav';

export function Navbar() {
  return (
    <nav className="fixed top-0 z-40 w-full bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <MobileNav />
          </div>
          
          <div className="flex items-center gap-x-4">
            <button
              type="button"
              className="rounded-full bg-white p-1.5 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">View notifications</span>
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <div className="flex items-center gap-x-4">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-500" />
                </div>
                <div className="hidden lg:flex lg:items-center lg:gap-x-6">
                  <span className="text-sm font-semibold leading-6 text-gray-900">
                    John Doe
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => console.log('logout')}
                  >
                    Log out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}