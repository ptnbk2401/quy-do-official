import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { listMediaFiles } from "@/lib/s3";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch media stats
  let totalMedia = 0;
  let totalImages = 0;
  let totalVideos = 0;
  let awsConfigured = true;

  // Check if AWS is configured
  if (
    !process.env.AWS_ACCESS_KEY_ID ||
    !process.env.AWS_SECRET_ACCESS_KEY ||
    !process.env.AWS_S3_BUCKET_NAME
  ) {
    awsConfigured = false;
  } else {
    try {
      const files = await listMediaFiles();
      totalMedia = files.length;

      files.forEach((file) => {
        const fileName = file.Key || "";
        if (/\.(mp4|mov|avi|webm)$/i.test(fileName)) {
          totalVideos++;
        } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
          totalImages++;
        }
      });
    } catch (error) {
      console.error("Failed to fetch media stats:", error);
      awsConfigured = false;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#DA291C]">Dashboard</h1>
          <p className="text-gray-400 mt-2">Tổng quan hệ thống</p>
        </div>

        {/* User Info */}
        <div className="bg-[#1C1C1C] p-6 rounded-lg mb-8">
          <p className="text-gray-400">
            Logged in as:{" "}
            <span className="text-white font-semibold">
              {session.user?.email}
            </span>
          </p>
        </div>

        {/* AWS Configuration Warning */}
        {!awsConfigured && (
          <div className="mb-8 p-6 bg-yellow-900/20 border border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-yellow-500 font-semibold mb-1">
                  ⚠️ AWS S3 Not Configured
                </p>
                <p className="text-yellow-200 text-sm mb-2">
                  Upload functionality requires AWS S3 configuration. Please set
                  up your AWS credentials.
                </p>
                <div className="text-yellow-200 text-sm space-y-1">
                  <p>Missing environment variables:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    {!process.env.AWS_ACCESS_KEY_ID && (
                      <li>AWS_ACCESS_KEY_ID</li>
                    )}
                    {!process.env.AWS_SECRET_ACCESS_KEY && (
                      <li>AWS_SECRET_ACCESS_KEY</li>
                    )}
                    {!process.env.AWS_S3_BUCKET_NAME && (
                      <li>AWS_S3_BUCKET_NAME</li>
                    )}
                  </ul>
                </div>
                <p className="text-yellow-200 text-sm mt-3">
                  📖 Check{" "}
                  <code className="bg-black/30 px-2 py-1 rounded">
                    QUICK_START.md
                  </code>{" "}
                  for setup instructions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#1C1C1C] p-6 rounded-lg border-l-4 border-[#DA291C]">
            <h3 className="text-3xl font-bold text-[#DA291C] mb-2">
              {totalMedia}
            </h3>
            <p className="text-gray-400">Total Media</p>
          </div>
          <div className="bg-[#1C1C1C] p-6 rounded-lg border-l-4 border-[#FBE122]">
            <h3 className="text-3xl font-bold text-[#FBE122] mb-2">
              {totalImages}
            </h3>
            <p className="text-gray-400">Images</p>
          </div>
          <div className="bg-[#1C1C1C] p-6 rounded-lg border-l-4 border-[#DA291C]">
            <h3 className="text-3xl font-bold text-[#DA291C] mb-2">
              {totalVideos}
            </h3>
            <p className="text-gray-400">Videos</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-[#1C1C1C] p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/upload"
              className="bg-[#DA291C] hover:bg-[#FBE122] hover:text-black px-6 py-4 rounded-lg transition-colors flex items-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div className="text-left">
                <p className="font-semibold">Upload Media</p>
                <p className="text-sm opacity-80">Add new images or videos</p>
              </div>
            </Link>

            <Link
              href="/admin/media"
              className="bg-[#2E2E2E] hover:bg-[#DA291C] px-6 py-4 rounded-lg transition-colors flex items-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="text-left">
                <p className="font-semibold">Manage Media</p>
                <p className="text-sm opacity-80">View, delete, copy links</p>
              </div>
            </Link>

            <Link
              href="/admin/homepage"
              className="bg-[#2E2E2E] hover:bg-[#DA291C] px-6 py-4 rounded-lg transition-colors flex items-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <div className="text-left">
                <p className="font-semibold">Homepage Settings</p>
                <p className="text-sm opacity-80">Customize landing page</p>
              </div>
            </Link>
            <Link
              href="/admin/dashboard/analytics"
              className="bg-[#2E2E2E] hover:bg-[#DA291C] px-6 py-4 rounded-lg transition-colors flex items-center gap-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <div className="text-left">
                <p className="font-semibold">Google Analytics</p>
                <p className="text-sm opacity-80">
                  Website performance insights
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
