import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

function HomePage() {
    return (
        <div>
            <div className="my-8 text-2xl text-center">
                Japanese Study Buddy
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
                <Button variant="secondary">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            cn(
                            "transition-colors hover:text-primary",
                            !isActive && "text-muted-foreground"
                            )
                        }
                    >
                        Settings
                    </NavLink>
                </Button>
                <Button variant="secondary" className="row-start-2">
                    <NavLink
                        to="/vocabulary"
                        className={({ isActive }) =>
                            cn(
                            "transition-colors hover:text-primary",
                            !isActive && "text-muted-foreground"
                            )
                        }
                    >
                        Vocabulary
                    </NavLink>
                </Button>
                <div className="row-start-2">
                    Last studied: 
                </div>
                <div className="row-start-2">
                    % goal hit
                </div>
            </div>
        </div>
    );
  }
  
export default HomePage;