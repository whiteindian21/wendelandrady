"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getNotifications } from "@/lib/notifications";
import { markReadAction, markAllReadAction } from "@/app/dashboard/notifications/actions";
import type { Database } from "@/lib/database.types";

type Notification = Database["public"]["Tables"]["notifications"]["Row"];

export function NotificationBell({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [open, setOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read_at).length;

  return (
    <div className="relative">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border rounded-lg shadow-lg z-50">
          <div className="p-2 border-b flex justify-between items-center">
            <span className="font-medium text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={async () => {
                await markAllReadAction();
                const fresh = await getNotifications(notifications[0]?.user_id || "");
                setNotifications(fresh);
              }}>
                Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-3 border-b cursor-pointer hover:bg-muted/50 ${!n.read_at ? 'bg-primary/5' : ''}`}
                  onClick={async () => {
                    if (!n.read_at) {
                      await markReadAction(n.id);
                      setNotifications(prev => prev.map(x => x.id === n.id ? {...x, read_at: new Date().toISOString()} : x));
                    }
                    if (n.action_url) window.location.href = n.action_url;
                  }}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}