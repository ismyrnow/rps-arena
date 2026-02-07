import Heading from "../shared/Heading";
import Subheading from "../shared/Subheading";

export default function Countdown() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Heading>Get ready!</Heading>
      <Subheading>3... 2... 1...</Subheading>
    </div>
  );
}
