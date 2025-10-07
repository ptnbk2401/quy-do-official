import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Check admin permissions
  if (session.user?.email !== process.env.ADMIN_EMAIL) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">
            Google Analytics
          </h1>
          <p className="text-gray-400 mt-2">Website performance insights</p>
        </div>

        <AnalyticsDashboard />
      </div>
    </div>
  );
}
