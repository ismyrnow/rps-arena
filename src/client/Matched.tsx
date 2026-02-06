interface Props {}

export default function Matched(props: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 sm:h-20 sm:w-20 text-success"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
              clipRule="evenodd"
            />
          </svg>
          <h2 className="text-3xl sm:text-4xl font-bold text-center">
            Match found!
          </h2>
          <p className="text-lg sm:text-xl text-center text-base-content/70">
            Get ready to battle!
          </p>
          <span className="loading loading-spinner loading-lg mt-4"></span>
        </div>
      </div>
    </div>
  );
}
