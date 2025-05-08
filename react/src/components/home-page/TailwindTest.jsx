export default function TailwindTest() {
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">Tailwind Test</h1>
      <p className="text-gray-700 mb-6">This is a test component with Tailwind CSS classes</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-500 text-white p-4 rounded-lg shadow">Green Box</div>
        <div className="bg-purple-500 text-white p-4 rounded-lg shadow">Purple Box</div>
      </div>
      <button className="mt-6 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Test Button
      </button>
    </div>
  );
} 