export default function Connecting() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
            Connecting...
          </h2>
          <p className="text-base-content/70 text-lg sm:text-xl mb-8 text-center">
            Establishing a connection to the server
          </p>
          <span className="loading loading-dots loading-lg"></span>
        </div>
      </div>
    </div>
  );
}
