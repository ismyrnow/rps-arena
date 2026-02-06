interface Props {}

export default function Abandoned(props: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 sm:h-20 sm:w-20 text-warning"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-3xl sm:text-4xl font-bold text-center">
            Opponent left
          </h2>
          <p className="text-lg sm:text-xl text-center text-base-content/70 mb-4">
            Your opponent is no longer in the game
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-lg w-full sm:w-auto"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}
