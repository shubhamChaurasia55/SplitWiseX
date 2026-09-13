import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import useAuthStore from "../stores/auth.store";

import useNotificationStore from "../stores/notification.store";

function AppLayout() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const notifications = useNotificationStore((state) => state.notifications);

  const loadNotifications = useNotificationStore(
    (state) => state.loadNotifications,
  );

  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);

  const isLoadingNotifications = useNotificationStore(
    (state) => state.isLoading,
  );

  const notificationRef = useRef(null);

  const navItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 9.5V21h14V9.5" />
          <path d="M9 21v-6h6v6" />
        </svg>
      ),
    },
    {
      name: "Groups",
      path: "/groups",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error("Unable to mark notifications as read:", error);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* ================================= */}
        {/* Desktop Sidebar                   */}
        {/* ================================= */}

        <aside className="fixed inset-y-0 left-0 z-40 hidden h-screen w-64 flex-col border-r border-gray-200 bg-white lg:flex">
          {/* Logo */}
          <div className="flex h-16 items-center border-b border-gray-100 px-6">
            <h1 className="text-xl font-semibold tracking-tight text-gray-900">
              SplitWiseX
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-100 p-4">
            <div className="mb-4">
              <p className="truncate text-sm font-semibold text-gray-900">
                {user?.name}
              </p>

              <p className="mt-1 truncate text-xs text-gray-500">
                {user?.email}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
            >
              Sign out
            </button>
          </div>
        </aside>

        {/* ================================= */}
        {/* Main Area                          */}
        {/* ================================= */}

        <div className="min-h-screen w-full lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
            {/* Mobile logo */}
            <div className="md:hidden">
              <h1 className="text-lg font-semibold tracking-tight text-gray-900">
                SplitWiseX
              </h1>
            </div>

            {/* Desktop title */}
            <p className="hidden text-sm text-gray-500 md:block">
              Expense management
            </p>

            <div className="flex items-center gap-4">
              {/* Notification */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsNotificationOpen((current) => !current)}
                  className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                  aria-label="Notifications"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                    <path d="M10 21h4" />
                  </svg>

                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification dropdown */}
                {isNotificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    {/* Dropdown header */}
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <h2 className="text-sm font-semibold text-gray-900">
                        Notifications
                      </h2>

                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-xs font-medium text-gray-600 hover:text-gray-900"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    {/* Notification list */}
                    {isLoadingNotifications ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">Loading...</p>
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <p className="text-sm text-gray-500">
                          No notifications yet.
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-80 overflow-y-auto">
                        {recentNotifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`border-b border-gray-100 px-4 py-4 ${
                              !notification.is_read ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <div className="flex gap-3">
                              {!notification.is_read && (
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-900" />
                              )}

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900">
                                  {notification.title}
                                </p>

                                <p className="mt-1 text-xs leading-5 text-gray-600">
                                  {notification.message}
                                </p>

                                <p className="mt-2 text-[11px] text-gray-400">
                                  {new Date(
                                    notification.created_at,
                                  ).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* View all */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsNotificationOpen(false);
                        navigate("/notifications");
                      }}
                      className="w-full px-4 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      View all notifications →
                    </button>
                  </div>
                )}
              </div>

              {/* User */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-gray-100"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-sm font-medium text-white">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </div>

                  <span className="hidden text-sm font-medium text-gray-700 sm:block">
                    {user?.name}
                  </span>

                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="hidden h-4 w-4 text-gray-400 sm:block"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {user?.name}
                      </p>

                      <p className="mt-1 truncate text-xs text-gray-500">
                        {user?.email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Page */}
          <main className="flex-1 px-4 py-6 pb-24 md:p-6 md:pb-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ================================= */}
      {/* Mobile Bottom Navigation           */}
      {/* ================================= */}

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="grid grid-cols-3">
          <MobileNavItem
            to="/dashboard"
            label="Home"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
              </svg>
            }
          />

          <MobileNavItem
            to="/groups"
            label="Groups"
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />

          <MobileNavItem
            to="/notifications"
            label="Alerts"
            badge={unreadCount}
            icon={
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            }
          />
        </div>
      </nav>
    </div>
  );
}

function MobileNavItem({ to, label, icon, badge = 0 }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium ${
          isActive ? "text-gray-900" : "text-gray-500"
        }`
      }
    >
      <div className="relative">
        {icon}

        {badge > 0 && (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-semibold text-white">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </div>

      <span>{label}</span>
    </NavLink>
  );
}

export default AppLayout;
