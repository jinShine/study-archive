export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur z-50">
      <div className="w-16 h-16 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
    </div>
  );
}
