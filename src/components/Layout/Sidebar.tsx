import {
  LayoutDashboard,
  Target,
  Calendar,
  GitBranch,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  Zap
} from 'lucide-react';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '#', active: true },
  { icon: Target, label: 'Scoreboard', href: '#scoreboard' },
  { icon: Calendar, label: 'Meetings', href: '#meetings' },
  { icon: GitBranch, label: 'Decisions', href: '#decisions', badge: '3' },
  { icon: BarChart3, label: 'Analytics', href: '#analytics' },
  { icon: Users, label: 'Team', href: '#team' },
];

const bottomNavItems: NavItem[] = [
  { icon: Settings, label: 'Settings', href: '#settings' },
  { icon: HelpCircle, label: 'Help', href: '#help' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Blueprint</h2>
            <p className="text-xs text-slate-400">Business OS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {mainNavItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                  ${item.active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
