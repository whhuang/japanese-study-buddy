import { NavButton } from '@/components/common/NavButton';

function HomePage() {
    return (
        <div>
            <div className="my-8 text-2xl text-center">
                Japanese Study Buddy
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
                <NavButton to="/settings" variant="secondary">
                    Settings
                </NavButton>
                <NavButton to="/vocabulary" variant="secondary" buttonClassName="row-start-2" >
                    Vocabulary
                </NavButton>
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