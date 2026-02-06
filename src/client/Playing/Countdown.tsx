export default function Countdown() {
  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-3xl sm:text-4xl font-bold text-center">Get ready!</h2>
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  );
}
