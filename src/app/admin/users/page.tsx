"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import AccessDenied from "@/components/Common/AccessDenied";
import LoadingSkeleton from "@/components/Common/LoadingSkeleton";
import EmptyState from "@/components/Common/EmptyState";
import {
  ArrowRightIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
  ShoppingBagIcon,
  PhoneIcon,
  AtSymbolIcon,
} from "@heroicons/react/24/outline";

interface UserItem {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt: string;
  _count?: {
    orders: number;
  };
}

export default function AdminUsersPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async (query = "") => {
    try {
      setLoading(true);
      const url = query
        ? `/api/users?search=${encodeURIComponent(query)}`
        : "/api/users";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
        setTotalCount(data.totalCount || data.users.length);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <LoadingSkeleton type="card" count={4} />
      </div>
    );
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 py-8">
      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              title="بازگشت به داشبورد"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserGroupIcon className="h-7 w-7 text-emerald-500" />
                مدیریت کاربران ({totalCount})
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                لیست کاربران ثبت‌نام شده از طریق تلگرام و وب‌اپلیکیشن
              </p>
            </div>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-72">
              <input
                type="text"
                placeholder="جستجوی نام، نام کاربری یا تلفن..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pr-10 pl-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 transition focus:border-cyan-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              <MagnifyingGlassIcon className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-cyan-600 px-4 py-2.5 text-xs sm:text-sm font-medium text-white shadow-sm transition hover:bg-cyan-700"
            >
              جستجو
            </button>
          </form>
        </div>

        {/* Users Content */}
        {loading ? (
          <div className="space-y-3">
            <LoadingSkeleton type="card" count={5} />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            title="کاربری یافت نشد"
            description={search ? "با این عبارت کاربری پیدا نشد." : "هنوز کاربری ثبت نام نکرده است."}
            icon={<UserGroupIcon className="h-8 w-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
              const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || "بدون نام";
              const initials = fullName.slice(0, 2);

              return (
                <div
                  key={u.id}
                  className="flex flex-col justify-between rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-base font-bold text-white shadow-sm">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-semibold text-gray-900 dark:text-white">
                          {fullName}
                        </h3>
                        {u.username ? (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <AtSymbolIcon className="h-3.5 w-3.5" />
                            <span>{u.username}</span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            شناسه: {u.telegramId}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-600 dark:border-gray-700/60 dark:text-gray-300">
                      {u.phone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-3.5 w-3.5 text-gray-400" />
                          <span dir="ltr">{u.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
                        <span>عضویت: {new Date(u.createdAt).toLocaleDateString("fa-IR")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs dark:border-gray-700/60">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <ShoppingBagIcon className="h-3.5 w-3.5" />
                      تعداد سفارشات:
                    </span>
                    <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                      {u._count?.orders ?? 0}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
