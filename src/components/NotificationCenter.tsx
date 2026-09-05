import React from "react";
import { CivicNotification } from "../types";
import {
  getStoredNotifications,
  markNotificationAsRead as defaultMarkAsRead,
  markAllNotificationsAsRead as defaultMarkAllAsRead
} from "../services/storage";
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  X,
  CheckCheck,
  FileText
} from "lucide-react";

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications?: CivicNotification[];
  currentUserRole?: "citizen" | "authority";
  onSelectIssue: (issueId: string) => void;
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
  id?: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  currentUserRole,
  onSelectIssue,
  onMarkAsRead,
  onMarkAllAsRead,
  id
}) => {
  if (!isOpen) return null;

  const notifList: CivicNotification[] = Array.isArray(notifications)
    ? notifications
    : getStoredNotifications(currentUserRole);

  const safeNotifications = Array.isArray(notifList) ? notifList : [];
  const unreadCount = safeNotifications.filter((n) => n && !n.isRead).length;

  const handleMarkAsRead = (notifId: string) => {
    if (onMarkAsRead) {
      onMarkAsRead(notifId);
    } else {
      defaultMarkAsRead(notifId);
    }
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      defaultMarkAllAsRead();
    }
  };

  const getIcon = (type: CivicNotification["type"]) => {
    switch (type) {
      case "assigned":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "verification_needed":
        return <ShieldCheck className="w-4 h-4 text-amber-600" />;
      case "verified":
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case "reopened":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case "critical_reported":
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div
      id={id || "notification-center-drawer"}
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-2xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl border-l border-slate-200 flex flex-col z-50 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Civic Notifications
              </h3>
              <p className="text-[11px] text-slate-500">
                {unreadCount > 0 ? `${unreadCount} unread update(s)` : "All caught up"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
          {safeNotifications.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No recent notifications to display.
            </div>
          ) : (
            safeNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.isRead) handleMarkAsRead(notif.id);
                  if (notif.issueId) {
                    onSelectIssue(notif.issueId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-xl transition-colors cursor-pointer flex items-start gap-3 my-1 ${
                  notif.isRead
                    ? "bg-white hover:bg-slate-50 opacity-80"
                    : "bg-blue-50/50 hover:bg-blue-50 border border-blue-100/80 shadow-2xs"
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200/60">
                      {notif.issueId}
                    </span>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
          Updates reflect live municipal work order transitions and citizen verifications
        </div>
      </div>
    </div>
  );
};
