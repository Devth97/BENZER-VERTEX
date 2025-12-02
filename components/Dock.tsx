
import React, { useRef, useState, useEffect } from "react";
import { LayoutDashboard, ShoppingBag, Users, Wand2, Images, Library } from "lucide-react";

// --- Utils ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Types ---
interface DockProps {
  className?: string;
  children: React.ReactNode;
}

interface DockIconProps {
  children: React.ReactNode;
  // Make mouseX optional because it's injected by the parent Dock via cloneElement
  mouseX?: React.MutableRefObject<number | null>; 
  onClick?: () => void;
  isActive?: boolean;
}

// --- Components ---

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  ({ className, children }, ref) => {
    const mouseX = useRef<number | null>(null);

    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto flex h-16 items-end gap-2 rounded-full bg-white/40 px-4 pb-3 backdrop-blur-2xl border border-white/40 shadow-2xl ring-1 ring-white/50",
          className
        )}
        onMouseMove={(e) => {
          mouseX.current = e.pageX;
        }}
        onMouseLeave={() => {
          mouseX.current = null;
        }}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // @ts-ignore - cloning to inject mouseX
            return React.cloneElement(child, { mouseX });
          }
          return child;
        })}
      </div>
    );
  }
);
Dock.displayName = "Dock";

const DockIcon: React.FC<DockIconProps> = ({ children, mouseX, onClick, isActive }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(50); // Default size

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      // Safety check: ensure ref and mouseX exist
      if (ref.current && mouseX && mouseX.current !== null) {
        const rect = ref.current.getBoundingClientRect();
        const iconCenterX = rect.left + rect.width / 2;
        const dist = mouseX.current - iconCenterX;
        
        const width = 50; // Base width
        const magnification = 85; // Max width
        const distanceLimit = 150; // Distance of effect
        
        const val = Math.abs(dist);
        let newSize = width;
        if (val < distanceLimit) {
           newSize = width + (magnification - width) * Math.cos((val / distanceLimit) * Math.PI / 2);
        }
        setSize(newSize);
      } else {
        setSize(50); // Reset to base size if no mouse or not hovered
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [mouseX]);

  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={cn(
        "relative flex aspect-square cursor-pointer items-center justify-center rounded-full transition-all duration-100 ease-out bg-white/40 hover:bg-white/90 border border-white/20 shadow-sm",
        isActive && "bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] border-white ring-2 ring-indigo-100"
      )}
    >
      <div 
        className="flex items-center justify-center w-full h-full" 
        style={{ transform: `scale(${size/50})` }} 
      >
        {children}
      </div>
    </div>
  );
};

// --- App Specific Dock ---

interface AppDockProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const AppDock: React.FC<AppDockProps> = ({ activePage, onNavigate }) => {
  // Configured strictly as requested: Main apps only, no settings/logout
  const items = [
    { id: 'collections', label: 'Collections', icon: Library },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'studio', label: 'AI Studio', icon: Wand2 },
    { id: 'gallery', label: 'Gallery', icon: Images },
    { id: 'catalog', label: 'Catalog', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
  ];

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] lg:ml-36"> 
      {/* lg:ml-36 offsets the dock to center it relative to the VIEWPORT, accounting for visual balance with sidebar if needed, 
          but usually fixed center is safer. Let's keep it mostly centered but shift slightly if sidebar is open to look 'centered in content area'. 
          Actually, centering in viewport (left-1/2) is usually standard Mac dock behavior regardless of windows. */}
      <Dock className="mb-0">
        {items.map((item) => (
          <DockIcon 
            key={item.id} 
            onClick={() => onNavigate(item.id)}
            isActive={activePage === item.id || (item.id === 'studio' && activePage === 'result')}
          >
            <div className="group relative flex items-center justify-center w-full h-full">
               <item.icon 
                  className={cn(
                    "w-6 h-6 transition-colors duration-200", 
                    activePage === item.id ? "text-indigo-600" : "text-slate-600 group-hover:text-slate-900"
                  )} 
               />
               {/* Simple Tooltip */}
               <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                 {item.label}
               </span>
               {/* Active Dot */}
               {activePage === item.id && (
                 <span className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
               )}
            </div>
          </DockIcon>
        ))}
      </Dock>
    </div>
  );
};
